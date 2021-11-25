import mongoose from "mongoose";

const { Schema, model } = mongoose;

const appointmentSchema = new Schema(
  {
    startDate: { type: String, required: true },
    endDate: { type: String, required: true },
    client: { type: Schema.ObjectId, ref: "Client" },
    therapist: { type: Schema.ObjectId, ref: "Therapist" },
    description: { type: String }
  },
  { timestamps: true }
);

export default model("Appointment", appointmentSchema);
