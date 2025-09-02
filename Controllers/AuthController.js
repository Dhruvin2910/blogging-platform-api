const UserModel = require("../Models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const dotenv = require("dotenv");
dotenv.config();

const signup = async (req, res) => {
  try {
    const { name, email, username, password } = req.body;
    const exsistingUser = await UserModel.findOne({
      $or: [{ username: username }, { email: email }],
    });

    if (exsistingUser) {
      return res.status(409).json({
        success: false,
        message:
          exsistingUser.email === email
            ? "User already exists"
            : "Username already taken",
      });
    }

    const userModel = new UserModel({ name, username, email, password });
    userModel.password = await bcrypt.hash(password, 10);
    await userModel.save();

    res
      .status(201)
      .json({ success: true, message: "User registered successfully" });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

const login = async (req, res) => {
  try {
    const { identifier, password } = req.body;

    const user = await UserModel.findOne({
      $or: [{ username: identifier }, { email: identifier }],
    });

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid Password" });
    }

    //generate jwt token
    const token = jwt.sign(
      { id: user.id || 1, username: user.username }, //payload
      process.env.SECRET_KEY,
      { expiresIn: "1h" } //token expires after one hour
    );
    res.cookie("token", token, {
      httpOnly: true,
      secure: true, //only over https
      sameSite: "strict", //CSRF protection
      maxAge: 60 * 60 * 1000, //1-hour
    });

    res.status(200).json({
      success: true,
      message: "Logged in successfully",
      token,
      userId: user.id,
    });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

// Function for masking email
function maskEmail(email) {
    const [name, domain] = email.split("@");
    if(name.length <= 2){
        return name[0]+"@"+domain;  //for very short email
    }
    return name[0]+"****"+name.slice(-1)+"@"+domain;
}

const forgotPassword = async (req, res) => {
  try {
    const { identifier } = req.body;

    if (!identifier) {
      return res
        .status(400)
        .json({ success: false, message: "Email or username is required" });
    }

    const user = await UserModel.findOne({
      $or: [{ email: identifier }, { username: identifier }],
    });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Generate token
    const token = crypto.randomBytes(20).toString("hex");
    user.resetPasswordToken = token;
    user.resetPasswordExpire = Date.now() + 15 * 60 * 1000; //15 min
    await user.save();

    // send mail
    const resetURL = `${process.env.CLIENT_URL}/reset-password/${token}`;
    const tranporter = nodemailer.createTransport({
      service: "Gmail",
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
    });
    await tranporter.sendMail({
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: "Password Reset",
      text: `Reset your password: ${resetURL}`,
    });

    // masked email for frontend
    const maskedEmail = maskEmail(user.email);
    res.status(200)
      .json({ success: true, message: "Password reset link sent to email", email: maskedEmail });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { newPassword } = req.body;

    if(newPassword.length > 15){
        return res.status(404).json({ success:false, message:"Password length should less then 15" });
    }else if(newPassword.length < 6){
        return res.status(404).json({ success:false, message:"Password length should greater then 6" });
    }

    const user = await UserModel.findOne({
      resetPasswordToken: token,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "Invalie or expire token" });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    return res.status(200).json({ success:true, message:"Password reset successfully" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports = { signup, login, forgotPassword, resetPassword };
