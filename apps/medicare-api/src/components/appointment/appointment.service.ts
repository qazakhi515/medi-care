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

@Injectable()
export class AppointmentService {
	constructor(
		@InjectModel('Appointment') private readonly appointmentModel: Model<Appointment>,
		@InjectModel('Doctor') private readonly doctorModel: Model<Doctor>,
	) {}

	public async createAppointment(input: AppointmentInput): Promise<Appointment> {
		const doctor = await this.doctorModel
			.findOne({ _id: input.doctorId, doctorStatus: DoctorStatus.ACTIVE })
			.exec();
		if (!doctor) throw new InternalServerErrorException(Message.NO_DATA_FOUND);

		const slotTaken = await this.appointmentModel
			.findOne({
				doctorId: input.doctorId,
				appointmentDate: input.appointmentDate,
				startTime: input.startTime,
				appointmentStatus: { $in: [AppointmentStatus.PENDING, AppointmentStatus.CONFIRMED] },
			})
			.exec();
		if (slotTaken) throw new BadRequestException(Message.BOOKING_SLOT_TAKEN);

		try {
			return await this.appointmentModel.create(input);
		} catch (err) {
			console.log('Error, Service.model:', err);
			throw new BadRequestException(Message.CREATE_FAILED);
		}
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
