import { Field, InputType, Int } from '@nestjs/graphql';
import { IsInt, IsNotEmpty, IsOptional, Length, Min } from 'class-validator';
import { ObjectId } from 'mongoose';
import { DoctorStatus, Specialization } from '../../enums/doctor.enum';

@InputType()
export class DoctorUpdate {
	@IsNotEmpty()
	@Field(() => String)
	_id: ObjectId;

	@IsOptional()
	@Field(() => DoctorStatus, { nullable: true })
	doctorStatus?: DoctorStatus;

	@IsOptional()
	@Field(() => Specialization, { nullable: true })
	specialization?: Specialization;

	@IsOptional()
	@Length(3, 50)
	@Field(() => String, { nullable: true })
	licenseNumber?: string;

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

	deletedAt?: Date;
}
