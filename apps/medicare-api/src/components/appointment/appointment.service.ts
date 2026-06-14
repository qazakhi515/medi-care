import { BadRequestException, ForbiddenException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId } from 'mongoose';
import { Appointment, Appointments } from '../../libs/dto/appointment/appointment';
import { AppointmentInput, AppointmentsInquiry } from '../../libs/dto/appointment/appointment.input';
import { AppointmentUpdate } from '../../libs/dto/appointment/appointment.update';
import { Doctor } from '../../libs/dto/doctor/doctor';
import { Direction, Message } from '../../libs/enums/common.enum';
import { AppointmentStatus } from '../../libs/enums/appointment.enum';
import { DoctorStatus } from '../../libs/enums/doctor.enum';
import { T } from '../../libs/types/common';
import { lookupDoctor, lookupPatient, shapeIntoMongoObjectId } from '../../libs/config';
import { NotificationService } from '../notification/notification.service';
import { NotificationGroup, NotificationType } from '../../libs/enums/notification.enum';
import { DoctorAvailability, TimeSlot } from '../../libs/dto/appointment/availability';

// Fallbacks for doctors created before the schedule fields existed.
const DEFAULT_WORKING_DAYS = [1, 2, 3, 4, 5];
const DEFAULT_WORK_START = '09:00';
const DEFAULT_WORK_END = '17:00';
const DEFAULT_SLOT_DURATION = 30;

const toMinutes = (time: string): number => {
	const [h, m] = time.split(':').map(Number);
	return h * 60 + m;
};

const toTimeString = (total: number): string => {
	const h = Math.floor(total / 60);
	const m = total % 60;
	return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
};

const buildSlots = (start: string, end: string, duration: number): TimeSlot[] => {
	const slots: TimeSlot[] = [];
	for (let t = toMinutes(start); t + duration <= toMinutes(end); t += duration) {
		slots.push({ startTime: toTimeString(t), endTime: toTimeString(t + duration) });
	}
	return slots;
};

@Injectable()
export class AppointmentService {
	constructor(
		@InjectModel('Appointment') private readonly appointmentModel: Model<Appointment>,
		@InjectModel('Doctor') private readonly doctorModel: Model<Doctor>,
		private readonly notificationService: NotificationService,
	) {}

	public async createAppointment(input: AppointmentInput): Promise<Appointment> {
		const doctor = await this.doctorModel
			.findOne({ _id: input.doctorId, doctorStatus: DoctorStatus.ACTIVE })
			.exec();
		if (!doctor) throw new InternalServerErrorException(Message.NO_DATA_FOUND);

		// The requested slot must belong to the doctor's working schedule.
		const { workingDays, workStart, workEnd, slotDuration } = this.resolveSchedule(doctor);
		if (!workingDays.includes(new Date(input.appointmentDate).getDay())) {
			throw new BadRequestException(Message.DOCTOR_NOT_AVAILABLE);
		}
		const isValidSlot = buildSlots(workStart, workEnd, slotDuration).some(
			(s) => s.startTime === input.startTime && s.endTime === input.endTime,
		);
		if (!isValidSlot) throw new BadRequestException(Message.SLOT_OUTSIDE_SCHEDULE);

		const slotTaken = await this.appointmentModel
			.findOne({
				doctorId: input.doctorId,
				appointmentDate: input.appointmentDate,
				startTime: input.startTime,
				appointmentStatus: { $in: [AppointmentStatus.PENDING, AppointmentStatus.CONFIRMED] },
			})
			.exec();
		if (slotTaken) throw new BadRequestException(Message.BOOKING_SLOT_TAKEN);

		let appointment: Appointment;
		try {
			appointment = await this.appointmentModel.create(input);
		} catch (err) {
			console.log('Error, Service.model:', err);
			throw new BadRequestException(Message.CREATE_FAILED);
		}

		// Notifications: bemorga (tasdiq) + doktorga (yangi uchrashuv).
		// Notification xatosi band qilishni buzmasligi uchun alohida try/catch.
		try {
			await this.notificationService.createNotification({
				notificationType: NotificationType.APPOINTMENT,
				notificationGroup: NotificationGroup.APPOINTMENT,
				notificationTitle: 'New appointment booked',
				notificationDesc: `A new appointment was booked for ${appointment.startTime} - ${appointment.endTime}.`,
				authorId: input.patientId,
				receiverId: doctor.memberId,
			});
			await this.notificationService.createNotification({
				notificationType: NotificationType.APPOINTMENT,
				notificationGroup: NotificationGroup.APPOINTMENT,
				notificationTitle: 'Appointment requested',
				notificationDesc: `Your appointment for ${appointment.startTime} - ${appointment.endTime} has been requested.`,
				authorId: input.patientId,
				receiverId: input.patientId,
			});
		} catch (err) {
			console.log('Error, appointment notification:', err);
		}

		return appointment;
	}

	public async getDoctorAvailability(doctorId: ObjectId, date: Date): Promise<DoctorAvailability> {
		const doctor = await this.doctorModel
			.findOne({ _id: doctorId, doctorStatus: DoctorStatus.ACTIVE })
			.lean()
			.exec();
		if (!doctor) throw new InternalServerErrorException(Message.NO_DATA_FOUND);

		const { workingDays, workStart, workEnd, slotDuration } = this.resolveSchedule(doctor);
		const target = new Date(date);

		if (!workingDays.includes(target.getDay())) {
			return { doctorId: String(doctorId), date: target, isWorkingDay: false, slots: [] };
		}

		// Booked slots for that calendar day (PENDING/CONFIRMED block the slot).
		const dayStart = new Date(target);
		dayStart.setHours(0, 0, 0, 0);
		const dayEnd = new Date(target);
		dayEnd.setHours(23, 59, 59, 999);

		const booked = await this.appointmentModel
			.find({
				doctorId,
				appointmentDate: { $gte: dayStart, $lte: dayEnd },
				appointmentStatus: { $in: [AppointmentStatus.PENDING, AppointmentStatus.CONFIRMED] },
			})
			.lean()
			.exec();
		const takenStartTimes = new Set(booked.map((a) => a.startTime));

		// Drop slots that are already in the past when the requested day is today.
		const now = new Date();
		const isToday = now.toDateString() === target.toDateString();
		const nowMinutes = now.getHours() * 60 + now.getMinutes();

		const slots = buildSlots(workStart, workEnd, slotDuration).filter((s) => {
			if (takenStartTimes.has(s.startTime)) return false;
			if (isToday && toMinutes(s.startTime) <= nowMinutes) return false;
			return true;
		});

		return { doctorId: String(doctorId), date: target, isWorkingDay: true, slots };
	}

	private resolveSchedule(doctor: Doctor): {
		workingDays: number[];
		workStart: string;
		workEnd: string;
		slotDuration: number;
	} {
		return {
			workingDays: doctor.workingDays?.length ? doctor.workingDays : DEFAULT_WORKING_DAYS,
			workStart: doctor.workStartTime ?? DEFAULT_WORK_START,
			workEnd: doctor.workEndTime ?? DEFAULT_WORK_END,
			slotDuration: doctor.slotDuration ?? DEFAULT_SLOT_DURATION,
		};
	}

	public async getAppointment(memberId: ObjectId, appointmentId: ObjectId): Promise<Appointment> {
		const target: Appointment = await this.appointmentModel.findById(appointmentId).lean().exec();
		if (!target) throw new InternalServerErrorException(Message.NO_DATA_FOUND);

		await this.assertAppointmentAccess(memberId, target);
		return target;
	}

	public async getAppointments(input: AppointmentsInquiry): Promise<Appointments> {
		const match: T = {};
		const sort: T = { [input?.sort ?? 'createdAt']: input?.direction ?? Direction.DESC };

		const { doctorId, patientId, appointmentStatus, periodsRange } = input.search;
		if (doctorId) match.doctorId = shapeIntoMongoObjectId(doctorId);
		if (patientId) match.patientId = shapeIntoMongoObjectId(patientId);
		if (appointmentStatus) match.appointmentStatus = appointmentStatus;
		if (periodsRange) match.appointmentDate = { $gte: periodsRange.start, $lte: periodsRange.end };

		const result = await this.appointmentModel
			.aggregate([
				{ $match: match },
				{ $sort: sort },
				{
					$facet: {
						list: [
							{ $skip: (input.page - 1) * input.limit },
							{ $limit: input.limit },
							lookupPatient,
							{ $unwind: '$patientData' },
							lookupDoctor,
							{ $unwind: '$doctorData' },
						],
						metaCounter: [{ $count: 'total' }],
					},
				},
			])
			.exec();

		if (!result.length) throw new InternalServerErrorException(Message.NO_DATA_FOUND);
		return result[0];
	}

	public async updateAppointment(memberId: ObjectId, input: AppointmentUpdate): Promise<Appointment> {
		const target: Appointment = await this.appointmentModel.findById(input._id).lean().exec();
		if (!target) throw new InternalServerErrorException(Message.NO_DATA_FOUND);

		await this.assertAppointmentAccess(memberId, target);

		if (input.appointmentStatus === AppointmentStatus.CANCELLED && !input.cancellationReason) {
			throw new BadRequestException(Message.BAD_REQUEST);
		}

		const result = await this.appointmentModel.findByIdAndUpdate(input._id, input, { new: true }).exec();
		if (!result) throw new InternalServerErrorException(Message.UPDATE_FAILED);

		return result;
	}

	public async removeAppointmentByAdmin(appointmentId: ObjectId): Promise<Appointment> {
		const result = await this.appointmentModel.findByIdAndDelete(appointmentId).exec();
		if (!result) throw new InternalServerErrorException(Message.REMOVE_FAILED);

		return result;
	}

	private async assertAppointmentAccess(memberId: ObjectId, appointment: Appointment): Promise<void> {
		if (String(appointment.patientId) === String(memberId)) return;

		const owningDoctor = await this.doctorModel
			.findOne({ _id: appointment.doctorId, memberId: memberId })
			.exec();
		if (!owningDoctor) throw new ForbiddenException(Message.NOT_ALLOWED_REQUEST);
	}
}
