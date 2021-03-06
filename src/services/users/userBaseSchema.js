import mongoose from "mongoose";
import bcrypt from "bcrypt";

const { Schema, model } = mongoose;

const baseOptions = {
  discriminatorKey: "role",
  collection: "data",
};

const userSchema = new Schema(
  {
    name: { type: String, required: true },
    surname: { type: String, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true },
    avatar: {
      type: String,
      required: true,
      default:
        "https://eleonoradavide.com/wp-content/uploads/2011/06/default-avatar.png",
    },
    role: { type: String, default: "Client", enum: ["Client", "Therapist"] },
  },
  baseOptions
);


// #1 hash password before saving user in DB ->
userSchema.pre("save", async function (next) {
  const newUser = this;
  if (newUser.isModified("password")) {
    newUser.password = await bcrypt.hash(newUser.password, 10);
  }
  next();
});

// #2 hide encoded password from response data
userSchema.methods.toJSON = function () {
  const userDocument = this;
  // ⚠
  const userObject = userDocument.toObject();
  delete userObject.password;

  return userObject;
};

// #1 find user
// #2 compare password with hashed one
userSchema.statics.checkCredentials = async function (email, password) {
  const user = await this.findOne({ email });
  if (user) {
    const isMatch = await bcrypt.compare(password, user.password);
    if (isMatch) {
      return user;
    } else {
      return null;
    }
  } else {
    return null;
  }
};

export default model("User", userSchema)