import mongoose from "mongoose";
import bcrypt from "bcrypt";
import userModel from "./userBaseSchema.js"

const { Schema } = mongoose;

export const therapistModel = userModel.discriminator(
  "Therapist",
  new Schema({
    experiences: [
      {
        role: String,
        company: String,
        startDate: Date,
        endDate: Date,
        description: String,
        area: String,
      },
    ],
    appointments: [{ type: Schema.ObjectId, ref: "Appointment" }],
    availableDays: [{ type: Date, required: true }],
    specialization: { type: Schema.ObjectId, ref: "Specialization" }
  })
);
