import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { ObjectId } from 'mongoose';
import { PaymentService } from './payment.service';
import { Payment, Payments } from '../../libs/dto/payment/payment';
import { PaymentInput, PaymentsInquiry } from '../../libs/dto/payment/payment.input';
import { PaymentUpdate } from '../../libs/dto/payment/payment.update';
import { Roles } from '../auth/decorators/roles.decorator';
import { MemberType } from '../../libs/enums/member.enum';
import { AuthMember } from '../auth/decorators/authMember.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { AuthGuard } from '../auth/guards/auth.guard';
import { shapeIntoMongoObjectId } from '../../libs/config';

@Resolver()
export class PaymentResolver {
	constructor(private readonly paymentService: PaymentService) {}

	@Roles(MemberType.PATIENT)
	@UseGuards(RolesGuard)
	@Mutation(() => Payment)
	public async createPayment(
		@Args('input') input: PaymentInput,
		@AuthMember('_id') memberId: ObjectId,
	): Promise<Payment> {
		console.log('Mutation: createPayment');
		input.appointmentId = shapeIntoMongoObjectId(input.appointmentId);
		return await this.paymentService.createPayment(memberId, input);
	}

	@UseGuards(AuthGuard)
	@Query(() => Payment)
	public async getPayment(@Args('paymentId') input: string, @AuthMember('_id') memberId: ObjectId): Promise<Payment> {
		console.log('Query: getPayment');
		const paymentId = shapeIntoMongoObjectId(input);
		return await this.paymentService.getPayment(memberId, paymentId);
	}

	@UseGuards(AuthGuard)
	@Query(() => Payments)
	public async getPayments(@Args('input') input: PaymentsInquiry): Promise<Payments> {
		console.log('Query: getPayments');
		return await this.paymentService.getPayments(input);
	}

	@UseGuards(AuthGuard)
	@Mutation(() => Payment)
	public async updatePayment(
		@Args('input') input: PaymentUpdate,
		@AuthMember('_id') memberId: ObjectId,
	): Promise<Payment> {
		console.log('Mutation: updatePayment');
		input._id = shapeIntoMongoObjectId(input._id);
		return await this.paymentService.updatePayment(memberId, input);
	}
}
