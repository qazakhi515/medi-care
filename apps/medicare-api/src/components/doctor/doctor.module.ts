import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DoctorResolver } from './doctor.resolver';
import { DoctorService } from './doctor.service';
import DoctorSchema from '../../schemas/Doctor.model';
import HospitalSchema from '../../schemas/Hospital.model';
import { AuthModule } from '../auth/auth.module';
import { ViewModule } from '../view/view.module';
import { MemberModule } from '../member/member.module';

@Module({
	imports: [
		MongooseModule.forFeature([
			{ name: 'Doctor', schema: DoctorSchema },
			{ name: 'Hospital', schema: HospitalSchema },
		]),
		AuthModule,
		ViewModule,
		forwardRef(() => MemberModule),
	],
	providers: [DoctorResolver, DoctorService],
	exports: [DoctorService],
})
export class DoctorModule {}
