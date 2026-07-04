import { JwtPayload } from '../strategies/jwt.strategy';
declare const CitizenJwtGuard_base: import("@nestjs/passport").Type<import("@nestjs/passport").IAuthGuard>;
export declare class CitizenJwtGuard extends CitizenJwtGuard_base {
    handleRequest<T extends JwtPayload>(err: Error, user: T): T;
}
export {};
