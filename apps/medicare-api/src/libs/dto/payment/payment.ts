import { Field, Int, ObjectType } from '@nestjs/graphql';
import { ObjectId } from 'mongoose';
import { PaymentMethod, PaymentStatus } from '../../enums/payment.enum';
import { Member, TotalCounter } from '../member/member';
import { Doctor } from '../doctor/doctor';

@ObjectType()
export class Payment {
	@Field(() => String)
	_id: ObjectId;

	@Field(() => String)
	appointmentId: ObjectId;

	@Field(() => String)
	patientId: ObjectId;

	@Field(() => String)
	doctorId: ObjectId;

	@Field(() => PaymentStatus)
	paymentStatus: PaymentStatus;

	@Field(() => Int)
	amount: number;

	@Field(() => PaymentMethod)
	paymentMethod: PaymentMethod;

	@Field(() => Date, { nullable: true })
	paidAt?: Date;

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
export class Payments {
	@Field(() => [Payment])
	list: Payment[];

	@Field(() => [TotalCounter], { nullable: true })
	metaCounter: TotalCounter[];
}
