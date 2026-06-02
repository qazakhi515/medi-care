import { Schema } from 'mongoose';
import { DoctorStatus, Specialization } from '../libs/enums/doctor.enum';

const DoctorSchema = new Schema(
	{
		memberId: {
			type: Schema.Types.ObjectId,
			required: true,
			ref: 'Member',
		},

		doctorStatus: {
			type: String,
			enum: DoctorStatus,
			default: DoctorStatus.PENDING,
		},

		specialization: {
			type: String,
			enum: Specialization,
			required: true,
		},

		licenseNumber: {
			type: String,
			required: true,
		},

		experienceYears: {
			type: Number,
			default: 0,
		},

		consultationFee: {
			type: Number,
			default: 0,
		},

		education: {
			type: String,
		},

		certificates: {
			type: String,
		},

		doctorRank: {
			type: Number,
			default: 0,
		},

		doctorViews: {
			type: Number,
			default: 0,
		},

		deletedAt: {
			type: Date,
		},
	},
	{ timestamps: true, collection: 'doctors' },
);

DoctorSchema.index({ memberId: 1 }, { unique: true });
DoctorSchema.index({ licenseNumber: 1 }, { unique: true });

export default DoctorSchema;
