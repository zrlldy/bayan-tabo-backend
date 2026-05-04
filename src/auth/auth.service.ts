import { Injectable } from '@nestjs/common';
import { CreateAuthDto } from './dto/create-auth.dto';
import { Tokens } from './types';
import * as argon2 from 'argon2';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { LoginAuthDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private config: ConfigService,
  ) {}

  async create(createAuthDto: CreateAuthDto) {
    const user = await this.prisma.$transaction(async (ps) => {
      const newUser = await ps.user.create({
        data: {
          username: createAuthDto.username,
          email: createAuthDto.email,
          password: await this.hashData(createAuthDto.password),
          accountInfos: {
            create: {
              firstName: createAuthDto.username,
              lastName: createAuthDto.username,
              age: 0,
              barangay: 'Default Barangay',
              purok: 'Default Province',
            },
          },
        },
      });
      return newUser;
    });
    return user;
  }

  async login(authDto: LoginAuthDto): Promise<Tokens> {
    const user = await this.prisma.user.findFirst({
      where: {
        username: authDto.username,
      },
    });

    if (!user) {
      throw new Error('Invalid credentials');
    }

    const isMatch = await this.verifyHash(authDto.password, user.password);
    if (!isMatch) {
      throw new Error('Invalid credentials');
    }

    return Promise.resolve({
      access_token: 'access_token',
      refresh_token: 'refresh_token',
    });
  }

  logout() {}

  refreshToken(): Promise<Tokens> {
    return Promise.resolve({
      access_token: 'new_access_token',
      refresh_token: 'new_refresh_token',
    });
  }

  async getTokens(
    userId: string,
    username: string,
    sessionId: string,
  ): Promise<Tokens> {
    const jwtPayload = {
      sub: userId,
      username,
      sessionId,
    };

    const jwtRefereshPayload = {
      sub: userId,
      sessionId,
    };
    const [at, rt] = await Promise.all([
      this.jwtService.signAsync(jwtPayload, {
        secret: this.config.get<string>('AT_SECRET'),
        expiresIn: 60 * 15, // 15 minutes
      }),
      this.jwtService.signAsync(jwtRefereshPayload, {
        secret: this.config.get<string>('RT_SECRET'),
        expiresIn: 60 * 60 * 24 * 7, // 7 days
      }),
    ]);

    return Promise.resolve({
      access_token: at,
      refresh_token: rt,
    });
  }

  hashData(data: string) {
    return argon2.hash(data);
  }
  verifyHash(data: string, hash: string) {
    return argon2.verify(hash, data);
  }
}
