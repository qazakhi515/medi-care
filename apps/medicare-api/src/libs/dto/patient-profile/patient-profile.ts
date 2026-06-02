import { Field, ObjectType } from '@nestjs/graphql';
import { ObjectId } from 'mongoose';
import { BloodType, Gender } from '../../enums/patient-profile.enum';
import { Member, TotalCounter } from '../member/member';

@ObjectType()
export class PatientProfile {
	@Field(() => String)
	_id: ObjectId;

	@Field(() => String)
	memberId: ObjectId;

	@Field(() => Date, { nullable: true })
	birthDate?: Date;

	@Field(() => Gender, { nullable: true })
	gender?: Gender;

	@Field(() => BloodType, { nullable: true })
	bloodType?: BloodType;

	@Field(() => String, { nullable: true })
	chronicDiseases?: string;

	@Field(() => String, { nullable: true })
	emergencyContact?: string;

	@Field(() => Date)
	createdAt: Date;

	@Field(() => Date)
	updatedAt: Date;

	// from aggregate //
	@Field(() => Member, { nullable: true })
	memberData?: Member;
}

@ObjectType()
export class PatientProfiles {
	@Field(() => [PatientProfile])
	list: PatientProfile[];

	@Field(() => [TotalCounter], { nullable: true })
	metaCounter: TotalCounter[];
}
