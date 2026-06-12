import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AppointmentResolver } from './appointment.resolver';
import { AppointmentService } from './appointment.service';
import AppointmentSchema from '../../schemas/Appointment.model';
import DoctorSchema from '../../schemas/Doctor.model';
import { AuthModule } from '../auth/auth.module';
import { NotificationModule } from '../notification/notification.module';

@Module({
	imports: [
		MongooseModule.forFeature([
			{ name: 'Appointment', schema: AppointmentSchema },
			{ name: 'Doctor', schema: DoctorSchema },
		]),
		AuthModule,
		NotificationModule,
	],
	providers: [AppointmentResolver, AppointmentService],
	exports: [AppointmentService],
})
export class AppointmentModule {}
