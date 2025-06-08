import { MemberAuthType } from './../../enums/member.enum';
import { Field, InputType } from "@nestjs/graphql";
import { IsNotEmpty, Length, IsOptional } from "class-validator";
import { MemberType } from "../../enums/member.enum";

@InputType()
export class MemberInput {
  @IsNotEmpty()
  @Length(3, 16)
  @Field(() => String)
  memberNick: string;

  @IsNotEmpty()
  @Length(6, 18)
  @Field(() => String)
  memberPassword: string;

  @IsNotEmpty()
  @Field(() => String)
  memberPhone: string;

  @IsOptional()
  @Field(() => MemberType, { nullable: true })
  memberType?: MemberType;

  @IsOptional()
  @Field(() => MemberAuthType, { nullable: true })
  memberAuthType?: MemberType;
}

@InputType()
export class LoginInput {
  @IsNotEmpty()
  @Length(3, 16)
  @Field(() => String)
  memberNick: string;

  @IsNotEmpty()
  @Length(6, 18)
  @Field(() => String)
  memberPassword: string;
}