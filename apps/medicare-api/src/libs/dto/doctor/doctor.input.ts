import { Field, InputType, Int } from '@nestjs/graphql';
import { IsIn, IsInt, IsNotEmpty, IsOptional, Length, Min } from 'class-validator';
import { ObjectId } from 'mongoose';
import { DoctorStatus, Specialization } from '../../enums/doctor.enum';
import { availableDoctorSorts } from '../../config';
import { Direction } from '../../enums/common.enum';

@InputType()
export class DoctorInput {
	@IsNotEmpty()
	@Field(() => Specialization)
	specialization: Specialization;

	@IsNotEmpty()
	@Length(3, 50)
	@Field(() => String)
	licenseNumber: string;

	@IsOptional()
	@IsInt()
	@Min(0)
	@Field(() => Int, { nullable: true })
	experienceYears?: number;

	@IsOptional()
	@IsInt()
	@Min(0)
	@Field(() => Int, { nullable: true })
	consultationFee?: number;

	@IsOptional()
	@Length(3, 500)
	@Field(() => String, { nullable: true })
	education?: string;

	@IsOptional()
	@Length(3, 500)
	@Field(() => String, { nullable: true })
	certificates?: string;

	@IsOptional()
	@Field(() => String, { nullable: true })
	hospitalId?: ObjectId;

	memberId?: ObjectId;
}

@InputType()
class DISearch {
	@IsOptional()
	@Field(() => DoctorStatus, { nullable: true })
	doctorStatus?: DoctorStatus;

	@IsOptional()
	@Field(() => [Specialization], { nullable: true })
	specializationList?: Specialization[];

	@IsOptional()
	@Field(() => String, { nullable: true })
	hospitalId?: ObjectId;

	@IsOptional()
	@Field(() => String, { nullable: true })
	text?: string;
}

@InputType()
export class DoctorsInquiry {
	@IsNotEmpty()
	@Min(1)
	@Field(() => Int)
	page: number;

	@IsNotEmpty()
	@Min(1)
	@Field(() => Int)
	limit: number;

	@IsOptional()
	@IsIn(availableDoctorSorts)
	@Field(() => String, { nullable: true })
	sort?: string;

	@IsOptional()
	@Field(() => Direction, { nullable: true })
	direction?: Direction;

	@IsNotEmpty()
	@Field(() => DISearch)
	search: DISearch;
}

@InputType()
class ADISearch {
	@IsOptional()
	@Field(() => DoctorStatus, { nullable: true })
	doctorStatus?: DoctorStatus;

	@IsOptional()
	@Field(() => [Specialization], { nullable: true })
	specializationList?: Specialization[];
}

@InputType()
export class AllDoctorsInquiry {
	@IsNotEmpty()
	@Min(1)
	@Field(() => Int)
	page: number;

	@IsNotEmpty()
	@Min(1)
	@Field(() => Int)
	limit: number;

	@IsOptional()
	@IsIn(availableDoctorSorts)
	@Field(() => String, { nullable: true })
	sort?: string;

	@IsOptional()
	@Field(() => Direction, { nullable: true })
	direction?: Direction;

	@IsNotEmpty()
	@Field(() => ADISearch)
	search: ADISearch;
}
