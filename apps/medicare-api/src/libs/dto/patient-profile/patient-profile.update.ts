import { Field, InputType } from '@nestjs/graphql';
import { IsOptional, Length } from 'class-validator';
import { BloodType, Gender } from '../../enums/patient-profile.enum';

@InputType()
export class PatientProfileUpdate {
	@IsOptional()
	@Field(() => Date, { nullable: true })
	birthDate?: Date;

	@IsOptional()
	@Field(() => Gender, { nullable: true })
	gender?: Gender;

	@IsOptional()
	@Field(() => BloodType, { nullable: true })
	bloodType?: BloodType;

	@IsOptional()
	@Length(3, 500)
	@Field(() => String, { nullable: true })
	chronicDiseases?: string;

	@IsOptional()
	@Length(3, 100)
	@Field(() => String, { nullable: true })
	emergencyContact?: string;
}
