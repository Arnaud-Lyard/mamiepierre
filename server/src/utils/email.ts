import nodemailer from 'nodemailer';
import pug from 'pug';
import { convert } from 'html-to-text';
import { Prisma } from '@prisma/client';
import { logger } from '../app';
import { Lang } from '../types/lang';

const smtp = {
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT),
  user: process.env.EMAIL_USER,
  pass: process.env.EMAIL_PASS,
};

export default class Email {
  #username: string;
  #to: string;
  #from: string;

  constructor(private user: Prisma.UserCreateInput, private url: string) {
    this.#username = user.username.split(' ')[0];
    this.#to = user.email;
    this.#from = `Tournament <contact@tournament.com>`;
  }

  private newTransport() {
    return nodemailer.createTransport({
      ...smtp,
      auth: {
        user: smtp.user,
        pass: smtp.pass,
      },
    });
  }

  private async send(template: string, langage: Lang, subject: string) {
    try {
      // Generate HTML template based on the template string
      const html = pug.renderFile(
        `${__dirname}/../views/${langage}/${template}.pug`,
        {
          username: this.#username,
          subject,
          url: this.url,
        }
      );

      // Create mailOptions
      const mailOptions = {
        from: this.#from,
        to: this.#to,
        subject,
        text: convert(html),
        html,
      };

      // Send email
      const info = await this.newTransport().sendMail(mailOptions);
      // console.log(nodemailer.getTestMessageUrl(info));
    } catch (error) {
      logger.error(`Error during send mail: ${error}`);
    }
  }

  async sendVerificationCode(langage: Lang) {
    const subject =
      langage === 'fr'
        ? `Votre code d'activation de compte`
        : `Your account activation code`;
    await this.send('verificationCode', langage, subject);
  }

  async sendPasswordResetToken(langage: Lang) {
    const subject =
      langage === 'fr'
        ? `Votre réinitialisation de mot de passe (valide pour seulement 10 minutes)`
        : `Your password reset token (valid for only 10 minutes)`;
    await this.send('resetPassword', langage, subject);
  }
}
