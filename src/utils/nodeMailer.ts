import nodemailer from "nodemailer";
import emailVerifyModel from "../models/emailVerifyModel";
import bcrypt from "bcryptjs";

interface IUser {
  _id?: string;
  email: string;
}

type IActions =
  | "emailVerification"
  | "appovedNotification"
  | "changePassword"
  | "deleteAccount";

const transporter = nodemailer.createTransport({
  service: "gmail",
  secure: true,
  auth: {
    user: process.env.NODEMAIL_EMAIL,
    pass: process.env.NODEMAIL_PASSWORD,
  },
});

const sendEmail = async (foundUser: IUser, action: IActions) => {
  try {
    let subject = "";
    let message = "";
    let randomGeneratedCode: number | null = null;

    if (action === "emailVerification" || action === "changePassword") {
      // generate a random 6-digit code
      randomGeneratedCode = Math.floor(100000 + Math.random() * 900000);
      const salt: string = await bcrypt.genSalt(10);
      const hashedCode: string = await bcrypt.hash(
        randomGeneratedCode.toString(),
        salt
      );

      // save hashed code to database
      await emailVerifyModel.create({
        author: foundUser._id,
        hashedCode,
      });
    }

    if (action === "emailVerification") {
      subject = "Email Verification Code";
      message = `Your email verification code is: ${randomGeneratedCode}`;
    } else if (action === "changePassword") {
      subject = "Password Reset Code";
      message = `Your password reset code is: ${randomGeneratedCode}`;
    } else if (action === "deleteAccount") {
      subject = "Account Deletion";
      message = "Your account as an admin has been removed";
    } else if (action === "appovedNotification") {
      subject = "Account Approved";
      message = "Your account has been approved successfully by an admin!";
    }

    // send the email
    const sentMail: nodemailer.SentMessageInfo = await transporter.sendMail({
      from: process.env.NODEMAIL_EMAIL,
      to: foundUser.email,
      subject,
      text: message,
    });

    console.log("New email sent, id: ", sentMail.response);
  } catch (error) {
    console.error("Error sending email:", error);
    throw new Error("Failed to send email.");
  }
};

export default sendEmail;
