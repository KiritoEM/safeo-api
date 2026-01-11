// mail.config.ts
import { registerAs } from '@nestjs/config';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PugAdapter } from '@nestjs-modules/mailer/dist/adapters/pug.adapter';
import * as path from 'path';

export default registerAs('mail', () => ({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587', 10),
  user: process.env.SMTP_USER,
  pass: process.env.SENDGRID_API_KEY,
  service: process.env.SMTP_SERVICE || 'gmail',
  from: process.env.FROM_EMAIL,
}));

export const mailOptions = {
  imports: [ConfigModule],
  useFactory: (configService: ConfigService) => {
    const config = {
      transport: {
        host: configService.get<string>('mail.host'),
        port: configService.get<number>('mail.port'),
        secure: false,
        auth: {
          user: configService.get<string>('mail.user'),
          pass: configService.get<string>('mail.pass'),
        },
        tls: {
          rejectUnauthorized: false,
        },
      },
      defaults: {
        from: configService.get<string>('mail.from'),
      },
      template: {
        dir: path.join(process.cwd(), 'src/mail/templates'),
        adapter: new PugAdapter(),
        options: {
          strict: true,
        },
      },
    };

    return config;
  },
  inject: [ConfigService],
};
