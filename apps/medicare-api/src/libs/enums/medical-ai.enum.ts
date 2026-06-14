import { registerEnumType } from '@nestjs/graphql';

export enum MedicalAiUrgencyLevel {
	LOW = 'LOW',
	MEDIUM = 'MEDIUM',
	HIGH = 'HIGH',
	EMERGENCY = 'EMERGENCY',
}

registerEnumType(MedicalAiUrgencyLevel, {
	name: 'MedicalAiUrgencyLevel',
});
