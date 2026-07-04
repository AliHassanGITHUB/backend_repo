import { Global, Module } from '@nestjs/common';
import { VerifyService } from './verify.service';

@Global()
@Module({
  providers: [VerifyService],
  exports: [VerifyService],
})
export class VerifyModule {}
