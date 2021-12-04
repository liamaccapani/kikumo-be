import mongoose from "mongoose";

const { Schema, model } = mongoose;

export const sessionSchema = new Schema(
  {
    clientId: { type: Schema.ObjectId, ref: "Client" },
    therapistId: { type: Schema.ObjectId, ref: "Therapist" },
    description: { type: String }, 
    duration: { type: String, required: true },
    startDate: { type: Date, required: true },
  },
  { timestamps: true }
);

export default model("Appointment", sessionSchema);
