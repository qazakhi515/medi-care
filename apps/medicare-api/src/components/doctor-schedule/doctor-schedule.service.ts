import { BadRequestException, ForbiddenException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId } from 'mongoose';
import { DoctorSchedule, DoctorSchedules } from '../../libs/dto/doctor-schedule/doctor-schedule';
import { DoctorScheduleInput, DoctorSchedulesInquiry } from '../../libs/dto/doctor-schedule/doctor-schedule.input';
import { DoctorScheduleUpdate } from '../../libs/dto/doctor-schedule/doctor-schedule.update';
import { Doctor } from '../../libs/dto/doctor/doctor';
import { Direction, Message } from '../../libs/enums/common.enum';
import { ScheduleStatus } from '../../libs/enums/schedule.enum';
import { T } from '../../libs/types/common';
import { shapeIntoMongoObjectId } from '../../libs/config';

@Injectable()
export class DoctorScheduleService {
	constructor(
		@InjectModel('DoctorSchedule') private readonly doctorScheduleModel: Model<DoctorSchedule>,
		@InjectModel('Doctor') private readonly doctorModel: Model<Doctor>,
	) {}

	public async createDoctorSchedule(memberId: ObjectId, input: DoctorScheduleInput): Promise<DoctorSchedule> {
		await this.assertScheduleOwnership(memberId, input.doctorId);

		try {
			return await this.doctorScheduleModel.create(input);
		} catch (err) {
			console.log('Error, Service.model:', err);
			throw new BadRequestException(Message.CREATE_FAILED);
		}
	}

	public async getDoctorSchedules(input: DoctorSchedulesInquiry): Promise<DoctorSchedules> {
		const match: T = { scheduleStatus: { $ne: ScheduleStatus.DELETE } };
		const sort: T = { [input?.sort ?? 'createdAt']: input?.direction ?? Direction.DESC };

		const { doctorId, dayOfWeek, scheduleStatus } = input.search;
		if (doctorId) match.doctorId = shapeIntoMongoObjectId(doctorId);
		if (dayOfWeek) match.dayOfWeek = dayOfWeek;
		if (scheduleStatus) match.scheduleStatus = scheduleStatus;

		const result = await this.doctorScheduleModel
			.aggregate([
				{ $match: match },
				{ $sort: sort },
				{
					$facet: {
						list: [{ $skip: (input.page - 1) * input.limit }, { $limit: input.limit }],
						metaCounter: [{ $count: 'total' }],
					},
				},
			])
			.exec();

		if (!result.length) throw new InternalServerErrorException(Message.NO_DATA_FOUND);
		return result[0];
	}

	public async updateDoctorSchedule(memberId: ObjectId, input: DoctorScheduleUpdate): Promise<DoctorSchedule> {
		const target = await this.doctorScheduleModel.findById(input._id).exec();
		if (!target) throw new InternalServerErrorException(Message.NO_DATA_FOUND);

		await this.assertScheduleOwnership(memberId, target.doctorId);

		const result = await this.doctorScheduleModel.findByIdAndUpdate(input._id, input, { new: true }).exec();
		if (!result) throw new InternalServerErrorException(Message.UPDATE_FAILED);

		return result;
	}

	public async removeDoctorSchedule(memberId: ObjectId, scheduleId: ObjectId): Promise<DoctorSchedule> {
		const target = await this.doctorScheduleModel.findById(scheduleId).exec();
		if (!target) throw new InternalServerErrorException(Message.NO_DATA_FOUND);

		await this.assertScheduleOwnership(memberId, target.doctorId);

		const result = await this.doctorScheduleModel.findByIdAndDelete(scheduleId).exec();
		if (!result) throw new InternalServerErrorException(Message.REMOVE_FAILED);

		return result;
	}

	private async assertScheduleOwnership(memberId: ObjectId, doctorId: ObjectId): Promise<void> {
		const doctor = await this.doctorModel.findOne({ _id: doctorId, memberId: memberId }).exec();
		if (!doctor) throw new ForbiddenException(Message.DOCTOR_PROFILE_REQUIRED);
	}
}
