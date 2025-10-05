import mongoose from "mongoose";
import bcrypt from "bcrypt";

export interface User extends mongoose.Document {
  name: string;
  email: string;
  password_hash: string;
  role?: string;
  ConnectAccount?: string;
  createdAt: number;
  updatedAt: number;
  authenticate(password: string): Promise<boolean>;
}

const UserSchema = new mongoose.Schema<User>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, trim: true },
    password_hash: { type: String, required: true },
    role: { type: String, default: "user" },
    ConnectAccount: { type: String },
  },
  {
    timestamps: {
      currentTime: () => Math.floor(Date.now() / 1000),
      createdAt: "createdAt",
      updatedAt: "updatedAt",
    },
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

UserSchema.methods.authenticate = async function (password: string) {
  return bcrypt.compare(password, this.password_hash);
};

UserSchema.set("toJSON", {
  transform: (_, ret) => {
    ret.id = ret.id.toString();
    delete ret._id;
  },
});

export default mongoose.model<User>("User", UserSchema);
