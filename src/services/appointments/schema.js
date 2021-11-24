import mongoose from "mongoose";

const { Schema, model } = mongoose;

const appointmentSchema = new Schema(
  {
    startDate: { type: String, required: true },
    endDate: { type: String, required: true },
    clientId: { type: String, required: true },
    therapistId: { type: String, required: true },
    description: { type: String }
  },
  { timestamps: true }
);

export default model("Appointment", appointmentSchema);
