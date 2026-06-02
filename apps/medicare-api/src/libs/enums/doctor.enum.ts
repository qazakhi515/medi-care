import { registerEnumType } from '@nestjs/graphql';

export enum DoctorStatus {
	ACTIVE = 'ACTIVE',
	PENDING = 'PENDING',
	BLOCK = 'BLOCK',
	DELETE = 'DELETE',
}
registerEnumType(DoctorStatus, {
	name: 'DoctorStatus',
});

export enum Specialization {
	UROLOGY = 'UROLOGY',
	DERMATOLOGY = 'DERMATOLOGY',
	PEDIATRICS = 'PEDIATRICS',
	SURGERY = 'SURGERY',
	DENTISTRY = 'DENTISTRY',
	CARDIOLOGY = 'CARDIOLOGY',
	ORTHOPEDICS = 'ORTHOPEDICS',
	OPHTHALMOLOGY = 'OPHTHALMOLOGY',
	OTHER = 'OTHER',
}
registerEnumType(Specialization, {
	name: 'Specialization',
});
