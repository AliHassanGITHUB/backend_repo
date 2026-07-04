import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { JwtPayload } from '../strategies/jwt.strategy';

@Injectable()
export class CitizenJwtGuard extends AuthGuard('jwt') {
  handleRequest<T extends JwtPayload>(err: Error, user: T): T {
    if (err || !user || user.role !== 'citizen') {
      throw err ?? new UnauthorizedException('Citizen access required');
    }
    return user;
  }
}
