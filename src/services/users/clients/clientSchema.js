import mongoose from "mongoose";
import userModel from "../userBaseSchema.js"

const { Schema } = mongoose;

export const clientModel = userModel.discriminator(
  "Client",
  new Schema({
    // appointments: [{type: Schema.ObjectId, ref: "Appointment" }],
    // therapists: [{type: Schema.ObjectId, ref: "Therapist" }]
    
  })
);