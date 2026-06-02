import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PatientProfileResolver } from './patient-profile.resolver';
import { PatientProfileService } from './patient-profile.service';
import PatientProfileSchema from '../../schemas/PatientProfile.model';
import { AuthModule } from '../auth/auth.module';

@Module({
	imports: [
		MongooseModule.forFeature([{ name: 'PatientProfile', schema: PatientProfileSchema }]),
		AuthModule,
	],
	providers: [PatientProfileResolver, PatientProfileService],
	exports: [PatientProfileService],
})
export class PatientProfileModule {}
