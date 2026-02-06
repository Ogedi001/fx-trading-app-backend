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

    const maxRetries = 3;
    let attempt = 0;

    while (attempt < maxRetries) {
      try {
        attempt++;
        await client.sendTransacEmail(email);
        this.logger.log(
          `Email sent to ${options.to.join(', ')} (attempt ${attempt})`,
        );
        return; // success, exit
      } catch (error) {
        this.logger.error(`Failed to send email (attempt ${attempt})`, error);

        if (attempt >= maxRetries) {
          // rethrow after final attempt
          throw error;
        }

        // exponential backoff: wait 2^attempt * 500ms
        const delay = Math.pow(2, attempt) * 500;
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }
}
