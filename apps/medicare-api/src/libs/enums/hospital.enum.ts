import { registerEnumType } from '@nestjs/graphql';

export enum HospitalType {
	APARTMENT = 'APARTMENT',
	VILLA = 'VILLA',
	HOUSE = 'HOUSE',
}
registerEnumType(HospitalType, {
	name: 'HospitalType',
});

export enum HospitalStatus {
	ACTIVE = 'ACTIVE',
	SOLD = 'SOLD',
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
