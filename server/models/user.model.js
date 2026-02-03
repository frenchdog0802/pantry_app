import mongoose from "mongoose";
import crypto from "crypto";

const UserSchema = new mongoose.Schema(
  {
    first_name: { type: String, required: true, trim: true },
    last_name: { type: String, required: true, trim: true },
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: "Email is required",
      unique: "Email already exists",
      trim: true,
      match: [/.+\@.+\..+/, "Please fill a valid email address"],
    },
    hashed_password: { type: String, required: "Password is required" },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    ConnectAccount: { type: String },
    salt: String,
    googleId: { type: String },
    auth0Id: { type: String },  // Auth0 user identifier (sub claim)
    picture: { type: String },
    createdAt: { type: Number, default: () => Math.floor(Date.now() / 1000) },
    updatedAt: { type: Number, default: () => Math.floor(Date.now() / 1000) },
  }
);
UserSchema.virtual("password")
  .set(function (password) {
    this._password = password;
    this.salt = this.makeSalt();
    //this.hashed_password = password;
    this.hashed_password = this.encryptPassword(password);
  })
  .get(function () {
    return this._password;
  });
UserSchema.path("hashed_password").validate(function (v) {
  if (this._password && this._password.length < 6) {
    this.invalidate("password", "Password must be at least 6 characters.");
  }
  if (this.isNew && !this._password) {
    this.invalidate("password", "Password is required");
  }
}, null);
UserSchema.methods = {
  authenticate: function (plainText) {
    const a = this.encryptPassword(plainText);
    return this.encryptPassword(plainText) === this.hashed_password;
  },
  encryptPassword: function (password) {
    if (!password) return "";
    try {
      return crypto
        .createHmac("sha1", this.salt)
        .update(password)
        .digest("hex");
    } catch (err) {
      console.log(err);
      return "";
    }
  },
  makeSalt: function () {
    return Math.round(new Date().valueOf() * Math.random()) + "";
  },
};

export default mongoose.model("User", UserSchema);