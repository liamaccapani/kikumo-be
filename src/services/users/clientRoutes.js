// ******************** PACKAGES ********************
import express from "express";
import createHttpError from "http-errors";
import { validationResult } from "express-validator";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
// ******************** MODELS ********************
import { clientModel } from "./clientSchema.js"
// ******************** MIDDLEWARES ********************
import { userValidation } from "../../middlewares/validation/userValidation.js";
import { tokenAuthMiddleware } from "../../middlewares/auth/tokenMiddleware.js";
import { clientsOnly, therapistsOnly } from "../../middlewares/auth/roleChecker.js";
// ******************** FUNCTIONS ********************
import { generateToken } from "../../middlewares/auth/tokenAuth.js";


const router = express.Router();

const cloudStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "profilepictures",
  },
});

// Register
router.route("/register").post(userValidation, async (req, res, next) => {
  try {
    const errorsList = validationResult(req);
    if (!errorsList.isEmpty()) {
      next(createHttpError(400, { errorsList }));
    } else {
      const newClient = new clientModel(req.body);
      const { _id } = await newClient.save();
      const accessToken = await generateToken(newClient);
      res.status(201).send({ _id, accessToken });
    }
  } catch (error) {
    next(error);
  }
});

// Get Profile (for) Client + Edit name and surname
router.route("/me")
 .get(tokenAuthMiddleware, async (req, res, next) => {
  try {
    res.send(req.user);
  } catch (error) {
    next(error);
  }
 })
 .put(tokenAuthMiddleware, async (req, res, next) => {
  try {
    const updateClient = await clientModel.findByIdAndUpdate(req.user._id, req.body, {new: true})
    res.send(updateClient).status(200)
  } catch (error) {
    next(error);
  }
 });

router.route("/me/avatar").post(tokenAuthMiddleware, clientsOnly, multer({ storage: cloudStorage }).single("avatar"), async (req, res, next) => {
  try {
    // console.log(req.file)
    const avatar = await clientModel.findByIdAndUpdate(req.user._id, {$set: { avatar: req.file.path }}, {new: true})
    console.log(avatar)
    res.send(avatar)
  } catch (error) {
    next(error)
  }
})

export default router;
