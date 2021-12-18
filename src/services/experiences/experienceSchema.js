import mongoose from "mongoose";

const { Schema, model } = mongoose;

export const experienceSchema = new Schema({
  role: { type: String, required: true },
  company: { type: String },
  startDate: { type: Date, required: true },
  endDate: { type: Date },
  description: { type: String, required: true },
  area: { type: String, required: true },
});

export default model("Experience", experienceSchema);
