import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId } from 'mongoose';
import { PatientProfile, PatientProfiles } from '../../libs/dto/patient-profile/patient-profile';
import { PatientProfileInput, PatientProfilesInquiry } from '../../libs/dto/patient-profile/patient-profile.input';
import { PatientProfileUpdate } from '../../libs/dto/patient-profile/patient-profile.update';
import { Direction, Message } from '../../libs/enums/common.enum';
import { T } from '../../libs/types/common';
import { lookupMember } from '../../libs/config';

@Injectable()
export class PatientProfileService {
	constructor(@InjectModel('PatientProfile') private readonly patientProfileModel: Model<PatientProfile>) {}

	public async createPatientProfile(input: PatientProfileInput): Promise<PatientProfile> {
		const existing = await this.patientProfileModel.findOne({ memberId: input.memberId }).exec();
		if (existing) throw new BadRequestException(Message.PROFILE_ALREADY_EXISTS);

		try {
			return await this.patientProfileModel.create(input);
		} catch (err) {
			console.log('Error, Service.model:', err);
			throw new BadRequestException(Message.CREATE_FAILED);
		}
	}

	public async getPatientProfile(memberId: ObjectId): Promise<PatientProfile> {
		const target: PatientProfile = await this.patientProfileModel.findOne({ memberId: memberId }).lean().exec();
		if (!target) throw new InternalServerErrorException(Message.NO_DATA_FOUND);

		return target;
	}

	public async updatePatientProfile(memberId: ObjectId, input: PatientProfileUpdate): Promise<PatientProfile> {
		const result = await this.patientProfileModel
			.findOneAndUpdate({ memberId: memberId }, input, { new: true })
			.exec();
		if (!result) throw new InternalServerErrorException(Message.UPDATE_FAILED);

		return result;
	}

	public async getAllPatientProfilesByAdmin(input: PatientProfilesInquiry): Promise<PatientProfiles> {
		const match: T = {};
		const sort: T = { createdAt: input?.direction ?? Direction.DESC };

		const { gender, bloodType } = input.search;
		if (gender) match.gender = gender;
		if (bloodType) match.bloodType = bloodType;

		const result = await this.patientProfileModel
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
}
