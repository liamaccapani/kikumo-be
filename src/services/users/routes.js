// ******************** PACKAGES ********************
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import createHttpError from "http-errors";
import express from "express";
import multer from "multer";
import { validationResult } from "express-validator";
// ******************** MODELS ********************
import userModel from "./userBaseSchema.js";
// ******************** MIDDLEWARES ********************
import { clientsOnly, therapistsOnly } from "../../middlewares/auth/roleChecker.js";
import { tokenAuthMiddleware } from "../../middlewares/auth/tokenMiddleware.js";
import { userValidation } from "../../middlewares/validation/userValidation.js";
// ******************** FUNCTIONS ********************
import { generateToken } from "../../middlewares/auth/tokenAuth.js";

const router = express.Router();

const cloudStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "profilepictures",
  },
});

router.route("/login").post(async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await userModel.checkCredentials(email, password);
    if (user) {
      const accessToken = await generateToken(user);
      const body = {
        accessToken,
        role: user.role,
        _id: user._id
      }
      console.log(user)
      res.send(body);
    } else {
      next(createHttpError(401, "Credentials not correct"));
    }
  } catch (error) {
    next(error);
  }
});

router.route("/me")
 .put(tokenAuthMiddleware, async (req, res, next) => {
  try {
    const updateClient = await userModel.findByIdAndUpdate(req.user._id, req.body, {new: true})
    res.send(updateClient).status(200)
  } catch (error) {
    next(error);
  }
 });

router.route("/me/avatar").post(tokenAuthMiddleware, multer({ storage: cloudStorage }).single("avatar"), async (req, res, next) => {
  try {
    // console.log(req.file)
    const avatar = await userModel.findByIdAndUpdate(req.user._id, {$set: { avatar: req.file.path }}, {new: true})
    console.log(avatar)
    res.send(avatar)
  } catch (error) {
    next(error)
  }
})



export default router;