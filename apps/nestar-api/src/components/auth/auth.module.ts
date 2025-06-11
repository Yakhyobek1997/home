// auth.module.ts
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.service';
// boshqa importlar

@Module({
  imports: [
    JwtModule.register({
      secret: '',  // secret
      signOptions: { expiresIn: '1d' },
    }),
    // boshqa modullar
  ],
  providers: [AuthService /**/],
  exports: [AuthService],
})
export class AuthModule {}
