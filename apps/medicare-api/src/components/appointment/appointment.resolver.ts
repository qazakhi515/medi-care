import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { ObjectId } from 'mongoose';
import { AppointmentService } from './appointment.service';
import { Appointment, Appointments } from '../../libs/dto/appointment/appointment';
import { DoctorAvailability } from '../../libs/dto/appointment/availability';
import {
	AppointmentInput,
	AppointmentsInquiry,
	DoctorAvailabilityInput,
} from '../../libs/dto/appointment/appointment.input';
import { AppointmentUpdate } from '../../libs/dto/appointment/appointment.update';
import { Roles } from '../auth/decorators/roles.decorator';
import { MemberType } from '../../libs/enums/member.enum';
import { AuthMember } from '../auth/decorators/authMember.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { AuthGuard } from '../auth/guards/auth.guard';
import { shapeIntoMongoObjectId } from '../../libs/config';

@Resolver()
export class AppointmentResolver {
	constructor(private readonly appointmentService: AppointmentService) {}

	@Roles(MemberType.PATIENT)
	@UseGuards(RolesGuard)
	@Mutation(() => Appointment)
	public async createAppointment(
		@Args('input') input: AppointmentInput,
		@AuthMember('_id') memberId: ObjectId,
	): Promise<Appointment> {
		console.log('Mutation: createAppointment');
		input.doctorId = shapeIntoMongoObjectId(input.doctorId);
		input.patientId = memberId;
		return await this.appointmentService.createAppointment(input);
	}

	@UseGuards(AuthGuard)
	@Query(() => DoctorAvailability)
	public async getDoctorAvailability(@Args('input') input: DoctorAvailabilityInput): Promise<DoctorAvailability> {
		console.log('Query: getDoctorAvailability');
		const doctorId = shapeIntoMongoObjectId(input.doctorId);
		return await this.appointmentService.getDoctorAvailability(doctorId, input.date);
	}

	@UseGuards(AuthGuard)
	@Query(() => Appointment)
	public async getAppointment(
		@Args('appointmentId') input: string,
		@AuthMember('_id') memberId: ObjectId,
	): Promise<Appointment> {
		console.log('Query: getAppointment');
		const appointmentId = shapeIntoMongoObjectId(input);
		return await this.appointmentService.getAppointment(memberId, appointmentId);
	}

	@UseGuards(AuthGuard)
	@Query(() => Appointments)
	public async getAppointments(@Args('input') input: AppointmentsInquiry): Promise<Appointments> {
		console.log('Query: getAppointments');
		return await this.appointmentService.getAppointments(input);
	}

	@UseGuards(AuthGuard)
	@Mutation(() => Appointment)
	public async updateAppointment(
		@Args('input') input: AppointmentUpdate,
		@AuthMember('_id') memberId: ObjectId,
	): Promise<Appointment> {
		console.log('Mutation: updateAppointment');
		input._id = shapeIntoMongoObjectId(input._id);
		return await this.appointmentService.updateAppointment(memberId, input);
	}

	// Admin

	@Roles(MemberType.ADMIN)
	@UseGuards(RolesGuard)
	@Mutation(() => Appointment)
	public async removeAppointmentByAdmin(@Args('appointmentId') input: string): Promise<Appointment> {
		console.log('Mutation: removeAppointmentByAdmin');
		const appointmentId = shapeIntoMongoObjectId(input);
		return await this.appointmentService.removeAppointmentByAdmin(appointmentId);
	}
}
