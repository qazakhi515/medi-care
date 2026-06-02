import { Schema } from 'mongoose';
import { DayOfWeek, ScheduleStatus } from '../libs/enums/schedule.enum';

const DoctorScheduleSchema = new Schema(
	{
		doctorId: {
			type: Schema.Types.ObjectId,
			required: true,
			ref: 'Doctor',
		},

		scheduleStatus: {
			type: String,
			enum: ScheduleStatus,
			default: ScheduleStatus.ACTIVE,
		},

		dayOfWeek: {
			type: String,
			enum: DayOfWeek,
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

		slotDuration: {
			type: Number,
			default: 30,
		},
	},
	{ timestamps: true, collection: 'doctorSchedules' },
);

DoctorScheduleSchema.index({ doctorId: 1, dayOfWeek: 1, startTime: 1 }, { unique: true });

export default DoctorScheduleSchema;
