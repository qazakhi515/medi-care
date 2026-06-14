import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class TimeSlot {
	@Field(() => String)
	startTime: string;

	@Field(() => String)
	endTime: string;
}

@ObjectType()
export class DoctorAvailability {
	@Field(() => String)
	doctorId: string;

	@Field(() => Date)
	date: Date;

	@Field(() => Boolean)
	isWorkingDay: boolean;

	@Field(() => [TimeSlot])
	slots: TimeSlot[];
}
