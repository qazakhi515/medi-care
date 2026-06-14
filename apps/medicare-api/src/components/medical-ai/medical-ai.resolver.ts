import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { MedicalAiAnswer } from '../../libs/dto/medical-ai/medical-ai';
import { MedicalAiInput } from '../../libs/dto/medical-ai/medical-ai.input';
import { MemberType } from '../../libs/enums/member.enum';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { MedicalAiService } from './medical-ai.service';

@Resolver()
export class MedicalAiResolver {
	constructor(private readonly medicalAiService: MedicalAiService) {}

	@Roles(MemberType.PATIENT)
	@UseGuards(RolesGuard)
	@Mutation(() => MedicalAiAnswer)
	public async askMedicalAi(@Args('input') input: MedicalAiInput): Promise<MedicalAiAnswer> {
		console.log('Mutation: askMedicalAi');
		return await this.medicalAiService.askMedicalAi(input);
	}
}
