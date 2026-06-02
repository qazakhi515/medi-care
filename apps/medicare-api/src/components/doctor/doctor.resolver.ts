import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { ObjectId } from 'mongoose';
import { DoctorService } from './doctor.service';
import { Doctor, Doctors } from '../../libs/dto/doctor/doctor';
import { AllDoctorsInquiry, DoctorInput, DoctorsInquiry } from '../../libs/dto/doctor/doctor.input';
import { DoctorUpdate } from '../../libs/dto/doctor/doctor.update';
import { Roles } from '../auth/decorators/roles.decorator';
import { MemberType } from '../../libs/enums/member.enum';
import { AuthMember } from '../auth/decorators/authMember.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { WithoutGuard } from '../auth/guards/without.guard';
import { shapeIntoMongoObjectId } from '../../libs/config';

@Resolver()
export class DoctorResolver {
	constructor(private readonly doctorService: DoctorService) {}

	@Roles(MemberType.DOCTOR)
	@UseGuards(RolesGuard)
	@Mutation(() => Doctor)
	public async createDoctor(@Args('input') input: DoctorInput, @AuthMember('_id') memberId: ObjectId): Promise<Doctor> {
		console.log('Mutation: createDoctor');
		input.memberId = memberId;
		return await this.doctorService.createDoctor(input);
	}

	@UseGuards(WithoutGuard)
	@Query(() => Doctor)
	public async getDoctor(@Args('doctorId') input: string, @AuthMember('_id') memberId: ObjectId): Promise<Doctor> {
		console.log('Query: getDoctor');
		const doctorId = shapeIntoMongoObjectId(input);
		return await this.doctorService.getDoctor(memberId, doctorId);
	}

	@UseGuards(WithoutGuard)
	@Query(() => Doctors)
	public async getDoctors(@Args('input') input: DoctorsInquiry, @AuthMember('_id') memberId: ObjectId): Promise<Doctors> {
		console.log('Query: getDoctors');
		return await this.doctorService.getDoctors(memberId, input);
	}

	@Roles(MemberType.DOCTOR)
	@UseGuards(RolesGuard)
	@Mutation(() => Doctor)
	public async updateDoctor(@Args('input') input: DoctorUpdate, @AuthMember('_id') memberId: ObjectId): Promise<Doctor> {
		console.log('Mutation: updateDoctor');
		input._id = shapeIntoMongoObjectId(input._id);
		return await this.doctorService.updateDoctor(memberId, input);
	}

	// Admin

	@Roles(MemberType.ADMIN)
	@UseGuards(RolesGuard)
	@Query(() => Doctors)
	public async getAllDoctorsByAdmin(@Args('input') input: AllDoctorsInquiry): Promise<Doctors> {
		console.log('Query: getAllDoctorsByAdmin');
		return await this.doctorService.getAllDoctorsByAdmin(input);
	}

	@Roles(MemberType.ADMIN)
	@UseGuards(RolesGuard)
	@Mutation(() => Doctor)
	public async updateDoctorByAdmin(@Args('input') input: DoctorUpdate): Promise<Doctor> {
		console.log('Mutation: updateDoctorByAdmin');
		input._id = shapeIntoMongoObjectId(input._id);
		return await this.doctorService.updateDoctorByAdmin(input);
	}

	@Roles(MemberType.ADMIN)
	@UseGuards(RolesGuard)
	@Mutation(() => Doctor)
	public async removeDoctorByAdmin(@Args('doctorId') input: string): Promise<Doctor> {
		console.log('Mutation: removeDoctorByAdmin');
		const doctorId = shapeIntoMongoObjectId(input);
		return await this.doctorService.removeDoctorByAdmin(doctorId);
	}
}
