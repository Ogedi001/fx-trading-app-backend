import { Injectable, Logger } from '@nestjs/common';
import { MailInterface, SendMailOptions } from './mail.interface';
import {
  TransactionalEmailsApi,
  SendSmtpEmail,
  TransactionalEmailsApiApiKeys,
} from '@getbrevo/brevo';
import mailConfig from '../../config/mail.config';

@Injectable()
export class BrevoMailAdapter implements MailInterface {
  private readonly logger = new Logger(BrevoMailAdapter.name);

  private getClient() {
    const api = new TransactionalEmailsApi();
    api.setApiKey(
      TransactionalEmailsApiApiKeys.apiKey,
      mailConfig.BREVO_API_KEY!,
    );
    return api;
  }

  async send(options: SendMailOptions): Promise<void> {
    const client = this.getClient();

    const email = new SendSmtpEmail();
    email.subject = options.subject;
    email.htmlContent = options.html;
    email.to = options.to.map((email) => ({ email }));
    email.sender = {
      name: 'CredPal',
      email: mailConfig.BREVO_SENDER_EMAIL,
    };

    try {
      await client.sendTransacEmail(email);
      this.logger.log(`Email sent to ${options.to.join(', ')}`);
    } catch (error) {
      this.logger.error('Failed to send email', error);
      throw error;
    }
  }
}
