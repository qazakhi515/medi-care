import { registerEnumType } from '@nestjs/graphql';

export enum PaymentStatus {
	PENDING = 'PENDING',
	PAID = 'PAID',
	FAILED = 'FAILED',
	REFUNDED = 'REFUNDED',
}
registerEnumType(PaymentStatus, {
	name: 'PaymentStatus',
});

export enum PaymentMethod {
	CASH = 'CASH',
	CARD = 'CARD',
	CLICK = 'CLICK',
	PAYME = 'PAYME',
}
registerEnumType(PaymentMethod, {
	name: 'PaymentMethod',
});
