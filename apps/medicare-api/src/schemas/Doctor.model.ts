import { Schema } from 'mongoose';
import { DoctorStatus, Specialization } from '../libs/enums/doctor.enum';

const DoctorSchema = new Schema(
	{
		memberId: {
			type: Schema.Types.ObjectId,
			required: true,
			ref: 'Member',
		},

		hospitalId: {
			type: Schema.Types.ObjectId,
			ref: 'Hospital',
		},

		doctorStatus: {
			type: String,
			enum: DoctorStatus,
			default: DoctorStatus.ACTIVE,
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

		workingDays: {
			type: [Number],
			default: [1, 2, 3, 4, 5], // 0=Sun ... 6=Sat (Mon-Fri by default)
		},

		workStartTime: {
			type: String,
			default: '09:00',
		},

		workEndTime: {
			type: String,
			default: '17:00',
		},

		slotDuration: {
			type: Number,
			default: 30, // minutes
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
DoctorSchema.index({ hospitalId: 1 });

export default DoctorSchema;
