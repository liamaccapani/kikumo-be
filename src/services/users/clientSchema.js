import mongoose from "mongoose";
import bcrypt from "bcrypt";
import userModel from "./userBaseSchema.js"

const { Schema } = mongoose;

export const clientSchema = userModel.discriminator(
  "Client",
  new Schema({
    appointments: [{ type: Schema.ObjectId, ref: "Appointment" }],
  })
);