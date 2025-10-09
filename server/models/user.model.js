import mongoose from "mongoose";
import bcrypt from "bcrypt";

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, trim: true },
    password_hash: { type: String, required: true },
    role: { type: String, default: "user" },
    ConnectAccount: { type: String },
    createdAt: { type: Number, default: () => Math.floor(Date.now() / 1000) },
    updatedAt: { type: Number, default: () => Math.floor(Date.now() / 1000) },
  },
  {
    versionKey: false,
  }
);

// Hash password before saving
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password_hash")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password_hash = await bcrypt.hash(this.password_hash, salt);
  next();
});

// Password authentication method
UserSchema.methods.authenticate = async function (password) {
  return bcrypt.compare(password, this.password_hash);
};

// Clean JSON output
UserSchema.set("toJSON", {
  transform: (_, ret) => {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.password_hash; // Never expose hash
  },
});

UserSchema.pre('save', function (next) {
  this.updatedAt = Math.floor(Date.now() / 1000);
  next();
});


const User = mongoose.model("User", UserSchema);
export default User;
