const User = require("../models/userModel");
const validator = require("validator");
const bcrypt = require("bcrypt");
const sendMail = require("../utils/email").sendMail;
const crypto = require("crypto");
exports.signUp = async (req, res) => {
  try {
    // 1- Check if the email entered is valid
    let email = req.body.email;

    if (!validator.isEmail(email)) {
      return res.status(400).json({ message: "Invalid email." });
    }

    // 2- Check if the email is already in use
    // findOne, return the first matched document
    const checkEmail = await User.findOne({ email: req.body.email });
    if (checkEmail) {
      return res.status(409).json({ message: "Email already in use." });
    }

    // 3- Check if the password & password confirm are the same
    let pass = req.body.password;
    let passConfirm = req.body.passwordConfirm;

    if (pass !== passConfirm) {
      return res
        .status(400)
        .json({ message: "Password and password Confirm are not the same." });
    }

    // const hashedPassword = await bcrypt.hash(pass, 12);

    // Create the new user
    const newUser = await User.create({
      fullName: req.body.fullName,
      email: req.body.email,
      password: req.body.password,
    });

    return res
      .status(201)
      .json({ message: "User created successfully.", data: { newUser } });

    // If everything is ok, we create the new user
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    // 1: Check if the user email exist in the DB
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
      return res.status(404).json({ message: " The user does not exist" });
    }

    // 2: Check if the entered password is matching with the hashed stored password

    // Candidate Password: ElieHannouch (entered by the user)
    // Stored Password: E35udwmdwkdnjnfnd (stored and hashed in the DB)
    // const comparePasswords = await bcrypt.compare(
    //   req.body.password,
    //   user.password
    // );
    // if (!comparePasswords) {
    //   return res.status(400).json({ message: "Incorrect credentials" });
    // }

    if (!(await user.checkPassword(req.body.password, user.password))) {
      return res.status(401).json({ message: "Incorrect email or password" });
    }
    // 3: If everything is ok, Log the user in
    return res
      .status(200)
      .json({ message: "You are logged in successfully !!" });
  } catch (err) {
    console.log(err);
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    // 1- Check if the user with the provided email exist
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
      return res
        .status(404)
        .json({ message: "The user with the provided email does not exist." });
    }
    // 2- Create the reset token to be sended via email

    const resetToken = user.generatePasswordResetToken();
    await user.save({ validateBeforeSave: false });

    // 3- send the token via the email
    // http://127.0.0.1:3000/api/auth/resetPassword/8ba2e2cf34d6ed5e9a73447334a0aa90c46ae917c8bdab63e241c27e37de1c36
    // 3.1 : Create this url

    const url = `${req.protocol}://${req.get(
      "host"
    )}/api/auth/resetPassword/${resetToken}`;

    const msg = `Forgot your password? Reset it by visiting the following link: ${url}`;

    try {
      await sendMail({
        email: user.email,
        subject: "Your password reset token: (Valid for 10 min)",
        message: msg,
      });

      res.status(200).json({
        status: "success",
        message: "The reset link was delivered to your email successfully",
      });
    } catch (err) {
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save({ validateBeforeSave: false });

      res.status(500).json({
        message:
          "An error occured while sending the email, pease try again in a moment",
      });
    }
  } catch (err) {
    console.log(err);
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const hashedToken = crypto
      .createHash("sha256")
      .update(req.params.token)
      .digest("hex");

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        message: "The token is invalid, or expired. Please request a new one",
      });
    }

    if (req.body.password.length < 8) {
      return res.status(400).json({ message: "Password length is too short" });
    }

    if (req.body.password !== req.body.passwordConfirm) {
      return res
        .status(400)
        .json({ message: "Password & Password Confirm are not the same" });
    }

    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    user.passwordChangedAt = Date.now();

    await user.save();
    return res.status(200).json({ message: "Password changed successfully" });
  } catch (err) {
    console.log(err);
  }
};
