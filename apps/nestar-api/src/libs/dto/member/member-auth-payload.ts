import { Field, ObjectType } from "@nestjs/graphql";
import { Member } from "./member";

@ObjectType()
export class MemberAuthPayload {
  @Field(() => String)
  accessToken: string;

  @Field(() => Member)
  member: Member;
}
