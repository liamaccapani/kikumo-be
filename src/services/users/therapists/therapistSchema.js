import mongoose from "mongoose";
import userModel from "../userBaseSchema.js"
import { experienceSchema } from "../../experiences/experienceSchema.js";

const { Schema } = mongoose;

export const therapistModel = userModel.discriminator(
  "Therapist",
  new Schema({
    address: {
      buildingName: { type: String },
      buildingNumber: { type: Number },
      city: { type: String },
      state: { type: String },
      zipCode: { type: Number }
    }, 
    experiences: [experienceSchema],
    hourFee: { type: Number, default: 0 },
    specializations: [{ type: Schema.ObjectId, ref: "Specialization" }]
  })
);
