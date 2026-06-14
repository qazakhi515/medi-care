import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsOptional, Length } from 'class-validator';

@InputType()
export class MedicalAiInput {
	@IsNotEmpty()
	@Length(3, 1000)
	@Field(() => String)
	message: string;

	@IsOptional()
	@Length(2, 20)
	@Field(() => String, { nullable: true })
	language?: string;
}
