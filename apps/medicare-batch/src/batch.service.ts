import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Member } from 'apps/medicare-api/src/libs/dto/member/member';
import { Hospital } from 'apps/medicare-api/src/libs/dto/hospital/hospital';
import { Doctor } from 'apps/medicare-api/src/libs/dto/doctor/doctor';
import { HospitalStatus } from 'apps/medicare-api/src/libs/enums/hospital.enum';
import { MemberStatus, MemberType } from 'apps/medicare-api/src/libs/enums/member.enum';
import { DoctorStatus } from 'apps/medicare-api/src/libs/enums/doctor.enum';
@Injectable()
export class BatchService {
	constructor(
		@InjectModel('Hospital') private readonly hospitalModel: Model<Hospital>,
		@InjectModel('Member') private readonly memberModel: Model<Member>,
		@InjectModel('Doctor') private readonly doctorModel: Model<Doctor>,
	) {}
	public async batchRollback(): Promise<void> {
		await this.hospitalModel
			.updateMany(
				{
					hospitalStatus: HospitalStatus.ACTIVE,
				},
				{ hospitalRank: 0 },
			)
			.exec();

		await this.memberModel
			.updateMany(
				{
					memberStatus: MemberStatus.ACTIVE,
					memberType: MemberType.DOCTOR,
				},
				{ memberRank: 0 },
			)
			.exec();

		await this.doctorModel
			.updateMany(
				{
					doctorStatus: DoctorStatus.ACTIVE,
				},
				{ doctorRank: 0 },
			)
			.exec();
	}

	public async batchHospitals(): Promise<void> {
		const hospitals: Hospital[] = await this.hospitalModel
			.find({
				hospitalStatus: HospitalStatus.ACTIVE,
				hospitalRank: 0,
			})
			.exec();

		const promisedList = hospitals.map(async (ele: Hospital) => {
			const { _id, hospitalLikes, hospitalViews } = ele;
			const rank = hospitalLikes * 2 + hospitalViews * 1;
			return await this.hospitalModel.findByIdAndUpdate(_id, { hospitalRank: rank });
		});
		await Promise.all(promisedList);
	}

	public async batchAgents(): Promise<void> {
		const agents: Member[] = await this.memberModel
			.find({
				memberType: MemberType.DOCTOR,
				memberStatus: MemberStatus.ACTIVE,
				memberRank: 0,
			})
			.exec();

		const promisedList = agents.map(async (ele: Member) => {
			const { _id, memberHospitals, memberLikes, memberArticles, memberViews } = ele;
			const rank = memberHospitals * 4 + memberArticles * 3 + memberLikes * 2 + memberViews * 1;
			return await this.memberModel.findByIdAndUpdate(_id, { memberRank: rank });
		});

		await Promise.all(promisedList);
	}

	public async batchDoctors(): Promise<void> {
		const doctors: Doctor[] = await this.doctorModel
			.find({
				doctorStatus: DoctorStatus.ACTIVE,
				doctorRank: 0,
			})
			.exec();

		const promisedList = doctors.map(async (ele: Doctor) => {
			const { _id, doctorViews } = ele;
			const rank = doctorViews * 1;
			return await this.doctorModel.findByIdAndUpdate(_id, { doctorRank: rank });
		});

		await Promise.all(promisedList);
	}

	getHello(): string {
		return 'Welcome to Medi-care BATCH server!';
	}
}
