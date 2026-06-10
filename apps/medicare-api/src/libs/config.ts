import { ObjectId } from 'bson';

export const availableAgentSorts = ['createdAt', 'updatedAt', 'memberLikes', 'memberViews', 'memberRank'];
export const availableMemberSorts = ['createdAt', 'updatedAt', 'memberLikes', 'memberViews'];

export const availableOptions = ['hospitalBarter', 'hospitalRent'];
export const availableHospitalSorts = [
	'createdAt',
	'updatedAt',
	'hospitalLikes',
	'hospitalViews',
	'hospitalRank',
	'hospitalPrice',
];
export const availableBoardArticle = ['createdAt', 'updatedAt', 'articleLikes', 'articleViews'];
export const availableCommentSorts = ['createdAt', 'updatedAt'];

export const availableDoctorSorts = ['createdAt', 'updatedAt', 'doctorViews', 'doctorRank', 'consultationFee', 'experienceYears'];
export const availableScheduleSorts = ['createdAt', 'updatedAt', 'dayOfWeek', 'startTime'];
export const availableAppointmentSorts = ['createdAt', 'updatedAt', 'appointmentDate', 'startTime'];
export const availablePaymentSorts = ['createdAt', 'updatedAt', 'paidAt', 'amount'];

// IMAGE CONFIGURATION
import { v4 as uuidv4 } from 'uuid';
import * as path from 'path';
import { T } from './types/common';

export const validMimeTypes = ['image/png', 'image/jpg', 'image/jpeg'];
export const getSerialForImage = (filename: string) => {
	const ext = path.parse(filename).ext;
	return uuidv4() + ext;
};

export const shapeIntoMongoObjectId = (target: any) => {
	return typeof target === 'string' ? new ObjectId(target) : target;
};

export const lookupAuthMemberLiked = (memberId: T, targetRefId: string = '$_id') => {
	return {
		$lookup: {
			from: 'likes',
			let: {
				localLikeRefId: targetRefId,
				localMemberId: memberId,
				localMyFavorite: true,
			},
			pipeline: [
				{
					$match: {
						$expr: {
							$and: [{ $eq: ['$likeRefId', '$$localLikeRefId'] }, { $eq: ['$memberId', '$$localMemberId'] }],
						},
					},
				},
				{
					$project: {
						_id: 0,
						memberId: 1,
						likeRefId: 1,
						myFavorite: '$$localMyFavorite',
					},
				},
			],
			as: 'meLiked',
		},
	};
};

interface LookupAuthMemberFollowed {
	followerId: T;
	followingId: string;
}
export const lookupAuthMemberFollowed = (input: LookupAuthMemberFollowed) => {
	const { followerId, followingId } = input;
	return {
		$lookup: {
			from: 'follows',
			let: {
				localFollowerfId: followerId,
				localFollowingId: followingId,
				localMyFavorite: true,
			},
			pipeline: [
				{
					$match: {
						$expr: {
							$and: [{ $eq: ['$followerId', '$$localFollowerfId'] }, { $eq: ['$followingId', '$$localFollowingId'] }],
						},
					},
				},
				{
					$project: {
						_id: 0,
						followerId: 1,
						followingId: 1,
						myFallowing: '$$localMyFavorite',
					},
				},
			],
			as: 'meFollowed',
		},
	};
};

export const lookupMember = {
	$lookup: {
		from: 'members',
		localField: 'memberId',
		foreignField: '_id',
		as: 'memberData',
	},
};

export const lookupPatient = {
	$lookup: {
		from: 'members',
		localField: 'patientId',
		foreignField: '_id',
		as: 'patientData',
	},
};

export const lookupDoctor = {
	$lookup: {
		from: 'doctors',
		localField: 'doctorId',
		foreignField: '_id',
		as: 'doctorData',
	},
};

export const lookupHospital = {
	$lookup: {
		from: 'hospitals',
		localField: 'hospitalId',
		foreignField: '_id',
		as: 'hospitalData',
	},
};

export const lookupFollowingData = {
	$lookup: {
		from: 'members',
		localField: 'followingId',
		foreignField: '_id',
		as: 'followingData',
	},
};

export const lookupFollowerData = {
	$lookup: {
		from: 'members',
		localField: 'followerId',
		foreignField: '_id',
		as: 'followerData',
	},
};

export const lookupFavorite = {
	$lookup: {
		from: 'members',
		localField: 'favoriteHospital.memberId',
		foreignField: '_id',
		as: 'favoriteHospital.memberData',
	},
};

export const lookupVisit = {
	$lookup: {
		from: 'members',
		localField: 'visitedHospital.memberId ',
		foreignField: '_id',
		as: 'visitedHospital.memberData',
	},
};
