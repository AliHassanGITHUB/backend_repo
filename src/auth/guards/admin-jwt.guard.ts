import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { JwtPayload } from '../strategies/jwt.strategy';

@Injectable()
export class AdminJwtGuard extends AuthGuard('jwt') {
  handleRequest<T extends JwtPayload>(err: Error, user: T): T {
    if (err || !user || user.role !== 'admin') {
      throw err ?? new UnauthorizedException('Admin access required');
    }
    return user;
  }
}
