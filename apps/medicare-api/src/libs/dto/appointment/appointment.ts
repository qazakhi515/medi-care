import { Field, ObjectType } from '@nestjs/graphql';
import { ObjectId } from 'mongoose';
import { AppointmentStatus } from '../../enums/appointment.enum';
import { Member, TotalCounter } from '../member/member';
import { Doctor } from '../doctor/doctor';

@ObjectType()
export class Appointment {
	@Field(() => String)
	_id: ObjectId;

	@Field(() => String)
	patientId: ObjectId;

	@Field(() => String)
	doctorId: ObjectId;

	@Field(() => Date)
	appointmentDate: Date;

	@Field(() => String)
	startTime: string;

	@Field(() => String)
	endTime: string;

	@Field(() => String, { nullable: true })
	symptoms?: string;

	@Field(() => AppointmentStatus)
	appointmentStatus: AppointmentStatus;

	@Field(() => String, { nullable: true })
	appointmentReason?: string;

	@Field(() => String, { nullable: true })
	cancellationReason?: string;

	@Field(() => Date)
	createdAt: Date;

	@Field(() => Date)
	updatedAt: Date;

	// from aggregate //
	@Field(() => Member, { nullable: true })
	patientData?: Member;

	@Field(() => Doctor, { nullable: true })
	doctorData?: Doctor;
}

@ObjectType()
export class Appointments {
	@Field(() => [Appointment])
	list: Appointment[];

	@Field(() => [TotalCounter], { nullable: true })
	metaCounter: TotalCounter[];
}
