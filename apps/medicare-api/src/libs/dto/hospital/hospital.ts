import { Field, Int, ObjectType } from '@nestjs/graphql';
import { ObjectId } from 'mongoose';
import { HospitalLocation, HospitalStatus, HospitalType } from '../../enums/hospital.enum';
import { Member, TotalCounter } from '../member/member';
import { MeLiked } from '../like/like';

@ObjectType()
export class Hospital {
	@Field(() => String)
	_id: ObjectId;

	@Field(() => HospitalType)
	hospitalType: HospitalType;

	@Field(() => HospitalStatus)
	hospitalStatus: HospitalStatus;

	@Field(() => HospitalLocation)
	hospitalLocation: HospitalLocation;

	@Field(() => String)
	hospitalAddress: string;

	@Field(() => String)
	hospitalTitle: string;

	@Field(() => Number)
	hospitalPrice: number;

	@Field(() => Number)
	hospitalSquare: number;

	@Field(() => Int)
	hospitalBeds: number;

	@Field(() => Int)
	hospitalRooms: number;

	@Field(() => Int)
	hospitalViews: number;

	@Field(() => Int)
	hospitalLikes: number;

	@Field(() => Int)
	hospitalComments: number;

	@Field(() => Int)
	hospitalRank: number;

	@Field(() => [String])
	hospitalImages: string[];

	@Field(() => String, { nullable: true })
	hospitalDesc?: string;

	@Field(() => Boolean)
	hospitalBarter: boolean;

	@Field(() => Boolean)
	hospitalRent: boolean;

	@Field(() => String)
	memberId: ObjectId;

	@Field(() => Date, { nullable: true })
	soldAt?: Date;

	@Field(() => Date, { nullable: true })
	deletedAt?: Date;

	@Field(() => Date, { nullable: true })
	constructedAt?: Date;

	@Field(() => Date)
	createdAt: Date;

	@Field(() => Date)
	updatedAt: Date;

	// from aggregation
	// from aggregate //
	@Field(() => [MeLiked], { nullable: true })
	meLiked?: MeLiked[];

	@Field(() => Member, { nullable: true })
	memberData?: Member;
}

@ObjectType()
export class Hospitals {
	@Field(() => [Hospital])
	list: Hospital[];

	@Field(() => [TotalCounter], { nullable: true })
	metaCounter: TotalCounter[];
}
