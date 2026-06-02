import { Field, InputType, Int } from '@nestjs/graphql';
import { IsIn, IsInt, IsNotEmpty, IsOptional, Min } from 'class-validator';
import { ObjectId } from 'mongoose';
import { PaymentMethod, PaymentStatus } from '../../enums/payment.enum';
import { availablePaymentSorts } from '../../config';
import { Direction } from '../../enums/common.enum';

@InputType()
export class PaymentInput {
	@IsNotEmpty()
	@Field(() => String)
	appointmentId: ObjectId;

	@IsNotEmpty()
	@Field(() => PaymentMethod)
	paymentMethod: PaymentMethod;

	@IsOptional()
	@IsInt()
	@Min(0)
	@Field(() => Int, { nullable: true })
	amount?: number;
}

@InputType()
class PayISearch {
	@IsOptional()
	@Field(() => String, { nullable: true })
	patientId?: ObjectId;

	@IsOptional()
	@Field(() => String, { nullable: true })
	doctorId?: ObjectId;

	@IsOptional()
	@Field(() => PaymentStatus, { nullable: true })
	paymentStatus?: PaymentStatus;
}

@InputType()
export class PaymentsInquiry {
	@IsNotEmpty()
	@Min(1)
	@Field(() => Int)
	page: number;

	@IsNotEmpty()
	@Min(1)
	@Field(() => Int)
	limit: number;

	@IsOptional()
	@IsIn(availablePaymentSorts)
	@Field(() => String, { nullable: true })
	sort?: string;

	@IsOptional()
	@Field(() => Direction, { nullable: true })
	direction?: Direction;

	@IsNotEmpty()
	@Field(() => PayISearch)
	search: PayISearch;
}
