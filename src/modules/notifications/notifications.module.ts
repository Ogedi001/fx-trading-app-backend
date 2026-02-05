import { Module } from '@nestjs/common';

import { MailService } from './services/mail.service';
import { MailModule } from 'src/infrastructure/mail/mail.module';

@Module({
  imports: [MailModule],
  providers: [MailService],
  exports: [MailService],
})
export class NotificationsModule {}
