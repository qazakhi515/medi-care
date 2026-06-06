import { Field, InputType, Int } from '@nestjs/graphql';
import { IsIn, IsInt, IsNotEmpty, IsOptional, Length, Min } from 'class-validator';
import { HospitalLocation, HospitalStatus, HospitalType } from '../../enums/hospital.enum';
import { ObjectId } from 'mongoose';
import { availableOptions, availableHospitalSorts } from '../../config';
import { Direction } from '../../enums/common.enum';

@InputType()
export class HospitalInput {
	@IsNotEmpty()
	@Field(() => HospitalType)
	hospitalType: HospitalType;

	@IsNotEmpty()
	@Field(() => HospitalLocation)
	hospitalLocation: HospitalLocation;

	@IsNotEmpty()
	@Length(3, 100)
	@Field(() => String)
	hospitalAddress: string;

	@IsNotEmpty()
	@Length(3, 100)
	@Field(() => String)
	hospitalTitle: string;

	@IsNotEmpty()
	@Field(() => Number)
	@Min(0)
	hospitalPrice: number;

	@IsOptional()
	@Field(() => Number, { nullable: true })
	hospitalSquare?: number;

	@IsOptional()
	@IsInt()
	@Min(1)
	@Field(() => Int, { nullable: true })
	hospitalBeds?: number;

	@IsNotEmpty()
	@IsInt()
	@Min(1)
	@Field(() => Int)
	hospitalRooms: number;

	@IsNotEmpty()
	@Field(() => [String])
	hospitalImages: string[];

	@IsOptional()
	@Length(5, 500)
	@Field(() => String, { nullable: true })
	hospitalDesc?: string;

	@IsOptional()
	@Field(() => Boolean, { nullable: true })
	hospitalBarter?: boolean;

	@IsOptional()
	@Field(() => Boolean, { nullable: true })
	hospitalRent?: boolean;

	memberId?: ObjectId;

	@IsOptional()
	@Field(() => Date, { nullable: true })
	constructedAt?: Date;
}

@InputType()
export class PricesRange {
	@Field(() => Int)
	start: number;

	@Field(() => Int)
	end: number;
}

@InputType()
export class SquaresRange {
	@Field(() => Int)
	start: number;

	@Field(() => Int)
	end: number;
}

@InputType()
export class PeriodsRange {
	@Field(() => Date)
	start: Date;

	@Field(() => Date)
	end: Date;
}

@InputType()
class HISearch {
	@IsOptional()
	@Field(() => String, { nullable: true })
	memberId: ObjectId;

	@IsOptional()
	@Field(() => [HospitalLocation], { nullable: true })
	locationList?: HospitalLocation[];

	@IsOptional()
	@Field(() => [HospitalType], { nullable: true })
	typeList?: HospitalType[];

	@IsOptional()
	@Field(() => [Int], { nullable: true })
	roomsList?: number[];

	@IsOptional()
	@Field(() => [Int], { nullable: true })
	bedsList?: number[];

	@IsOptional()
	@IsIn(availableOptions, { each: true })
	@Field(() => [String], { nullable: true })
	options?: string[];

	@IsOptional()
	@Field(() => PricesRange, { nullable: true })
	pricesRange?: PricesRange;

	@IsOptional()
	@Field(() => PeriodsRange, { nullable: true })
	periodsRange?: PeriodsRange;

	@IsOptional()
	@Field(() => SquaresRange, { nullable: true })
	squaresRange?: SquaresRange;

	@IsOptional()
	@Field(() => SquaresRange, { nullable: true })
	text?: string;
}

@InputType()
export class HospitalsInquiry {
	@IsNotEmpty()
	@Min(1)
	@Field(() => Int)
	page: number;

	@IsNotEmpty()
	@Min(1)
	@Field(() => Int)
	limit: number;

	@IsOptional()
	@IsIn(availableHospitalSorts)
	@Field(() => String, { nullable: true })
	sort?: string;

	@IsOptional()
	@Field(() => Direction, { nullable: true })
	direction?: Direction;

	@IsNotEmpty()
	@Field(() => HISearch)
	search: HISearch;
}

@InputType()
class AHISearch {
	@IsOptional()
	@Field(() => HospitalStatus, { nullable: true })
	hospitalStatus?: HospitalStatus;
}

@InputType()
export class AgentHospitalsInquiry {
	@IsNotEmpty()
	@Min(1)
	@Field(() => Int)
	page: number;

	@IsNotEmpty()
	@Min(1)
	@Field(() => Int)
	limit: number;

	@IsOptional()
	@IsIn(availableHospitalSorts)
	@Field(() => String, { nullable: true })
	sort?: string;

	@IsOptional()
	@Field(() => Direction, { nullable: true })
	direction?: Direction;

	@IsNotEmpty()
	@Field(() => AHISearch)
	search: AHISearch;
}

@InputType()
class ALHISearch {
	@IsOptional()
	@Field(() => HospitalStatus, { nullable: true })
	hospitalStatus?: HospitalStatus;

	@IsOptional()
	@Field(() => [HospitalLocation], { nullable: true })
	hospitalLocationList?: HospitalLocation[];
}

@InputType()
export class AllHospitalsInquiry {
	@IsNotEmpty()
	@Min(1)
	@Field(() => Int)
	page: number;

	@IsNotEmpty()
	@Min(1)
	@Field(() => Int)
	limit: number;

	@IsOptional()
	@IsIn(availableHospitalSorts)
	@Field(() => String, { nullable: true })
	sort?: string;

	@IsOptional()
	@Field(() => Direction, { nullable: true })
	direction?: Direction;

	@IsNotEmpty()
	@Field(() => ALHISearch)
	search: ALHISearch;
}

@InputType()
export class OrdinaryInquiry {
	@IsNotEmpty()
	@Min(1)
	@Field(() => Int)
	page: number;

	@IsNotEmpty()
	@Min(1)
	@Field(() => Int)
	limit: number;
}
