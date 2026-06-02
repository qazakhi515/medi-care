import { Schema } from 'mongoose';
import { AppointmentStatus } from '../libs/enums/appointment.enum';

const AppointmentSchema = new Schema(
	{
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

		appointmentDate: {
			type: Date,
			required: true,
		},

		startTime: {
			type: String,
			required: true,
		},

		endTime: {
			type: String,
			required: true,
		},

		symptoms: {
			type: String,
		},

		appointmentStatus: {
			type: String,
			enum: AppointmentStatus,
			default: AppointmentStatus.PENDING,
		},

		appointmentReason: {
			type: String,
		},

		cancellationReason: {
			type: String,
		},
	},
	{ timestamps: true, collection: 'appointments' },
);

AppointmentSchema.index({ doctorId: 1, appointmentDate: 1, startTime: 1 }, { unique: true });

export default AppointmentSchema;
