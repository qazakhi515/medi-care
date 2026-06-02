import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { ObjectId } from 'mongoose';
import { DoctorScheduleService } from './doctor-schedule.service';
import { DoctorSchedule, DoctorSchedules } from '../../libs/dto/doctor-schedule/doctor-schedule';
import { DoctorScheduleInput, DoctorSchedulesInquiry } from '../../libs/dto/doctor-schedule/doctor-schedule.input';
import { DoctorScheduleUpdate } from '../../libs/dto/doctor-schedule/doctor-schedule.update';
import { Roles } from '../auth/decorators/roles.decorator';
import { MemberType } from '../../libs/enums/member.enum';
import { AuthMember } from '../auth/decorators/authMember.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { WithoutGuard } from '../auth/guards/without.guard';
import { shapeIntoMongoObjectId } from '../../libs/config';

@Resolver()
export class DoctorScheduleResolver {
	constructor(private readonly doctorScheduleService: DoctorScheduleService) {}

	@Roles(MemberType.DOCTOR)
	@UseGuards(RolesGuard)
	@Mutation(() => DoctorSchedule)
	public async createDoctorSchedule(
		@Args('input') input: DoctorScheduleInput,
		@AuthMember('_id') memberId: ObjectId,
	): Promise<DoctorSchedule> {
		console.log('Mutation: createDoctorSchedule');
		input.doctorId = shapeIntoMongoObjectId(input.doctorId);
		return await this.doctorScheduleService.createDoctorSchedule(memberId, input);
	}

	@UseGuards(WithoutGuard)
	@Query(() => DoctorSchedules)
	public async getDoctorSchedules(@Args('input') input: DoctorSchedulesInquiry): Promise<DoctorSchedules> {
		console.log('Query: getDoctorSchedules');
		return await this.doctorScheduleService.getDoctorSchedules(input);
	}

	@Roles(MemberType.DOCTOR)
	@UseGuards(RolesGuard)
	@Mutation(() => DoctorSchedule)
	public async updateDoctorSchedule(
		@Args('input') input: DoctorScheduleUpdate,
		@AuthMember('_id') memberId: ObjectId,
	): Promise<DoctorSchedule> {
		console.log('Mutation: updateDoctorSchedule');
		input._id = shapeIntoMongoObjectId(input._id);
		return await this.doctorScheduleService.updateDoctorSchedule(memberId, input);
	}

	@Roles(MemberType.DOCTOR)
	@UseGuards(RolesGuard)
	@Mutation(() => DoctorSchedule)
	public async removeDoctorSchedule(
		@Args('scheduleId') input: string,
		@AuthMember('_id') memberId: ObjectId,
	): Promise<DoctorSchedule> {
		console.log('Mutation: removeDoctorSchedule');
		const scheduleId = shapeIntoMongoObjectId(input);
		return await this.doctorScheduleService.removeDoctorSchedule(memberId, scheduleId);
	}
}
