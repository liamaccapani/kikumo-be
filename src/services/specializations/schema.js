import mongoose from "mongoose";

const { Schema, model } = mongoose;

const specializationSchema = new Schema({
    category: { type: String, required: true }
})

export default model("Specialization", specializationSchema)