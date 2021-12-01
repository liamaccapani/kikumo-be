import mongoose from "mongoose";
import userModel from "../userBaseSchema.js"
import {appointmentSchema} from "../../appointments/schema.js"

const { Schema } = mongoose;

export const clientModel = userModel.discriminator(
  "Client",
  new Schema({
    appointments: [appointmentSchema],
    therapist: 
      {
        _id: String,
        name: String,
        surname: String,
        avatar: String
      },
  })
);