export interface SendMailOptions {
  to: string[];
  subject: string;
  html: string;
}

export interface MailInterface {
  send(options: SendMailOptions): Promise<void>;
}
