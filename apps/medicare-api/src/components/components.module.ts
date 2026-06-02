import { Module } from '@nestjs/common';
import { MemberModule } from './member/member.module';
import { HospitalModule } from './hospital/hospital.module';
import { AuthModule } from './auth/auth.module';
import { CommentModule } from './comment/comment.module';
import { LikeModule } from './like/like.module';
import { ViewModule } from './view/view.module';
import { FollowModule } from './follow/follow.module';
import { BoardArticleModule } from './board-article/board-article.module';
import { DoctorModule } from './doctor/doctor.module';
import { DoctorScheduleModule } from './doctor-schedule/doctor-schedule.module';
import { AppointmentModule } from './appointment/appointment.module';
import { PaymentModule } from './payment/payment.module';
import { PatientProfileModule } from './patient-profile/patient-profile.module';

@Module({
	imports: [
		MemberModule,
		AuthModule,
		HospitalModule,
		BoardArticleModule,
		LikeModule,
		ViewModule,
		CommentModule,
		FollowModule,
		DoctorModule,
		DoctorScheduleModule,
		AppointmentModule,
		PaymentModule,
		PatientProfileModule,
	],
})
export class ComponentsModule {}
