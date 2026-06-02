import { registerEnumType } from '@nestjs/graphql';

export enum ViewGroup {
	MEMBER = 'MEMBER',
	ARTICLE = 'ARTICLE',
	HOSPITAL = 'HOSPITAL',
	DOCTOR = 'DOCTOR',
}
registerEnumType(ViewGroup, {
	name: 'ViewGroup',
});
