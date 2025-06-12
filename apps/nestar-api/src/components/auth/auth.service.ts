import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { shapeIntoMongoObjectId } from '../../libs/config';
import { Member } from '../../libs/dto/member/member';
import { T } from '../../libs/types/common';

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {}

  // Parolni hash qilish (signup uchun)
  public async hashPassword(memberPassword: string): Promise<string> {
    const salt = await bcrypt.genSalt();
    return await bcrypt.hash(memberPassword, salt);
  }

  // Parollarni taqqoslash (login uchun)
  public async comparePasswords(password: string, hashedPassword: string): Promise<boolean> {
    return await bcrypt.compare(password, hashedPassword);
  }

  // JWT token yaratish
  public async createToken(member: Member): Promise<string> {
    const payload: T = {};
    Object.keys(member['_doc'] ? member['_doc'] : member).forEach((ele) => {
      payload[`${ele}`] = member[`${ele}`];
    });
    delete payload.memberPassword;
    return await this.jwtService.signAsync(payload);
  }

  // JWT tokenni tekshirish
  public async verifyToken(token: string): Promise<Member> {
    const member = await this.jwtService.verifyAsync(token);
    member._id = shapeIntoMongoObjectId(member._id);
    return member;
  }
}
