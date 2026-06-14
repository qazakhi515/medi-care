import { Field, ObjectType } from '@nestjs/graphql';
import { Specialization } from '../../enums/doctor.enum';
import { MedicalAiUrgencyLevel } from '../../enums/medical-ai.enum';

@ObjectType()
export class MedicalAiAnswer {
	@Field(() => String)
	answer: string;

	@Field(() => MedicalAiUrgencyLevel)
	urgencyLevel: MedicalAiUrgencyLevel;

	@Field(() => Specialization, { nullable: true })
	suggestedSpecialization?: Specialization;

	@Field(() => Boolean)
	shouldBookAppointment: boolean;

	@Field(() => String)
	safetyNotice: string;
}
