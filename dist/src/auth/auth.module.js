"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const jwt_1 = require("@nestjs/jwt");
const passport_1 = require("@nestjs/passport");
const auth_controller_1 = require("./auth.controller");
const auth_service_1 = require("./auth.service");
const hashing_service_1 = require("./hashing.service");
const jwt_strategy_1 = require("./strategies/jwt.strategy");
const admin_jwt_guard_1 = require("./guards/admin-jwt.guard");
const citizen_jwt_guard_1 = require("./guards/citizen-jwt.guard");
let AuthModule = class AuthModule {
};
exports.AuthModule = AuthModule;
exports.AuthModule = AuthModule = __decorate([
    (0, common_1.Module)({
        imports: [
            passport_1.PassportModule,
            jwt_1.JwtModule.registerAsync({
                imports: [config_1.ConfigModule],
                useFactory: (config) => ({
                    secret: config.getOrThrow('JWT_SECRET'),
                    signOptions: { expiresIn: '8h' },
                }),
                inject: [config_1.ConfigService],
            }),
        ],
        controllers: [auth_controller_1.AuthController],
        providers: [auth_service_1.AuthService, hashing_service_1.HashingService, jwt_strategy_1.JwtStrategy, admin_jwt_guard_1.AdminJwtGuard, citizen_jwt_guard_1.CitizenJwtGuard],
        exports: [hashing_service_1.HashingService, jwt_1.JwtModule, admin_jwt_guard_1.AdminJwtGuard, citizen_jwt_guard_1.CitizenJwtGuard],
    })
], AuthModule);
//# sourceMappingURL=auth.module.js.map