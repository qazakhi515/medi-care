import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DoctorScheduleResolver } from './doctor-schedule.resolver';
import { DoctorScheduleService } from './doctor-schedule.service';
import DoctorScheduleSchema from '../../schemas/DoctorSchedule.model';
import DoctorSchema from '../../schemas/Doctor.model';
import { AuthModule } from '../auth/auth.module';

@Module({
	imports: [
		MongooseModule.forFeature([
			{ name: 'DoctorSchedule', schema: DoctorScheduleSchema },
			{ name: 'Doctor', schema: DoctorSchema },
		]),
		AuthModule,
	],
	providers: [DoctorScheduleResolver, DoctorScheduleService],
	exports: [DoctorScheduleService],
})
export class DoctorScheduleModule {}
