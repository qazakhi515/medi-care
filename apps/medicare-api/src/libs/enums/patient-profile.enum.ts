import { registerEnumType } from '@nestjs/graphql';

export enum Gender {
	MALE = 'MALE',
	FEMALE = 'FEMALE',
}
registerEnumType(Gender, {
	name: 'Gender',
});

export enum BloodType {
	A_POSITIVE = 'A_POSITIVE',
	A_NEGATIVE = 'A_NEGATIVE',
	B_POSITIVE = 'B_POSITIVE',
	B_NEGATIVE = 'B_NEGATIVE',
	AB_POSITIVE = 'AB_POSITIVE',
	AB_NEGATIVE = 'AB_NEGATIVE',
	O_POSITIVE = 'O_POSITIVE',
	O_NEGATIVE = 'O_NEGATIVE',
}
registerEnumType(BloodType, {
	name: 'BloodType',
});
