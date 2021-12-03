import mongoose from "mongoose";
import userModel from "../userBaseSchema.js"
import {appointmentSchema} from "../../appointments/schema.js"
import { experienceSchema } from "../../experiences/experienceSchema.js";

const { Schema } = mongoose;

export const therapistModel = userModel.discriminator(
  "Therapist",
  new Schema({
    experiences: [experienceSchema],
    appointments: [appointmentSchema],
    availableDays: [
      {
        start: {type: Date},
        end: {type: Date }
      }
    ],
    specializations: { type: Schema.ObjectId, ref: "Specialization" }, 
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
