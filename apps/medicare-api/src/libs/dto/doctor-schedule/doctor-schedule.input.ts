import { Field, InputType, Int } from '@nestjs/graphql';
import { IsIn, IsInt, IsNotEmpty, IsOptional, Min } from 'class-validator';
import { ObjectId } from 'mongoose';
import { DayOfWeek, ScheduleStatus } from '../../enums/schedule.enum';
import { availableScheduleSorts } from '../../config';
import { Direction } from '../../enums/common.enum';

@InputType()
export class DoctorScheduleInput {
	@IsNotEmpty()
	@Field(() => String)
	doctorId: ObjectId;

	@IsNotEmpty()
	@Field(() => DayOfWeek)
	dayOfWeek: DayOfWeek;

	@IsNotEmpty()
	@Field(() => String)
	startTime: string;

	@IsNotEmpty()
	@Field(() => String)
	endTime: string;

	@IsOptional()
	@IsInt()
	@Min(1)
	@Field(() => Int, { nullable: true })
	slotDuration?: number;
}

@InputType()
class DSISearch {
	@IsOptional()
	@Field(() => String, { nullable: true })
	doctorId?: ObjectId;

	@IsOptional()
	@Field(() => DayOfWeek, { nullable: true })
	dayOfWeek?: DayOfWeek;

	@IsOptional()
	@Field(() => ScheduleStatus, { nullable: true })
	scheduleStatus?: ScheduleStatus;
}

@InputType()
export class DoctorSchedulesInquiry {
	@IsNotEmpty()
	@Min(1)
	@Field(() => Int)
	page: number;

	@IsNotEmpty()
	@Min(1)
	@Field(() => Int)
	limit: number;

	@IsOptional()
	@IsIn(availableScheduleSorts)
	@Field(() => String, { nullable: true })
	sort?: string;

	@IsOptional()
	@Field(() => Direction, { nullable: true })
	direction?: Direction;

	@IsNotEmpty()
	@Field(() => DSISearch)
	search: DSISearch;
}
