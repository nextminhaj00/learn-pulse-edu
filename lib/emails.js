import EmailTemplate from '@/components/globals/EmailTemplate/EmailTemplate';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY || "re_Zyg8R1ui_Nt1sEFig3hrmFHHF2tFfC9Um");

export const sendEmails = async (emailInfo) => {
    if (!emailInfo) return null;

    const response = await Promise.allSettled(
        emailInfo?.map(async (data) => {
            if (data.to && data.message && data.subject) {
                const to = data.to;
                const subject = data.subject;
                const message = data.message;

                const sentInfo = await resend.emails.send({
                    from: 'Acme <onboarding@resend.dev>',
                    to: to,
                    subject: subject,
                    react: EmailTemplate({ message })
                });
                return sentInfo;
            } else {
                new Promise((reject) => {
                    return reject(
                        new Error(`Couldn't send email, please check the ${JSON.stringify(data)}.`)
                    );
                });
            }
        })
    );
    return response;
};
