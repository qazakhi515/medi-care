import { Schema } from 'mongoose';
import { BloodType, Gender } from '../libs/enums/patient-profile.enum';

const PatientProfileSchema = new Schema(
	{
		memberId: {
			type: Schema.Types.ObjectId,
			required: true,
			ref: 'Member',
		},

		birthDate: {
			type: Date,
		},

		gender: {
			type: String,
			enum: Gender,
		},

		bloodType: {
			type: String,
			enum: BloodType,
		},

		chronicDiseases: {
			type: String,
		},

		emergencyContact: {
			type: String,
		},
	},
	{ timestamps: true, collection: 'patientProfiles' },
);

PatientProfileSchema.index({ memberId: 1 }, { unique: true });

export default PatientProfileSchema;
