import { Injectable } from '@nestjs/common';
import { CreateAuthDto } from './dto/create-auth.dto';
import { Tokens } from './types';
import * as argon2 from 'argon2';

@Injectable()
export class AuthService {
  create(createAuthDto: CreateAuthDto) {
    return createAuthDto;
  }
  login() {}

  logout() {}

  refreshTokens(): Promise<Tokens> {
    return Promise.resolve({
      access_token: 'new_access_token',
      refresh_token: 'new_refresh_token',
    });
  }

  getTokens(): Promise<Tokens> {
    const access_token = 'access_token';
    const refresh_token = 'refresh_token';

    return Promise.resolve({
      access_token,
      refresh_token,
    });
  }

  hashData(data: string) {
    return argon2.hash(data);
  }
  verifyHash(data: string, hash: string) {
    return argon2.verify(hash, data);
  }
}
