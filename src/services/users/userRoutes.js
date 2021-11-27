// ******************** PACKAGES ********************
import express from "express";
import createHttpError from "http-errors";
import { validationResult } from "express-validator";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
// ******************** MODELS ********************
import userModel from "./userBaseSchema.js";
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

router.route("/login").post(async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await userModel.checkCredentials(email, password);
    if (user) {
      const accessToken = await generateToken(user);
      res.send({ accessToken });
    } else {
      next(createHttpError(401, "Credentials not correct"));
    }
  } catch (error) {
    next(error);
  }
});

// router.route("/register").post(userValidation, async (req, res, next) => {
//   try {
//     const errorsList = validationResult(req);
//     if (!errorsList.isEmpty()) {
//       next(createHttpError(400, { errorsList }));
//     } else {
//       const newUser = new userModel(req.body);
//       const { _id } = await newUser.save();
//       const accessToken = await generateToken(newUser);
//       res.status(201).send({ _id, accessToken });
//     }
//   } catch (error) {
//     next(error);
//   }
// });


// router.route("/me")
//  .get(tokenAuthMiddleware, async (req, res, next) => {
//   try {
//     res.send(req.user);
//   } catch (error) {
//     next(error);
//   }
//  })
//  .put(tokenAuthMiddleware, async (req, res, next) => {
//   try {
//     const updateClient = await userModel.findByIdAndUpdate(req.user._id, req.body, {new: true})
//     res.send(updateClient).status(200)
//   } catch (error) {
//     next(error);
//   }
//  });

// router.route("/me/avatar").post(tokenAuthMiddleware, clientsOnly, multer({ storage: cloudStorage }).single("avatar"), async (req, res, next) => {
//   try {
//     // console.log(req.file)
//     const avatar = await userModel.findByIdAndUpdate(req.user._id, {$set: { avatar: req.file.path }}, {new: true})
//     console.log(avatar)
//     res.send(avatar)
//   } catch (error) {
//     next(error)
//   }
// })


export default router;