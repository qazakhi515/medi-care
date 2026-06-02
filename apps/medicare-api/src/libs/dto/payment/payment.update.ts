import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsOptional } from 'class-validator';
import { ObjectId } from 'mongoose';
import { PaymentMethod, PaymentStatus } from '../../enums/payment.enum';

@InputType()
export class PaymentUpdate {
	@IsNotEmpty()
	@Field(() => String)
	_id: ObjectId;

	@IsOptional()
	@Field(() => PaymentStatus, { nullable: true })
	paymentStatus?: PaymentStatus;

	@IsOptional()
	@Field(() => PaymentMethod, { nullable: true })
	paymentMethod?: PaymentMethod;

	paidAt?: Date;
}
