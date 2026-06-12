import { Field, InputType, Int } from '@nestjs/graphql';
import { IsNotEmpty, IsOptional, Length, ValidateIf } from 'class-validator';
import { HospitalLocation, HospitalStatus, HospitalType } from '../../enums/hospital.enum';
import { ObjectId } from 'mongoose';

@InputType()
export class HospitalUpdate {
	@IsNotEmpty()
	@Field(() => String)
	_id: ObjectId;

	@IsOptional()
	@Field(() => HospitalType, { nullable: true })
	hospitalType?: HospitalType;

	@IsOptional()
	@Field(() => HospitalStatus, { nullable: true })
	hospitalStatus?: HospitalStatus;

	@IsOptional()
	@Field(() => HospitalLocation, { nullable: true })
	hospitalLocation?: HospitalLocation;

	@IsOptional()
	@Length(3, 100)
	@Field(() => String, { nullable: true })
	hospitalAddress?: string;

	@IsOptional()
	@Length(3, 100)
	@Field(() => String, { nullable: true })
	hospitalTitle?: string;

	@IsOptional()
	@Field(() => Number, { nullable: true })
	hospitalPrice?: number;

	@IsOptional()
	@Field(() => Number, { nullable: true })
	hospitalSquare?: number;
	@IsOptional()
	@Field(() => Int, { nullable: true })
	hospitalBeds?: number;

	@IsOptional()
	@Field(() => Int, { nullable: true })
	hospitalRooms?: number;

	@IsOptional()
	@Field(() => [String], { nullable: true })
	hospitalImages?: string[];

	@IsOptional()
	@ValidateIf((o) => o.hospitalDesc !== '')
	@Length(5, 500)
	@Field(() => String, { nullable: true })
	hospitalDesc?: string;

	@IsOptional()
	@Field(() => Boolean, { nullable: true })
	hospitalBarter?: boolean;

	@IsOptional()
	@Field(() => Boolean, { nullable: true })
	hospitalRent?: boolean;

	deletedAt?: Date;

	@IsOptional()
	@Field(() => Date, { nullable: true })
	constructedAt?: Date;
}
