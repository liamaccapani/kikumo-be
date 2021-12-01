import mongoose from "mongoose";
import userModel from "../userBaseSchema.js"
import {appointmentSchema} from "../../appointments/schema.js"
import { experienceSchema } from "../../experiences/experienceSchema.js";

const { Schema } = mongoose;

export const therapistModel = userModel.discriminator(
  "Therapist",
  new Schema({
    // experiences: [
    //   {
    //     role: String,
    //     company: String,
    //     startDate: Date,
    //     endDate: Date,
    //     description: String,
    //     area: String,
    //   },
    // ],
    experiences: [experienceSchema],
    appointments: [appointmentSchema],
    availableDays: [
      {
        start: {type: Date},
        end: {type: Date }
      }
    ],
    specializations: { type: Schema.ObjectId, ref: "Specialization" }, 
    clients: [
      {
        name: String,
        surname: String,
      }
    ],
    address: {
      buildingName: { type: String },
      buildingNumber: { type: Number },
      city: { type: String },
      state: { type: String },
      zipCode: { type: Number }
    }
  })
);
