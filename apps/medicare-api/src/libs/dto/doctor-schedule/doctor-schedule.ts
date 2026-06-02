import { Field, Int, ObjectType } from '@nestjs/graphql';
import { ObjectId } from 'mongoose';
import { DayOfWeek, ScheduleStatus } from '../../enums/schedule.enum';
import { TotalCounter } from '../member/member';

@ObjectType()
export class DoctorSchedule {
	@Field(() => String)
	_id: ObjectId;

	@Field(() => String)
	doctorId: ObjectId;

	@Field(() => ScheduleStatus)
	scheduleStatus: ScheduleStatus;

	@Field(() => DayOfWeek)
	dayOfWeek: DayOfWeek;

	@Field(() => String)
	startTime: string;

	@Field(() => String)
	endTime: string;

	@Field(() => Int)
	slotDuration: number;

	@Field(() => Date)
	createdAt: Date;

	@Field(() => Date)
	updatedAt: Date;
}

@ObjectType()
export class DoctorSchedules {
	@Field(() => [DoctorSchedule])
	list: DoctorSchedule[];

	@Field(() => [TotalCounter], { nullable: true })
	metaCounter: TotalCounter[];
}
