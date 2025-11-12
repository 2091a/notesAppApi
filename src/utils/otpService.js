import nodemailer from "nodemailer";

// In-memory store (you can replace with DB like Redis or Mongo if you want)
const otpStore = new Map();

// Generate random 6-digit OTP
const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();

// Setup Nodemailer transporter (using Gmail)
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER, // your Gmail
    pass: process.env.EMAIL_PASS, // App Password from Google
  },
});

// Send OTP email
export const sendOtp = async (email) => {
  const cleanEmail = email.trim().toLowerCase();
  const otp = generateOtp();
  otpStore.set(cleanEmail, otp);

  const mailOptions = {
    from: `"NotesApp OTP" <${process.env.EMAIL_USER}>`,
    to: cleanEmail,
    subject: "Your OTP Code",
    text: `Your verification code is ${otp}. It will expire in 5 minutes.`,
  };

  await transporter.sendMail(mailOptions);
  setTimeout(() => otpStore.delete(cleanEmail), 5 * 60 * 1000);
  return otp;
};

// Verify OTP
export const verifyOtp = (email, enteredOtp) => {
  const cleanEmail = email.trim().toLowerCase();
  const storedOtp = otpStore.get(cleanEmail);

  if (!storedOtp) return false;

  const isValid = storedOtp === enteredOtp.toString().trim();

  if (isValid) otpStore.delete(cleanEmail); // remove after success
  return isValid;
};
