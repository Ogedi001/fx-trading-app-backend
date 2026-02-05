import { Injectable } from '@nestjs/common';
import { BrevoMailAdapter } from 'src/infrastructure/mail/mail.adapter';
import { defaultTemplate } from 'src/infrastructure/mail/templates/default.template';

@Injectable()
export class MailService {
  constructor(private readonly mailAdapter: BrevoMailAdapter) {}

  async sendVerificationEmail(email: string, username: string, token: string) {
    const html = defaultTemplate(
      `<p>Your verification code is:</p><h1>${token}</h1>`,
      'Verify Account',
      username,
      'Verify Your Email',
      `https://credpal.com/verify?token=${token}`,
      true,
      'verification',
    );

    await this.mailAdapter.send({
      to: [email],
      subject: 'Verify your email',
      html,
    });
  }

  async sendWelcomeEmail(email: string, username: string) {
    const html = defaultTemplate(
      `<p>Welcome to CredPal!</p>`,
      '',
      username,
      'Welcome',
      '',
      false,
      'welcome',
    );

    await this.mailAdapter.send({
      to: [email],
      subject: 'Welcome to CredPal',
      html,
    });
  }
}
