import { Field, Int, ObjectType } from '@nestjs/graphql';
import { ObjectId } from 'mongoose';
import { DoctorStatus, Specialization } from '../../enums/doctor.enum';
import { Member, TotalCounter } from '../member/member';
import { Hospital } from '../hospital/hospital';

@ObjectType()
export class Doctor {
	@Field(() => String)
	_id: ObjectId;

	@Field(() => String)
	memberId: ObjectId;

	@Field(() => String, { nullable: true })
	hospitalId?: ObjectId;

	@Field(() => DoctorStatus)
	doctorStatus: DoctorStatus;

	@Field(() => Specialization)
	specialization: Specialization;

	@Field(() => String)
	licenseNumber: string;

	@Field(() => Int)
	experienceYears: number;

	@Field(() => Int)
	consultationFee: number;

	@Field(() => String, { nullable: true })
	education?: string;

	@Field(() => String, { nullable: true })
	certificates?: string;

	@Field(() => Int)
	doctorRank: number;

	@Field(() => Int)
	doctorViews: number;

	@Field(() => Date, { nullable: true })
	deletedAt?: Date;

	@Field(() => Date)
	createdAt: Date;

	@Field(() => Date)
	updatedAt: Date;

	// from aggregate //
	@Field(() => Member, { nullable: true })
	memberData?: Member;

	@Field(() => Hospital, { nullable: true })
	hospitalData?: Hospital;
}

@ObjectType()
export class Doctors {
	@Field(() => [Doctor])
	list: Doctor[];

	@Field(() => [TotalCounter], { nullable: true })
	metaCounter: TotalCounter[];
}
