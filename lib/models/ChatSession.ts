import { Schema, model, models } from "mongoose";

export interface IChatMessage {
  role: "user" | "assistant";
  content: string;
  ts: Date;
}

export interface IChatSession {
  sessionId: string;
  messages: IChatMessage[];
}

const ChatMessageSchema = new Schema<IChatMessage>(
  {
    role: { type: String, required: true, enum: ["user", "assistant"] },
    content: { type: String, required: true },
    ts: { type: Date, default: Date.now },
  },
  { _id: false }
);

const ChatSessionSchema = new Schema<IChatSession>(
  {
    sessionId: { type: String, required: true, unique: true, index: true },
    messages: { type: [ChatMessageSchema], default: [] },
  },
  { timestamps: true }
);

export const ChatSession =
  models.ChatSession || model<IChatSession>("ChatSession", ChatSessionSchema);

