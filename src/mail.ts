
// here is code fore email services, you can add your own service by implementing EmailService interface

const nodemailer = require('nodemailer');

export interface EmailService {
    sendEmail(to: string, subject: string, text: string): Promise<void>;
}

export function createEmailService(): EmailService {
    switch (process.env.EMAIL_SERVICE) {
        case 'Gmail':
            return new GmailService();
        case 'Seznam':
            return new SeznamService();
        case 'CustomSMTP':
            return new CustomSMTPService({
                host: process.env.SMTP_HOST!,
                port: parseInt(process.env.SMTP_PORT!, 10),
                secure: process.env.SMTP_SECURE === 'true',
                user: process.env.SMTP_USER!,
                pass: process.env.SMTP_PASS!,
            });
        default:
            throw new Error('Unsupported email service');
    }
}

class GmailService implements EmailService {
    async sendEmail(to: string, subject: string, text: string): Promise<void> {
        let transporter = nodemailer.createTransport({
            service: 'Gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        await transporter.sendMail({
            from: '"Project Planner" <no-reply@projectplanner.com>',
            to,
            subject,
            text,
        });
    }
}

class SeznamService implements EmailService {
    async sendEmail(to: string, subject: string, text: string): Promise<void> {
        let transporter = nodemailer.createTransport({
            host: 'smtp.seznam.cz',
            port: 465,
            secure: true,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        await transporter.sendMail({
            from: '"Project Planner" <no-reply@projectplanner.com>',
            to,
            subject,
            text,
        });
    }
}

class CustomSMTPService implements EmailService {
    private smtpConfig: {
        host: string;
        port: number;
        secure: boolean;
        user: string;
        pass: string;
    };

    constructor(smtpConfig: { host: string; port: number; secure: boolean; user: string; pass: string; }) {
        this.smtpConfig = smtpConfig;
    }

    async sendEmail(to: string, subject: string, text: string): Promise<void> {
        let transporter = nodemailer.createTransport({
            host: this.smtpConfig.host,
            port: this.smtpConfig.port,
            secure: this.smtpConfig.secure,
            auth: {
                user: this.smtpConfig.user,
                pass: this.smtpConfig.pass,
            },
        });

        await transporter.sendMail({
            from: `"Project Planner" <no-reply@${this.smtpConfig.user}>`,
            to,
            subject,
            text,
        });
    }
}


