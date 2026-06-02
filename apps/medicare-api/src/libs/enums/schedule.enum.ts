import { registerEnumType } from '@nestjs/graphql';

export enum ScheduleStatus {
	ACTIVE = 'ACTIVE',
	INACTIVE = 'INACTIVE',
	DELETE = 'DELETE',
}
registerEnumType(ScheduleStatus, {
	name: 'ScheduleStatus',
});

export enum DayOfWeek {
	MONDAY = 'MONDAY',
	TUESDAY = 'TUESDAY',
	WEDNESDAY = 'WEDNESDAY',
	THURSDAY = 'THURSDAY',
	FRIDAY = 'FRIDAY',
	SATURDAY = 'SATURDAY',
	SUNDAY = 'SUNDAY',
}
registerEnumType(DayOfWeek, {
	name: 'DayOfWeek',
});
