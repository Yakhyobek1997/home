import { Args, Mutation, Resolver, Query } from '@nestjs/graphql';
import { PropertyService } from './property.service';
import { Properties, Property } from '../../libs/dto/property/property';
import {
	AgentPropertiesInquiry,
	AllPropertiesInquiry,
	PropertiesInquiry,
	PropertyInput,
} from '../../libs/dto/property/property.input';
import { Roles } from '../auth/decorators/roles.decorator';
import { MemberType } from '../../libs/enums/member.enum';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UseGuards } from '@nestjs/common';
import { AuthMember } from '../auth/decorators/authMember.decorator';
import { ObjectId } from 'mongoose';
import { WithoutGuard } from '../auth/guards/without.guard';
import { shapeIntoMongoObjectId } from '../../libs/config';
import { PropertyUpdate } from '../../libs/dto/property/property.update';
import { AuthGuard } from '../auth/guards/auth.guard';
;

@Resolver()
export class PropertyResolver {
	constructor(private readonly propertyService: PropertyService) {}

	// Create pro
	@Roles(MemberType.AGENT)
	@UseGuards(RolesGuard)
	@Mutation(() => Property)
	public async createProperty(
		@Args('input') input: PropertyInput,
		@AuthMember('_id') memberId: ObjectId,
	): Promise<Property> {
		console.log('mutation: createProperty');
		input.memberId = memberId;
		return await this.propertyService.createProperty(input);
	}

	// Get pro
	@UseGuards(WithoutGuard)
	@Query(() => Property)
	public async getProperty(
		@Args('propertyId') input: string,
		@AuthMember('_id') memberId: ObjectId,
	): Promise<Property> {
		console.log('mutation: getProperty');
		const propertyId = shapeIntoMongoObjectId(input);
		return await this.propertyService.getProperty(memberId, propertyId);
	}
	// Update Pro
	@Roles(MemberType.AGENT)
	@UseGuards(RolesGuard)
	@Mutation(() => Property)
	public async updateProperty(
		@Args('input') input: PropertyUpdate,
		@AuthMember('_id') memberId: ObjectId,
	): Promise<Property> {
		console.log('mutation: updateProperty');
		input._id = shapeIntoMongoObjectId(input._id);
		return await this.propertyService.updateProperty(memberId, input);
	}

	/* Get Proporties */
	@UseGuards(WithoutGuard)
	@Query((returns) => Properties)
	public async getProperties(
		@Args('input') input: PropertiesInquiry,
		@AuthMember('_id') memberId: ObjectId,
	): Promise<Properties> {
		console.log('query: getProperties');
		return await this.propertyService.getProperties(memberId, input);
	}

	@Roles(MemberType.AGENT)
	@UseGuards(RolesGuard)
	@Query(() => Properties)
	public async getAgentProperties(
		@Args('input') input: AgentPropertiesInquiry,
		@AuthMember('_id') memberId: ObjectId,
	): Promise<Properties> {
		console.log('Query: getAgentProperties');
		return await this.propertyService.getAgentProperties(memberId, input);
	}

	@UseGuards(AuthGuard)
	@Mutation(() => Property)
	public async likeTargetProperty(
		@Args('propertyId') input: string,
		@AuthMember('_id') memberId: ObjectId,
	): Promise<Property> {
		console.log('Mutation: likeTargetProperty');
		const likeRefId = shapeIntoMongoObjectId(input);
		return await this.propertyService.likeTargetProperty(memberId, likeRefId);
	}


	/** ADMIN **/
	@Roles(MemberType.ADMIN)
	@UseGuards(RolesGuard)
	@Query(() => Properties)
	public async getAllPropertiesByAdmin(
		@Args('input') input: AllPropertiesInquiry,
		@AuthMember('_id') memberId: ObjectId,
	): Promise<Properties> {
		console.log('Query: getAllPropertiesByAdmin');
		return await this.propertyService.getAllPropertiesByAdmin(input);
	}

	@Roles(MemberType.ADMIN)
	@UseGuards(RolesGuard)
	@Mutation(() => Property)
	public async updatePropertyByAdmin(@Args('input') input: PropertyUpdate): Promise<Property> {
		console.log('Mutation: updatePropertyByAdmin');
		input._id = shapeIntoMongoObjectId(input._id);
		return await this.propertyService.updatePropertyByAdmin(input);
	}

	@Roles(MemberType.ADMIN)
	@UseGuards(RolesGuard)
	@Mutation(() => Property)
	public async removePropertyByAdmin(@Args('propertyId') input: string): Promise<Property> {
		console.log('Mutation: removePropertyByAdmin');
		const propertyId = shapeIntoMongoObjectId(input);
		return await this.propertyService.removePropertyByAdmin(propertyId);
	}
}
