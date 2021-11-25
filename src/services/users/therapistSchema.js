import mongoose from "mongoose";
import bcrypt from "bcrypt";
import userModel from "./userBaseSchema.js"

const { Schema } = mongoose;

export const therapistSchema = userModel.discriminator(
  "Therapist",
  new Schema({
    experiences: [
      {
        role: { type: String, required: true },
        company: { type: String },
        startDate: { type: Date, required: true },
        endDate: { type: Date },
        description: { type: String, required: true },
        area: { type: String, required: true },
      },
    ],
    appointments: [{ type: Schema.ObjectId, ref: "Appointment" }],
    availableDays: [{ type: Date, required: true }],
    specialization: { type: Schema.ObjectId, ref: "Specialization" }
  })
);
