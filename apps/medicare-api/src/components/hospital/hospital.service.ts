import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId } from 'mongoose';
import {
	AgentHospitalsInquiry,
	AllHospitalsInquiry,
	OrdinaryInquiry,
	HospitalsInquiry,
	HospitalInput,
} from '../../libs/dto/hospital/hospital.input';
import { Hospitals, Hospital } from '../../libs/dto/hospital/hospital';
import { Direction, Message } from '../../libs/enums/common.enum';
import { MemberService } from '../member/member.service';
import { StatisticModifier, T } from '../../libs/types/common';
import { HospitalStatus } from '../../libs/enums/hospital.enum';
import { ViewGroup } from '../../libs/enums/view.enum';
import { ViewService } from '../view/view.service';
import { HospitalUpdate } from '../../libs/dto/hospital/hospital.update';
import { lookupAuthMemberLiked, lookupMember, shapeIntoMongoObjectId } from '../../libs/config';
import { LikeGroup } from '../../libs/enums/like.enum';
import { LikeInput } from '../../libs/dto/like/like.input';
import { LikeService } from '../like/like.service';

@Injectable()
export class HospitalService {
	constructor(
		@InjectModel('Hospital') private readonly hospitalModel: Model<Hospital>,
		private memberService: MemberService,
		private readonly viewService: ViewService,
		private readonly likeService: LikeService,
	) {}

	public async createHospital(input: HospitalInput): Promise<Hospital> {
		try {
			input.hospitalPrice = input.hospitalPrice ?? 0;
			const result = await this.hospitalModel.create(input);
			// increase memberHospitals
			await this.memberService.memberStatsEditor({
				_id: result.memberId,
				targetKey: 'memberHospitals',
				modifier: 1,
			});
			return result;
		} catch (err) {
			console.log('Error, Service.model:', err);
			throw new BadRequestException(Message.CREATE_FAILED);
		}
	}

	public async getHospital(memberId: ObjectId, hospitalId: ObjectId): Promise<Hospital> {
		const search: T = {
			_id: hospitalId,
			hospitalStatus: HospitalStatus.ACTIVE,
		};

		const targetHospital: Hospital = await this.hospitalModel.findOne(search).lean().exec();
		if (!targetHospital) throw new InternalServerErrorException(Message.NO_DATA_FOUND);

		if (memberId) {
			const viewInput = { memberId: memberId, viewRefId: hospitalId, viewGroup: ViewGroup.HOSPITAL };
			const newView = await this.viewService.recordView(viewInput);
			if (newView) {
				await this.hospitalStatsEditor({ _id: hospitalId, targetKey: 'hospitalViews', modifier: 1 });
				targetHospital.hospitalViews++;
			}

			// meLiked
			const likeInput = { memberId, likeRefId: hospitalId, likeGroup: LikeGroup.HOSPITAL };
			targetHospital.meLiked = await this.likeService.checkLikeExistence(likeInput);
		}

		targetHospital.memberData = await this.memberService.getMember(null, targetHospital.memberId);
		return targetHospital;
	}

	public async updateHospital(memberId: ObjectId, input: HospitalUpdate): Promise<Hospital> {
		const { hospitalStatus } = input;
		const search: T = {
			_id: input._id,
			memberId: memberId,
			hospitalStatus: HospitalStatus.ACTIVE,
		};

		if (hospitalStatus === HospitalStatus.DELETE) input.deletedAt = new Date();

		const result = await this.hospitalModel
			.findOneAndUpdate(search, input, {
				new: true,
			})
			.exec();

		if (!result) throw new InternalServerErrorException(Message.UPDATE_FAILED);

		if (input.deletedAt) {
			await this.memberService.memberStatsEditor({
				_id: memberId,
				targetKey: 'memberHospitals',
				modifier: -1,
			});
		}

		return result;
	}

	public async getHospitals(memberId: ObjectId, input: HospitalsInquiry): Promise<Hospitals> {
		const match: T = { hospitalStatus: HospitalStatus.ACTIVE };
		const sort: T = { [input?.sort ?? 'createdAt']: input?.direction ?? Direction.DESC };

		this.shapeMatchQuery(match, input);
		console.log('match:', match);

		const result = await this.hospitalModel
			.aggregate([
				{ $match: match },
				{ $sort: sort },
				{
					$facet: {
						list: [
							{ $skip: (input.page - 1) * input.limit },
							{ $limit: input.limit },
							lookupAuthMemberLiked(memberId),
							lookupMember,
							{ $unwind: '$memberData' },
						],
						metaCounter: [{ $count: 'total' }],
					},
				},
			])
			.exec();

		if (!result.length) throw new InternalServerErrorException(Message.NO_DATA_FOUND);

		return result[0];
	}
	private shapeMatchQuery(match: T, input: HospitalsInquiry): void {
		const {
			memberId,
			locationList,
			roomsList,
			bedsList,
			typeList,
			periodsRange,
			pricesRange,
			squaresRange,
			options,
			text,
		} = input.search;

		if (memberId) match.memberId = shapeIntoMongoObjectId(memberId);
		if (locationList && locationList.length) match.hospitalLocation = { $in: locationList };
		if (roomsList && roomsList.length) match.hospitalRooms = { $in: roomsList };
		if (bedsList && bedsList.length) match.hospitalBeds = { $in: bedsList };
		if (typeList && typeList.length) match.hospitalType = { $in: typeList };

		if (pricesRange) match.hospitalPrice = { $gte: pricesRange.start, $lte: pricesRange.end };
		if (periodsRange) match.createdAt = { $gte: periodsRange.start, $lte: periodsRange.end };
		if (squaresRange) match.hospitalSquare = { $gte: squaresRange.start, $lte: squaresRange.end };

		if (text) match.hospitalTitle = { $regex: new RegExp(text, 'i') };
		if (options) {
			match['$or'] = options.map((ele) => {
				return { [ele]: true };
			});
		}
	}

	public async getFavorites(memberId: ObjectId, input: OrdinaryInquiry): Promise<Hospitals> {
		return await this.likeService.getFavoriteHospitals(memberId, input);
	}

	public async getVisited(memberId: ObjectId, input: OrdinaryInquiry): Promise<Hospitals> {
		return await this.likeService.getFavoriteHospitals(memberId, input);
	}

	public async getAgentHospitals(memberId: ObjectId, input: AgentHospitalsInquiry): Promise<Hospitals> {
		const { hospitalStatus } = input.search;
		if (hospitalStatus === HospitalStatus.DELETE) throw new BadRequestException(Message.NOT_ALLOWED_REQUEST);

		const match: T = {
			memberId: memberId,
			hospitalStatus: hospitalStatus ?? { $ne: HospitalStatus.DELETE },
		};
		const sort: T = { [input?.sort ?? 'createdAt']: input?.direction ?? Direction.DESC };

		const result = await this.hospitalModel
			.aggregate([
				{ $match: match },
				{ $sort: sort },
				{
					$facet: {
						list: [
							{ $skip: (input.page - 1) * input.limit },
							{ $limit: input.limit },
							lookupMember,
							{ $unwind: '$memberData' },
						],
						metaCounter: [{ $count: 'total' }],
					},
				},
			])
			.exec();

		if (!result.length) throw new InternalServerErrorException(Message.NO_DATA_FOUND);

		return result[0];
	}

	async likeTargetHospital(memberId: ObjectId, likeRefId: ObjectId): Promise<Hospital> {
		const target: Hospital = await this.hospitalModel
			.findOne({ _id: likeRefId, hospitalStatus: HospitalStatus.ACTIVE })
			.exec();
		if (!target) throw new InternalServerErrorException(Message.NO_DATA_FOUND);

		const input: LikeInput = {
			memberId: memberId,
			likeRefId: likeRefId,
			likeGroup: LikeGroup.HOSPITAL,
		};

		const modifier: number = await this.likeService.toggleLike(input);
		const result = await this.hospitalStatsEditor({ _id: likeRefId, targetKey: 'hospitalLikes', modifier: modifier });

		if (!result) throw new InternalServerErrorException(Message.SOMETHING_WENT_WRONG);
		return result;
	}
	public async getAllHospitalsByAdmin(input: AllHospitalsInquiry): Promise<Hospitals> {
		const { hospitalStatus, hospitalLocationList } = input.search;
		const match: T = {};
		const sort: T = { [input?.sort ?? 'createdAt']: input?.direction ?? Direction.DESC };

		if (hospitalStatus) match.hospitalStatus = hospitalStatus;
		if (hospitalLocationList) match.hospitalLocation = { $in: hospitalLocationList };

		const result = await this.hospitalModel
			.aggregate([
				{ $match: match },
				{ $sort: sort },
				{
					$facet: {
						list: [
							{ $skip: (input.page - 1) * input.limit },
							{ $limit: input.limit },
							lookupMember,
							{ $unwind: '$memberData' },
						],
						metaCounter: [{ $count: 'total' }],
					},
				},
			])
			.exec();

		if (!result.length) throw new InternalServerErrorException(Message.NO_DATA_FOUND);

		return result[0];
	}
	public async updateHospitalByAdmin(input: HospitalUpdate): Promise<Hospital> {
		const { hospitalStatus } = input;
		const search: T = {
			_id: input._id,
			hospitalStatus: HospitalStatus.ACTIVE,
		};

		if (hospitalStatus === HospitalStatus.DELETE) input.deletedAt = new Date();

		const result = await this.hospitalModel
			.findOneAndUpdate(search, input, {
				new: true,
			})
			.exec();

		if (!result) throw new InternalServerErrorException(Message.UPDATE_FAILED);

		if (input.deletedAt) {
			await this.memberService.memberStatsEditor({
				_id: result.memberId,
				targetKey: 'memberHospitals',
				modifier: -1,
			});
		}

		return result;
	}

	public async removeHospitalByAdmin(hospitalId: ObjectId): Promise<Hospital> {
		const search: T = { _id: hospitalId, hospitalStatus: HospitalStatus.DELETE };
		const result = await this.hospitalModel.findOneAndDelete(search).exec();
		if (!result) throw new InternalServerErrorException(Message.REMOVE_FAILED);

		return result;
	}

	public async hospitalStatsEditor(input: StatisticModifier): Promise<Hospital> {
		const { _id, targetKey, modifier } = input;
		return await this.hospitalModel
			.findByIdAndUpdate(
				_id,
				{ $inc: { [targetKey]: modifier } },
				{
					new: true,
				},
			)
			.exec();
	}
}
