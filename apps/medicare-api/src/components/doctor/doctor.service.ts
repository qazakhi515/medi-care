import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId } from 'mongoose';
import { Doctor, Doctors } from '../../libs/dto/doctor/doctor';
import { AllDoctorsInquiry, DoctorInput, DoctorsInquiry } from '../../libs/dto/doctor/doctor.input';
import { DoctorUpdate } from '../../libs/dto/doctor/doctor.update';
import { Direction, Message } from '../../libs/enums/common.enum';
import { DoctorStatus } from '../../libs/enums/doctor.enum';
import { StatisticModifier, T } from '../../libs/types/common';
import { MemberService } from '../member/member.service';
import { ViewService } from '../view/view.service';
import { ViewGroup } from '../../libs/enums/view.enum';
import { lookupHospital, lookupMember, shapeIntoMongoObjectId } from '../../libs/config';
import { Hospital } from '../../libs/dto/hospital/hospital';

@Injectable()
export class DoctorService {
	constructor(
		@InjectModel('Doctor') private readonly doctorModel: Model<Doctor>,
		@InjectModel('Hospital') private readonly hospitalModel: Model<Hospital>,
		private readonly memberService: MemberService,
		private readonly viewService: ViewService,
	) {}

	private async assertHospitalExists(hospitalId: ObjectId): Promise<void> {
		const hospital = await this.hospitalModel.findOne({ _id: hospitalId }).lean().exec();
		if (!hospital) throw new BadRequestException(Message.NO_DATA_FOUND);
	}

	public async createDoctor(input: DoctorInput): Promise<Doctor> {
		const existingDoctor = await this.doctorModel.findOne({ memberId: input.memberId }).lean().exec();
		if (existingDoctor) throw new BadRequestException(Message.DOCTOR_PROFILE_ALREADY_EXISTS);

		const usedLicense = await this.doctorModel.findOne({ licenseNumber: input.licenseNumber }).lean().exec();
		if (usedLicense) throw new BadRequestException(Message.LICENSE_ALREADY_EXISTS);

		if (input.hospitalId) {
			input.hospitalId = shapeIntoMongoObjectId(input.hospitalId);
			await this.assertHospitalExists(input.hospitalId);
		}

		try {
			return await this.doctorModel.create(input);
		} catch (err) {
			console.log('Error, Service.model:', err);
			throw new BadRequestException(Message.CREATE_FAILED);
		}
	}

	public async getDoctor(memberId: ObjectId, doctorId: ObjectId): Promise<Doctor> {
		const search: T = {
			_id: doctorId,
			doctorStatus: DoctorStatus.ACTIVE,
		};

		const targetDoctor: Doctor = await this.doctorModel.findOne(search).lean().exec();
		if (!targetDoctor) throw new InternalServerErrorException(Message.NO_DATA_FOUND);

		if (memberId) {
			const viewInput = { memberId: memberId, viewRefId: doctorId, viewGroup: ViewGroup.DOCTOR };
			const newView = await this.viewService.recordView(viewInput);
			if (newView) {
				await this.doctorStatsEditor({ _id: doctorId, targetKey: 'doctorViews', modifier: 1 });
				targetDoctor.doctorViews++;
			}
		}

		targetDoctor.memberData = await this.memberService.getMember(null, targetDoctor.memberId);
		return targetDoctor;
	}

	public async getDoctors(memberId: ObjectId, input: DoctorsInquiry): Promise<Doctors> {
		const match: T = { doctorStatus: DoctorStatus.ACTIVE };
		const sort: T = { [input?.sort ?? 'createdAt']: input?.direction ?? Direction.DESC };

		const { doctorStatus, specializationList, hospitalId, text } = input.search;
		if (doctorStatus) match.doctorStatus = doctorStatus;
		if (specializationList && specializationList.length) match.specialization = { $in: specializationList };
		if (hospitalId) match.hospitalId = shapeIntoMongoObjectId(hospitalId);
		if (text) match.licenseNumber = { $regex: new RegExp(text, 'i') };

		const result = await this.doctorModel
			.aggregate([
				{ $match: match },
				{ $sort: sort },
				{
					$facet: {
						list: [
							{ $skip: (input.page - 1) * input.limit },
							{ $limit: input.limit },
							lookupMember,
							{ $unwind: '$memberData' },
							lookupHospital,
							{ $unwind: { path: '$hospitalData', preserveNullAndEmptyArrays: true } },
						],
						metaCounter: [{ $count: 'total' }],
					},
				},
			])
			.exec();

		if (!result.length) throw new InternalServerErrorException(Message.NO_DATA_FOUND);
		return result[0];
	}

	public async updateDoctor(memberId: ObjectId, input: DoctorUpdate): Promise<Doctor> {
		const { doctorStatus } = input;
		const search: T = {
			_id: input._id,
			memberId: memberId,
			doctorStatus: { $ne: DoctorStatus.DELETE },
		};

		if (doctorStatus === DoctorStatus.DELETE) input.deletedAt = new Date();

		if (input.hospitalId) {
			input.hospitalId = shapeIntoMongoObjectId(input.hospitalId);
			await this.assertHospitalExists(input.hospitalId);
		}

		const result = await this.doctorModel.findOneAndUpdate(search, input, { new: true }).exec();
		if (!result) throw new InternalServerErrorException(Message.UPDATE_FAILED);

		return result;
	}

	public async getAllDoctorsByAdmin(input: AllDoctorsInquiry): Promise<Doctors> {
		const { doctorStatus, specializationList } = input.search;
		const match: T = {};
		const sort: T = { [input?.sort ?? 'createdAt']: input?.direction ?? Direction.DESC };

		if (doctorStatus) match.doctorStatus = doctorStatus;
		if (specializationList && specializationList.length) match.specialization = { $in: specializationList };

		const result = await this.doctorModel
			.aggregate([
				{ $match: match },
				{ $sort: sort },
				{
					$facet: {
						list: [
							{ $skip: (input.page - 1) * input.limit },
							{ $limit: input.limit },
							lookupMember,
							{ $unwind: '$memberData' },
						],
						metaCounter: [{ $count: 'total' }],
					},
				},
			])
			.exec();

		if (!result.length) throw new InternalServerErrorException(Message.NO_DATA_FOUND);
		return result[0];
	}

	public async updateDoctorByAdmin(input: DoctorUpdate): Promise<Doctor> {
		const { doctorStatus } = input;
		const search: T = { _id: input._id, doctorStatus: { $ne: DoctorStatus.DELETE } };

		if (doctorStatus === DoctorStatus.DELETE) input.deletedAt = new Date();

		const result = await this.doctorModel.findOneAndUpdate(search, input, { new: true }).exec();
		if (!result) throw new InternalServerErrorException(Message.UPDATE_FAILED);

		return result;
	}

	public async removeDoctorByAdmin(doctorId: ObjectId): Promise<Doctor> {
		const search: T = { _id: doctorId, doctorStatus: DoctorStatus.DELETE };
		const result = await this.doctorModel.findOneAndDelete(search).exec();
		if (!result) throw new InternalServerErrorException(Message.REMOVE_FAILED);

		return result;
	}

	public async doctorStatsEditor(input: StatisticModifier): Promise<Doctor> {
		const { _id, targetKey, modifier } = input;
		return await this.doctorModel
			.findByIdAndUpdate(_id, { $inc: { [targetKey]: modifier } }, { new: true })
			.exec();
	}
}
