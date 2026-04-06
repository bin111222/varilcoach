import mongoose, { Schema, model, models } from "mongoose";

export interface ISettings {
  _id: string;
  userId: string;
  athleteName: string;
  goals: string[];
  injuries: string;
  currentWeek: number;
  units: "kg" | "lbs";
  openaiModel: string;
  systemPromptOverride: string;
  accentColor: string;
  programName: string;
}

const SettingsSchema = new Schema<ISettings>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    athleteName: { type: String, default: "Varil" },
    goals: [{ type: String }],
    injuries: { type: String, default: "" },
    currentWeek: { type: Number, default: 1 },
    units: { type: String, enum: ["kg", "lbs"], default: "kg" },
    openaiModel: { type: String, default: "gpt-4o" },
    systemPromptOverride: { type: String, default: "" },
    accentColor: { type: String, default: "#c8f542" },
    programName: {
      type: String,
      default: "Calisthenics / Swim / Run / MMA",
    },
  },
  { timestamps: true }
);

export const Settings =
  models.Settings || model<ISettings>("Settings", SettingsSchema);
