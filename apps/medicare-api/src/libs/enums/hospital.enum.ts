import { registerEnumType } from '@nestjs/graphql';

export enum HospitalType {
	GENERAL = 'GENERAL',
	DENTAL = 'DENTAL',
	PEDIATRIC = 'PEDIATRIC',
	SURGICAL = 'SURGICAL',
	CARDIOLOGY = 'CARDIOLOGY',
	ORTHOPEDIC = 'ORTHOPEDIC',
	DERMATOLOGY = 'DERMATOLOGY',
	UROLOGY = 'UROLOGY',
	OPHTHALMOLOGY = 'OPHTHALMOLOGY',
	GYNECOLOGY = 'GYNECOLOGY',
	PHYSIOTHERAPY = 'PHYSIOTHERAPY',
	RADIOLOGY = 'RADIOLOGY',
	NEUROLOGY = 'NEUROLOGY',
	ONCOLOGY = 'ONCOLOGY',
	ENDOCRINOLOGY = 'ENDOCRINOLOGY',
	NEPHROLOGY = 'NEPHROLOGY',
	OTHER = 'OTHER',
}
registerEnumType(HospitalType, {
	name: 'HospitalType',
});

export enum HospitalStatus {
	ACTIVE = 'ACTIVE',
	DELETE = 'DELETE',
}
registerEnumType(HospitalStatus, {
	name: 'HospitalStatus',
});

export enum HospitalLocation {
	SEOUL = 'SEOUL',
	BUSAN = 'BUSAN',
	INCHEON = 'INCHEON',
	DAEGU = 'DAEGU',
	GYEONGJU = 'GYEONGJU',
	GWANGJU = 'GWANGJU',
	CHONJU = 'CHONJU',
	DAEJON = 'DAEJON',
	JEJU = 'JEJU',
}
registerEnumType(HospitalLocation, {
	name: 'HospitalLocation',
});
