import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsOptional, Length } from 'class-validator';
import { ObjectId } from 'mongoose';
import { AppointmentStatus } from '../../enums/appointment.enum';

@InputType()
export class AppointmentUpdate {
	@IsNotEmpty()
	@Field(() => String)
	_id: ObjectId;

	@IsOptional()
	@Field(() => AppointmentStatus, { nullable: true })
	appointmentStatus?: AppointmentStatus;

	@IsOptional()
	@Field(() => Date, { nullable: true })
	appointmentDate?: Date;

	@IsOptional()
	@Field(() => String, { nullable: true })
	startTime?: string;

	@IsOptional()
	@Field(() => String, { nullable: true })
	endTime?: string;

	@IsOptional()
	@Length(3, 500)
	@Field(() => String, { nullable: true })
	symptoms?: string;

	@IsOptional()
	@Length(3, 500)
	@Field(() => String, { nullable: true })
	cancellationReason?: string;
}
