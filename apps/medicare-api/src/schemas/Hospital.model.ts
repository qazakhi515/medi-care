import { Schema } from 'mongoose';
import { HospitalLocation, HospitalStatus, HospitalType } from '../libs/enums/hospital.enum';

const HospitalSchema = new Schema(
	{
		hospitalType: {
			type: String,
			enum: HospitalType,
			required: true,
		},

		hospitalStatus: {
			type: String,
			enum: HospitalStatus,
			default: HospitalStatus.ACTIVE,
		},

		hospitalLocation: {
			type: String,
			enum: HospitalLocation,
			required: true,
		},

		hospitalAddress: {
			type: String,
			required: true,
		},

		hospitalTitle: {
			type: String,
			required: true,
		},

		hospitalPrice: {
			type: Number,
			required: true,
		},

		hospitalSquare: {
			type: Number,
			required: true,
		},

		hospitalBeds: {
			type: Number,
			required: true,
		},

		hospitalRooms: {
			type: Number,
			required: true,
		},

		hospitalViews: {
			type: Number,
			default: 0,
		},

		hospitalLikes: {
			type: Number,
			default: 0,
		},

		hospitalComments: {
			type: Number,
			default: 0,
		},

		hospitalRank: {
			type: Number,
			default: 0,
		},

		hospitalImages: {
			type: [String],
			required: true,
		},

		hospitalDesc: {
			type: String,
		},

		hospitalBarter: {
			type: Boolean,
			default: false,
		},

		hospitalRent: {
			type: Boolean,
			default: false,
		},

		memberId: {
			type: Schema.Types.ObjectId,
			required: true,
			ref: 'Member',
		},

		soldAt: {
			type: Date,
		},

		deletedAt: {
			type: Date,
		},

		constructedAt: {
			type: Date,
		},
	},
	{ timestamps: true, collection: 'hospitals' },
);

HospitalSchema.index({ hospitalType: 1, hospitalLocation: 1, hospitalTitle: 1, hospitalPrice: 1 }, { unique: true });

export default HospitalSchema;
