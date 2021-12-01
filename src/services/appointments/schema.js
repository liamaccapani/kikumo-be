import mongoose from "mongoose";

const { Schema, model } = mongoose;

export const appointmentSchema = new Schema(
  {
    startDate: { type: String, required: true },
    endDate: { type: String, required: true },
    // clientId: { type: Schema.ObjectId, ref: "Client" },
    // therapistId: { type: Schema.ObjectId, ref: "Therapist" },
    description: { type: String }
  },
  { timestamps: true }
);

export default model("Appointment", appointmentSchema);
