import { Schema, model, models } from "mongoose";

export interface IRateLimit {
  userId: string;
  count: number;
  lastRequest: Date;
}

const RateLimitSchema = new Schema<IRateLimit>(
  {
    userId: { type: String, required: true, unique: true, index: true },
    count: { type: Number, default: 0 },
    lastRequest: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// We add an index for TTL (Time To Live) to automatically clear old rate limit records
// after 24 hours of inactivity to keep the database clean.
RateLimitSchema.index({ updatedAt: 1 }, { expireAfterSeconds: 86400 });

export const RateLimit =
  models.RateLimit || model<IRateLimit>("RateLimit", RateLimitSchema);
