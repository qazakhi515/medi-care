import { registerEnumType } from '@nestjs/graphql';

export enum AppointmentStatus {
	PENDING = 'PENDING',
	CONFIRMED = 'CONFIRMED',
	CANCELLED = 'CANCELLED',
	COMPLETED = 'COMPLETED',
	NO_SHOW = 'NO_SHOW',
}
registerEnumType(AppointmentStatus, {
	name: 'AppointmentStatus',
});
