import { forwardRef, Module } from '@nestjs/common';
import { HospitalResolver } from './hospital.resolver';
import { HospitalService } from './hospital.service';
import { MongooseModule } from '@nestjs/mongoose';
import HospitalSchema from '../../schemas/Hospital.model';
import { AuthModule } from '../auth/auth.module';
import { ViewModule } from '../view/view.module';
import { MemberModule } from '../member/member.module';
import { LikeModule } from '../like/like.module';

@Module({
	imports: [
		MongooseModule.forFeature([{ name: 'Hospital', schema: HospitalSchema }]),
		AuthModule,
		ViewModule,
		forwardRef(() => MemberModule),
		LikeModule,
	],
	providers: [HospitalResolver, HospitalService],
	exports: [HospitalService],
})
export class HospitalModule {}
