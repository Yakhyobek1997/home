import { Field, InputType, Int } from '@nestjs/graphql';
import { IsIn, IsNotEmpty, IsOptional, Length, Min } from 'class-validator';
import {
  MemberAuthType,
  MemberStatus,
  MemberType,
} from '../../enums/member.enum';
import { availableAgentSorts, availableMemberSorts } from '../../config';
import { Direction } from '../../enums/common.enum';

@InputType()
export class MemberInput {
  @IsNotEmpty()
  @Length(3, 16)
  @Field(() => String)
  memberNick?: string;

  @IsNotEmpty()
  @Length(6, 18)
  @Field(() => String)
  memberPassword: string;

  @IsNotEmpty()
  @Field(() => String)
  memberPhone: string;

  @IsOptional()
  @Field(() => MemberType, { nullable: true })
  memberType: MemberType;

  @IsOptional()
  @Field(() => MemberAuthType, { nullable: true })
  memberAuthType: MemberType;
}

@InputType()
export class LoginInput {
  @IsNotEmpty()
  @Length(3, 16)
  @Field(() => String)
  memberNick?: string;

  @IsNotEmpty()
  @Length(6, 18)
  @Field(() => String)
  memberPassword: string;
}

@InputType()
class AiClass {
  @IsOptional()
  @Field(() => String, { nullable: true })
  text?: string;
}

@InputType()
export class AgentsInquiry {
  @IsNotEmpty()
  @Min(1)
  @Field(() => Int)
  page: number;

  @IsNotEmpty()
  @Min(1)
  @Field(() => Int)
  limit: number;

  @IsOptional()
  @IsIn([availableAgentSorts])
  @Field(() => String, { nullable: true })
  sort?: string;

  @IsOptional()
  @Field(() => Direction, { nullable: true })
  direction?: Direction;

  @IsNotEmpty()
  @Field(() => AiClass)
  search: AiClass;
}

@InputType()
class MIClass {
  @IsOptional()
  @Field(() => MemberStatus, { nullable: true })
  memberStatus?: MemberStatus;

  @IsOptional()
  @Field(() => MemberType, { nullable: true })
  memberType?: MemberType;

  @IsOptional()
  @Field(() => String, { nullable: true })
  text?: string;
}

@InputType()
export class MembersInquiry {
  @IsNotEmpty()
  @Min(1)
  @Field(() => Int)
  page: number;

  @IsNotEmpty()
  @Min(1)
  @Field(() => Int)
  limit: number;

  @IsOptional()
  @IsIn([availableMemberSorts])
  @Field(() => String, { nullable: true })
  sort?: string;

  @IsOptional()
  @Field(() => Direction, { nullable: true })
  direction?: Direction;

  @IsNotEmpty()
  @Field(() => MIClass)
  search: MIClass;
}