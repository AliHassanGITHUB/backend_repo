"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminModule = void 0;
const common_1 = require("@nestjs/common");
const auth_module_1 = require("../auth/auth.module");
const prisma_module_1 = require("../prisma/prisma.module");
const categories_service_1 = require("./categories.service");
const categories_controller_1 = require("./categories.controller");
const requirements_service_1 = require("./requirements.service");
const requirements_controller_1 = require("./requirements.controller");
const documents_service_1 = require("./documents.service");
const documents_controller_1 = require("./documents.controller");
const applications_service_1 = require("./applications.service");
const applications_controller_1 = require("./applications.controller");
const registrations_service_1 = require("./registrations.service");
const registrations_controller_1 = require("./registrations.controller");
const dashboard_controller_1 = require("./dashboard.controller");
let AdminModule = class AdminModule {
};
exports.AdminModule = AdminModule;
exports.AdminModule = AdminModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule, auth_module_1.AuthModule],
        controllers: [
            dashboard_controller_1.DashboardController,
            categories_controller_1.CategoriesController,
            requirements_controller_1.RequirementsController,
            documents_controller_1.DocumentsController,
            applications_controller_1.ApplicationsController,
            registrations_controller_1.RegistrationsController,
        ],
        providers: [
            categories_service_1.CategoriesService,
            requirements_service_1.RequirementsService,
            documents_service_1.DocumentsService,
            applications_service_1.ApplicationsService,
            registrations_service_1.RegistrationsService,
        ],
    })
], AdminModule);
//# sourceMappingURL=admin.module.js.map