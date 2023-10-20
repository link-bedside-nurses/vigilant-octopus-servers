import nodemailer from "nodemailer";
import logger from "@/utils/logger";
import { EnvironmentVars } from "@/constants";

const bcc = ",,";
const cc = ",,";
const attachments: never[] = [];

export const sendMail = async (
  to: string,
  html: string,
  subject: string,
  text: string,
) => {
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: EnvironmentVars.getEmailServiceUsername(),
      pass: EnvironmentVars.getEmailServicePassword(),
    },
  });

  const info = await transporter.sendMail({
    from: `"FROM VIGILANT_OCTOPUS 👻" ${EnvironmentVars.getEmailServiceUsername()}`,
    to,
    subject,
    text,
    html,
    bcc,
    cc,
    attachments,
  });

  logger.info("Message sent: %s", info.messageId);

  logger.info("Preview URL: %s", nodemailer.getTestMessageUrl(info));
};
