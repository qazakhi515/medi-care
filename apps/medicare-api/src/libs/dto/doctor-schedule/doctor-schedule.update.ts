import { Field, InputType, Int } from '@nestjs/graphql';
import { IsInt, IsNotEmpty, IsOptional, Min } from 'class-validator';
import { ObjectId } from 'mongoose';
import { DayOfWeek, ScheduleStatus } from '../../enums/schedule.enum';

@InputType()
export class DoctorScheduleUpdate {
	@IsNotEmpty()
	@Field(() => String)
	_id: ObjectId;

	@IsOptional()
	@Field(() => ScheduleStatus, { nullable: true })
	scheduleStatus?: ScheduleStatus;

	@IsOptional()
	@Field(() => DayOfWeek, { nullable: true })
	dayOfWeek?: DayOfWeek;

	@IsOptional()
	@Field(() => String, { nullable: true })
	startTime?: string;

	@IsOptional()
	@Field(() => String, { nullable: true })
	endTime?: string;

	@IsOptional()
	@IsInt()
	@Min(1)
	@Field(() => Int, { nullable: true })
	slotDuration?: number;
}
