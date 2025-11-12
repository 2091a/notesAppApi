import { sendOtp, verifyOtp } from "../utils/otpService.js";

export const sendOtpController = async (req, res) => {
  try {
    const { email } = req.body;
    await sendOtp(email);
    res.status(200).json({ success: true, message: "OTP sent successfully!" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to send OTP", error });
  }
};

export const verifyOtpController = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const isValid = verifyOtp(email, otp);
    if (isValid) {
      res.status(200).json({ success: true, message: "OTP verified successfully!" });
    } else {
      res.status(400).json({ success: false, message: "Invalid or expired OTP" });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: "Verification failed", error });
  }
};
