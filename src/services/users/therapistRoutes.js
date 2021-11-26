// ******************** PACKAGES ********************
import express from "express";
import createHttpError from "http-errors";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary"
import { CloudinaryStorage } from "multer-storage-cloudinary"
// ******************** MODELS ********************
import experienceModel from "./experienceSchema.js";
import { therapistModel } from "./therapistSchema.js";
// ******************** MIDDLEWARES ********************
import { tokenAuthMiddleware } from "../../middlewares/auth/tokenMiddleware.js";
import { clientsOnly, therapistsOnly } from "../../middlewares/auth/roleChecker.js";

const router = express.Router();

const cloudStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
      folder: "profilepictures",
  },
}) 

router
  .route("/")
  .get(tokenAuthMiddleware, clientsOnly, async (req, res, next) => {
    try {
      const therapists = await therapistModel
        .find()
        .select(["-appointments", "-__v"]);
      res.send(therapists);
    } catch (error) {
      next(error);
    }
  });

router.route("/me").get(tokenAuthMiddleware, async (req, res, next) => {
  try {
    res.send(req.user);
  } catch (error) {
    next(error);
  }
});

router
  .route("/me/experiences")
  .get(tokenAuthMiddleware, async (req, res, next) => {
    try {
      res.send(req.user.experiences);
    } catch (error) {
      next(error);
    }
  })
  .post(tokenAuthMiddleware, therapistsOnly, async (req, res, next) => {
    try {
      const newExperience = new experienceModel(req.body);
      const updatedTherapist = await therapistModel.findByIdAndUpdate(
        req.user._id,
        { $push: { experiences: newExperience } },
        { new: true }
      );
      res.send(updatedTherapist);
    } catch (error) {
      next(error);
    }
  });

router
  .route("/me/experiences/:experienceId")
  .put(tokenAuthMiddleware, therapistsOnly, async (req, res, next) => {
    try {
      const me = req.user;
      // user is a MONGOOSE DOCUMENT not a normal plain JS object
      const expIndex = me.experiences.findIndex(
        (exp) => exp._id.toString() === req.params.experienceId
      );
      if (expIndex !== -1) {
        me.experiences[expIndex] = {
          ...me.experiences[expIndex].toObject(),
          ...req.body,
        };
        await me.save();
        res.send(me);
      } else {
        next(createHttpError(404, "Experience not found"));
      }
    } catch (error) {
      next(error);
    }
  })
  .delete(tokenAuthMiddleware, therapistsOnly, async (req, res, next) => {
    try {
      const therapist = await therapistModel.findByIdAndUpdate(
        req.user._id,
        { $pull: { experiences: { _id: req.params.experienceId } } },
        { new: true }
      )
      res.send(therapist) 
    } catch (error) {
      next(error)
    }
  });

  // router.route("/me/avatar").put(tokenAuthMiddleware, therapistsOnly, async (req, res, next) => {
  //   try {
  //     // console.log(req.file)
  //     const avatar = await therapistModel.findByIdAndUpdate(req.user._id, {$set: { avatar: req.body }}, {new: true})
  //     console.log(avatar)
  //     res.send(avatar)
  //   } catch (error) {
  //     next(error)
  //   }
  // })

export default router;
