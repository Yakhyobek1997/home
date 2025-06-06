import { Model } from 'mongoose';
import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Member } from '../../libs/dto/member/member';
import { LoginInput, MemberInput } from '../../libs/dto/member/member.input';
import { MemberStatus } from '../../libs/enums/member.enum';
import { Message } from '../../libs/enums/common.enum';
import * as bcrypt from 'bcryptjs';


@Injectable()
export class MemberService {
  constructor(@InjectModel('Member') private readonly memberModel: Model<Member>) {}

  public async signup(input: MemberInput): Promise<Member> {
  try {
    if (input.memberPassword) {
      input.memberPassword = await bcrypt.hash(input.memberPassword, 10);
    }

    const result = await this.memberModel.findOneAndUpdate(
      { memberPhone: input.memberPhone }, // filter
      { $set: input },                    // update
      { new: true, upsert: true }         // new: return updated, upsert: create if not found
    ).exec();

    return result;
  } catch (err) {
    console.log('Error, Service.model:', err);
    throw new BadRequestException(err);
  }
}




    public async login(input: LoginInput): Promise<Member> {
  const { memberNick, memberPassword } = input;
  const response: Member | null = await this.memberModel
    .findOne({ memberNick: memberNick })
    .select('+memberPassword')
    .exec();

  if (
    !response ||
    String(response.memberStatus) === String(MemberStatus.DELETE)
  ) {
    throw new InternalServerErrorException(Message.NO_MEMBER_NICK);
  } else if (String(response.memberStatus) === String(MemberStatus.BLOCK)) {
    throw new InternalServerErrorException(Message.BLOCKED_USER);
  }

  // TODO: Compare passwords
  console.log('response:', response);
  const isMatch = memberPassword === response.memberPassword;
  if (!isMatch) throw new InternalServerErrorException(Message.WRONG_PASSWORD);

  return response;
}


    public async updateMember(): Promise<string> {
        return "updateMember executed"
    }

    public async getMember(): Promise<string> {
        return "getMember executed"
    }
}
