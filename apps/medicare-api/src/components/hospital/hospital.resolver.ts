import { Query, Args, Mutation, Resolver } from '@nestjs/graphql';
import { HospitalService } from './hospital.service';
import { Hospitals, Hospital } from '../../libs/dto/hospital/hospital';
import {
	AgentHospitalsInquiry,
	AllHospitalsInquiry,
	OrdinaryInquiry,
	HospitalsInquiry,
	HospitalInput,
} from '../../libs/dto/hospital/hospital.input';
import { Roles } from '../auth/decorators/roles.decorator';
import { MemberType } from '../../libs/enums/member.enum';
import { UseGuards } from '@nestjs/common';
import { AuthMember } from '../auth/decorators/authMember.decorator';
import { ObjectId } from 'mongoose';
import { RolesGuard } from '../auth/guards/roles.guard';
import { WithoutGuard } from '../auth/guards/without.guard';
import { shapeIntoMongoObjectId } from '../../libs/config';
import { HospitalUpdate } from '../../libs/dto/hospital/hospital.update';
import { AuthGuard } from '../auth/guards/auth.guard';

@Resolver()
export class HospitalResolver {
	constructor(private readonly hospitalService: HospitalService) {}

	@Roles(MemberType.DOCTOR)
	@UseGuards(RolesGuard)
	@Mutation(() => Hospital)
	public async createHospital(
		@Args('input') input: HospitalInput,
		@AuthMember('_id') memberId: ObjectId,
	): Promise<Hospital> {
		console.log('Mutation: createHospital');
		input.memberId = memberId;
		return await this.hospitalService.createHospital(input);
	}

	@UseGuards(WithoutGuard)
	@Query(() => Hospital)
	public async getHospital(
		@Args('hospitalId') input: string,
		@AuthMember('_id') memberId: ObjectId,
	): Promise<Hospital> {
		console.log('Query: getHospital');
		const hospitalId = shapeIntoMongoObjectId(input);
		return await this.hospitalService.getHospital(memberId, hospitalId);
	}

	@Roles(MemberType.DOCTOR)
	@UseGuards(RolesGuard)
	@Mutation((returns) => Hospital)
	public async updateHospital(
		@Args('input') input: HospitalUpdate,
		@AuthMember('_id') memberId: ObjectId,
	): Promise<Hospital> {
		console.log('Mutation: updateHospital');
		input._id = shapeIntoMongoObjectId(input._id);
		return await this.hospitalService.updateHospital(memberId, input);
	}

	@UseGuards(WithoutGuard)
	@Query((returns) => Hospitals)
	public async getHospitals(
		@Args('input') input: HospitalsInquiry,
		@AuthMember('_id') memberId: ObjectId,
	): Promise<Hospitals> {
		console.log('Query: getHospitals');
		return await this.hospitalService.getHospitals(memberId, input);
	}

	@UseGuards(AuthGuard)
	@Query((returns) => Hospitals)
	public async getFavorites(
		@Args('input') input: OrdinaryInquiry,
		@AuthMember('_id') memberId: ObjectId,
	): Promise<Hospitals> {
		console.log('Query: getFavorites');
		return await this.hospitalService.getFavorites(memberId, input);
	}

	@UseGuards(AuthGuard)
	@Query((returns) => Hospitals)
	public async getVisited(
		@Args('input') input: OrdinaryInquiry,
		@AuthMember('_id') memberId: ObjectId,
	): Promise<Hospitals> {
		console.log('Query: getVisited');
		return await this.hospitalService.getVisited(memberId, input);
	}

	@Roles(MemberType.DOCTOR)
	@UseGuards(RolesGuard)
	@Query((returns) => Hospitals)
	public async getAgentHospitals(
		@Args('input') input: AgentHospitalsInquiry,
		@AuthMember('_id') memberId: ObjectId,
	): Promise<Hospitals> {
		console.log('Query: getAgentHospitals');
		return await this.hospitalService.getAgentHospitals(memberId, input);
	}

	@UseGuards(AuthGuard)
	@Mutation(() => Hospital)
	public async likeTargetHospital(
		@Args('hospitalId') input: string,
		@AuthMember('_id') memberId: ObjectId,
	): Promise<Hospital> {
		console.log('Mutation: likeTargetHospital');
		const likeRefId = shapeIntoMongoObjectId(input);
		return await this.hospitalService.likeTargetHospital(memberId, likeRefId);
	}

	// Admin

	@Roles(MemberType.ADMIN)
	@UseGuards(RolesGuard)
	@Query((returns) => Hospitals)
	public async getAllHospitalsByAdmin(
		@Args('input') input: AllHospitalsInquiry,
		@AuthMember('_id') memberId: ObjectId,
	): Promise<Hospitals> {
		console.log('Query: getAllHospitalsByAdmin');
		return await this.hospitalService.getAllHospitalsByAdmin(input);
	}

	@Roles(MemberType.ADMIN)
	@UseGuards(RolesGuard)
	@Mutation((returns) => Hospital)
	public async updateHospitalByAdmin(@Args('input') input: HospitalUpdate): Promise<Hospital> {
		console.log('Mutation: updateHospitalByAdmin');
		input._id = shapeIntoMongoObjectId(input._id);
		return await this.hospitalService.updateHospitalByAdmin(input);
	}

	@Roles(MemberType.ADMIN)
	@UseGuards(RolesGuard)
	@Mutation((returns) => Hospital)
	public async removeHospitalByAdmin(@Args('hospitalId') input: string): Promise<Hospital> {
		console.log('Mutation: removeHospitalByAdmin');
		const hospitalId = shapeIntoMongoObjectId(input);
		return await this.hospitalService.removeHospitalByAdmin(hospitalId);
	}
}
