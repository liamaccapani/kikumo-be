import mongoose from "mongoose";
import userModel from "../userBaseSchema.js"
import { experienceSchema } from "../../experiences/experienceSchema.js";

const { Schema } = mongoose;

export const therapistModel = userModel.discriminator(
  "Therapist",
  new Schema({
    experiences: [experienceSchema],
    appointments: [{type: Schema.ObjectId, ref: "Appointment" }],
    availableDays: [
      {
        start: {type: Date},
        end: {type: Date }
      }
    ],
    specializations: [{ type: Schema.ObjectId, ref: "Specialization" }], 
    clients: [{type: Schema.ObjectId, ref: "Client" }],
    address: {
      buildingName: { type: String },
      buildingNumber: { type: Number },
      city: { type: String },
      state: { type: String },
      zipCode: { type: Number }
    }
  })
);
