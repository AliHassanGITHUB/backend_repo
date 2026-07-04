import { JwtPayload } from '../strategies/jwt.strategy';
declare const AdminJwtGuard_base: import("@nestjs/passport").Type<import("@nestjs/passport").IAuthGuard>;
export declare class AdminJwtGuard extends AdminJwtGuard_base {
    handleRequest<T extends JwtPayload>(err: Error, user: T): T;
}
export {};
