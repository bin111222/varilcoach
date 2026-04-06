import mongoose, { Schema, model, models } from "mongoose";

export interface IUser {
  _id: string;
  username: string;
  password?: string;
}

const UserSchema = new Schema<IUser>(
  {
    username: { type: String, required: true, unique: true },
    password: { type: String },
  },
  { timestamps: true }
);

export const User = models.User || model<IUser>("User", UserSchema);
