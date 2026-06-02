import { Field, InputType, Int } from '@nestjs/graphql';
import { IsIn, IsNotEmpty, IsOptional, Length, Min } from 'class-validator';
import { ObjectId } from 'mongoose';
import { AppointmentStatus } from '../../enums/appointment.enum';
import { availableAppointmentSorts } from '../../config';
import { Direction } from '../../enums/common.enum';

@InputType()
export class AppointmentInput {
	@IsNotEmpty()
	@Field(() => String)
	doctorId: ObjectId;

	@IsNotEmpty()
	@Field(() => Date)
	appointmentDate: Date;

	@IsNotEmpty()
	@Field(() => String)
	startTime: string;

	@IsNotEmpty()
	@Field(() => String)
	endTime: string;

	@IsOptional()
	@Length(3, 500)
	@Field(() => String, { nullable: true })
	symptoms?: string;

	@IsOptional()
	@Length(3, 500)
	@Field(() => String, { nullable: true })
	appointmentReason?: string;

	patientId?: ObjectId;
}

@InputType()
export class AppointmentPeriod {
	@Field(() => Date)
	start: Date;

	@Field(() => Date)
	end: Date;
}

@InputType()
class ApptISearch {
	@IsOptional()
	@Field(() => String, { nullable: true })
	doctorId?: ObjectId;

	@IsOptional()
	@Field(() => String, { nullable: true })
	patientId?: ObjectId;

	@IsOptional()
	@Field(() => AppointmentStatus, { nullable: true })
	appointmentStatus?: AppointmentStatus;

	@IsOptional()
	@Field(() => AppointmentPeriod, { nullable: true })
	periodsRange?: AppointmentPeriod;
}

@InputType()
export class AppointmentsInquiry {
	@IsNotEmpty()
	@Min(1)
	@Field(() => Int)
	page: number;

	@IsNotEmpty()
	@Min(1)
	@Field(() => Int)
	limit: number;

	@IsOptional()
	@IsIn(availableAppointmentSorts)
	@Field(() => String, { nullable: true })
	sort?: string;

	@IsOptional()
	@Field(() => Direction, { nullable: true })
	direction?: Direction;

	@IsNotEmpty()
	@Field(() => ApptISearch)
	search: ApptISearch;
}
