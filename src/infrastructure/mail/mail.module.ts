import { Module } from '@nestjs/common';
import { BrevoMailAdapter } from './mail.adapter';

@Module({
  providers: [BrevoMailAdapter],
  exports: [BrevoMailAdapter],
})
export class MailModule {}
