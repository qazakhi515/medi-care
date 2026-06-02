import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId } from 'mongoose';
import { View } from '../../libs/dto/view/view';
import { ViewInput } from '../../libs/dto/view/view.input';
import { T } from '../../libs/types/common';
import { lookupVisit } from '../../libs/config';
import { Hospitals } from '../../libs/dto/hospital/hospital';
import { ViewGroup } from '../../libs/enums/view.enum';
import { OrdinaryInquiry } from '../../libs/dto/hospital/hospital.input';

@Injectable()
export class ViewService {
	constructor(@InjectModel('View') private readonly viewModel: Model<View>) {}

	public async recordView(input: ViewInput): Promise<View | null> {
		const viewExist = await this.checkViewExictence(input);
		if (!viewExist) {
			console.log('-New View Insert-');
			return await this.viewModel.create(input);
		} else return null;
	}

	private async checkViewExictence(input: ViewInput): Promise<View> {
		const { memberId, viewRefId } = input;
		const search: T = { memberId: memberId, viewRefId: viewRefId };
		return await this.viewModel.findOne(search).exec();
	}
	public async getVisitedHospitals(memberId: ObjectId, input: OrdinaryInquiry): Promise<Hospitals> {
		const { page, limit } = input;
		const match: T = { viewGroup: ViewGroup.HOSPITAL, memberId: memberId };

		const data: T = await this.viewModel
			.aggregate([
				{ $match: match },
				{ $sort: { updatedAt: -1 } },
				{
					$lookup: {
						from: 'hospitals',
						localField: 'viewRefId',
						foreignField: '_id',
						as: 'visitedHospital',
					},
				},
				{ $unwind: '$visitedHospital' },
				{
					$facet: {
						list: [
							{ $skip: (page - 1) * limit },
							{ $limit: limit },
							lookupVisit,
							{ $unwind: '$visitedHospital.memberData' },
						],
						metaCounter: [{ $count: 'total' }],
					},
				},
			])
			.exec();

		const result: Hospitals = { list: [], metaCounter: data[0].metaCounter[0] };
		result.list = data[0].list.map((ele) => ele.visitedHospital);

		return result;
	}
}
