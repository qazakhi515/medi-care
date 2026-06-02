import { Field, InputType, Int } from '@nestjs/graphql';
import { IsNotEmpty, IsOptional, Length, Min } from 'class-validator';
import { ObjectId } from 'mongoose';
import { BloodType, Gender } from '../../enums/patient-profile.enum';
import { Direction } from '../../enums/common.enum';

@InputType()
export class PatientProfileInput {
	@IsOptional()
	@Field(() => Date, { nullable: true })
	birthDate?: Date;

	@IsOptional()
	@Field(() => Gender, { nullable: true })
	gender?: Gender;

	@IsOptional()
	@Field(() => BloodType, { nullable: true })
	bloodType?: BloodType;

	@IsOptional()
	@Length(3, 500)
	@Field(() => String, { nullable: true })
	chronicDiseases?: string;

	@IsOptional()
	@Length(3, 100)
	@Field(() => String, { nullable: true })
	emergencyContact?: string;

	memberId?: ObjectId;
}

@InputType()
class PPISearch {
	@IsOptional()
	@Field(() => Gender, { nullable: true })
	gender?: Gender;

	@IsOptional()
	@Field(() => BloodType, { nullable: true })
	bloodType?: BloodType;
}

@InputType()
export class PatientProfilesInquiry {
	@IsNotEmpty()
	@Min(1)
	@Field(() => Int)
	page: number;

	@IsNotEmpty()
	@Min(1)
	@Field(() => Int)
	limit: number;

	@IsOptional()
	@Field(() => Direction, { nullable: true })
	direction?: Direction;

	@IsNotEmpty()
	@Field(() => PPISearch)
	search: PPISearch;
}
