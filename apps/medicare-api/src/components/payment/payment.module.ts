import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PaymentResolver } from './payment.resolver';
import { PaymentService } from './payment.service';
import PaymentSchema from '../../schemas/Payment.model';
import AppointmentSchema from '../../schemas/Appointment.model';
import DoctorSchema from '../../schemas/Doctor.model';
import { AuthModule } from '../auth/auth.module';

@Module({
	imports: [
		MongooseModule.forFeature([
			{ name: 'Payment', schema: PaymentSchema },
			{ name: 'Appointment', schema: AppointmentSchema },
			{ name: 'Doctor', schema: DoctorSchema },
		]),
		AuthModule,
	],
	providers: [PaymentResolver, PaymentService],
	exports: [PaymentService],
})
export class PaymentModule {}
