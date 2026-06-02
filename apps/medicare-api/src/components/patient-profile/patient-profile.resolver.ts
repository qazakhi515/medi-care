import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { ObjectId } from 'mongoose';
import { PatientProfileService } from './patient-profile.service';
import { PatientProfile, PatientProfiles } from '../../libs/dto/patient-profile/patient-profile';
import { PatientProfileInput, PatientProfilesInquiry } from '../../libs/dto/patient-profile/patient-profile.input';
import { PatientProfileUpdate } from '../../libs/dto/patient-profile/patient-profile.update';
import { Roles } from '../auth/decorators/roles.decorator';
import { MemberType } from '../../libs/enums/member.enum';
import { AuthMember } from '../auth/decorators/authMember.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { AuthGuard } from '../auth/guards/auth.guard';

@Resolver()
export class PatientProfileResolver {
	constructor(private readonly patientProfileService: PatientProfileService) {}

	@Roles(MemberType.PATIENT)
	@UseGuards(RolesGuard)
	@Mutation(() => PatientProfile)
	public async createPatientProfile(
		@Args('input') input: PatientProfileInput,
		@AuthMember('_id') memberId: ObjectId,
	): Promise<PatientProfile> {
		console.log('Mutation: createPatientProfile');
		input.memberId = memberId;
		return await this.patientProfileService.createPatientProfile(input);
	}

	@UseGuards(AuthGuard)
	@Query(() => PatientProfile)
	public async getPatientProfile(@AuthMember('_id') memberId: ObjectId): Promise<PatientProfile> {
		console.log('Query: getPatientProfile');
		return await this.patientProfileService.getPatientProfile(memberId);
	}

	@Roles(MemberType.PATIENT)
	@UseGuards(RolesGuard)
	@Mutation(() => PatientProfile)
	public async updatePatientProfile(
		@Args('input') input: PatientProfileUpdate,
		@AuthMember('_id') memberId: ObjectId,
	): Promise<PatientProfile> {
		console.log('Mutation: updatePatientProfile');
		return await this.patientProfileService.updatePatientProfile(memberId, input);
	}

	// Admin

	@Roles(MemberType.ADMIN)
	@UseGuards(RolesGuard)
	@Query(() => PatientProfiles)
	public async getAllPatientProfilesByAdmin(@Args('input') input: PatientProfilesInquiry): Promise<PatientProfiles> {
		console.log('Query: getAllPatientProfilesByAdmin');
		return await this.patientProfileService.getAllPatientProfilesByAdmin(input);
	}
}
