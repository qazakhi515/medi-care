import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { MedicalAiResolver } from './medical-ai.resolver';
import { MedicalAiService } from './medical-ai.service';

@Module({
	imports: [AuthModule],
	providers: [MedicalAiResolver, MedicalAiService],
	exports: [MedicalAiService],
})
export class MedicalAiModule {}
