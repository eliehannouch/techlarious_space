const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, "Please enter your fullName"],
      trim: true,
    },

    email: {
      type: String,
      required: [true, "Please enter your email"],
      trim: true,
      unique: true,
      lowercase: true,
    },

    password: {
      type: String,
      trim: true,
      minLength: 8,
      maxLength: 30,
    },

    passwordConfirm: {
      type: String,
      trim: true,
      minLength: 8,
      maxLength: 30,
    },
  },
  { timestamps: true }
);

// Automated function
userSchema.pre("save", async function (next) {
  try {
    if (!this.isModified("password")) {
      return next();
    }
    this.password = await bcrypt.hash(this.password, 12);
    this.passwordConfirm = undefined;
  } catch (err) {
    console.log(err);
  }
});

// This function will always return 1 value: True or False
userSchema.methods.checkPassword = async function (
  candidatePassword, // Coming from the frontEnd as a plain text
  userPassword // Coming from the database as a hashed value
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

module.exports = mongoose.model("User", userSchema);
