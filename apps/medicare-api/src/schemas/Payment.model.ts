import { Schema } from 'mongoose';
import { PaymentMethod, PaymentStatus } from '../libs/enums/payment.enum';

const PaymentSchema = new Schema(
	{
		appointmentId: {
			type: Schema.Types.ObjectId,
			required: true,
			ref: 'Appointment',
		},

		patientId: {
			type: Schema.Types.ObjectId,
			required: true,
			ref: 'Member',
		},

		doctorId: {
			type: Schema.Types.ObjectId,
			required: true,
			ref: 'Doctor',
		},

		paymentStatus: {
			type: String,
			enum: PaymentStatus,
			default: PaymentStatus.PENDING,
		},

		amount: {
			type: Number,
			required: true,
		},

		paymentMethod: {
			type: String,
			enum: PaymentMethod,
			required: true,
		},

		paidAt: {
			type: Date,
		},
	},
	{ timestamps: true, collection: 'payments' },
);

PaymentSchema.index({ appointmentId: 1 }, { unique: true });

export default PaymentSchema;
