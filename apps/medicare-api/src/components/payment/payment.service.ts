import { BadRequestException, ForbiddenException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId } from 'mongoose';
import { Payment, Payments } from '../../libs/dto/payment/payment';
import { PaymentInput, PaymentsInquiry } from '../../libs/dto/payment/payment.input';
import { PaymentUpdate } from '../../libs/dto/payment/payment.update';
import { Appointment } from '../../libs/dto/appointment/appointment';
import { Doctor } from '../../libs/dto/doctor/doctor';
import { Direction, Message } from '../../libs/enums/common.enum';
import { PaymentStatus } from '../../libs/enums/payment.enum';
import { T } from '../../libs/types/common';
import { lookupDoctor, lookupPatient, shapeIntoMongoObjectId } from '../../libs/config';

@Injectable()
export class PaymentService {
	constructor(
		@InjectModel('Payment') private readonly paymentModel: Model<Payment>,
		@InjectModel('Appointment') private readonly appointmentModel: Model<Appointment>,
		@InjectModel('Doctor') private readonly doctorModel: Model<Doctor>,
	) {}

	public async createPayment(memberId: ObjectId, input: PaymentInput): Promise<Payment> {
		const appointment = await this.appointmentModel.findById(input.appointmentId).exec();
		if (!appointment) throw new InternalServerErrorException(Message.NO_DATA_FOUND);
		if (String(appointment.patientId) !== String(memberId)) {
			throw new ForbiddenException(Message.NOT_ALLOWED_REQUEST);
		}

		const existing = await this.paymentModel.findOne({ appointmentId: input.appointmentId }).exec();
		if (existing) throw new BadRequestException(Message.PAYMENT_ALREADY_EXISTS);

		const doctor = await this.doctorModel.findById(appointment.doctorId).exec();
		const amount = input.amount ?? doctor?.consultationFee ?? 0;

		try {
			return await this.paymentModel.create({
				appointmentId: appointment._id,
				patientId: appointment.patientId,
				doctorId: appointment.doctorId,
				paymentMethod: input.paymentMethod,
				amount,
			});
		} catch (err) {
			console.log('Error, Service.model:', err);
			throw new BadRequestException(Message.CREATE_FAILED);
		}
	}

	public async getPayment(memberId: ObjectId, paymentId: ObjectId): Promise<Payment> {
		const target: Payment = await this.paymentModel.findById(paymentId).lean().exec();
		if (!target) throw new InternalServerErrorException(Message.NO_DATA_FOUND);

		await this.assertPaymentAccess(memberId, target);
		return target;
	}

	public async getPayments(input: PaymentsInquiry): Promise<Payments> {
		const match: T = {};
		const sort: T = { [input?.sort ?? 'createdAt']: input?.direction ?? Direction.DESC };

		const { patientId, doctorId, paymentStatus } = input.search;
		if (patientId) match.patientId = shapeIntoMongoObjectId(patientId);
		if (doctorId) match.doctorId = shapeIntoMongoObjectId(doctorId);
		if (paymentStatus) match.paymentStatus = paymentStatus;

		const result = await this.paymentModel
			.aggregate([
				{ $match: match },
				{ $sort: sort },
				{
					$facet: {
						list: [
							{ $skip: (input.page - 1) * input.limit },
							{ $limit: input.limit },
							lookupPatient,
							{ $unwind: '$patientData' },
							lookupDoctor,
							{ $unwind: '$doctorData' },
						],
						metaCounter: [{ $count: 'total' }],
					},
				},
			])
			.exec();

		if (!result.length) throw new InternalServerErrorException(Message.NO_DATA_FOUND);
		return result[0];
	}

	public async updatePayment(memberId: ObjectId, input: PaymentUpdate): Promise<Payment> {
		const target: Payment = await this.paymentModel.findById(input._id).lean().exec();
		if (!target) throw new InternalServerErrorException(Message.NO_DATA_FOUND);

		await this.assertPaymentAccess(memberId, target);

		if (input.paymentStatus === PaymentStatus.PAID) input.paidAt = new Date();

		const result = await this.paymentModel.findByIdAndUpdate(input._id, input, { new: true }).exec();
		if (!result) throw new InternalServerErrorException(Message.UPDATE_FAILED);

		return result;
	}

	private async assertPaymentAccess(memberId: ObjectId, payment: Payment): Promise<void> {
		if (String(payment.patientId) === String(memberId)) return;

		const owningDoctor = await this.doctorModel.findOne({ _id: payment.doctorId, memberId: memberId }).exec();
		if (!owningDoctor) throw new ForbiddenException(Message.NOT_ALLOWED_REQUEST);
	}
}
