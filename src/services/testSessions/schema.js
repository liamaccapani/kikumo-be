import mongoose from "mongoose";

const { Schema, model } = mongoose;

export const sessionTestSchema = new Schema(
  {
    clientId: { type: Schema.ObjectId, ref: "Client" },
    therapistId: { type: Schema.ObjectId, ref: "Therapist" },
    title: { type: String }, 
    start: { type: Date, required: true },
    end: { type: Date, required: true },
  },
  { timestamps: true }
);

export default model("sessionTest", sessionTestSchema);