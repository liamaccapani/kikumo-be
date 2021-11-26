// ******************** PACKAGES ********************
import express from "express";
import createHttpError from "http-errors";
import { validationResult } from "express-validator";
// ******************** MODELS ********************
import userModel from "./userBaseSchema.js";
import experienceModel from "./experienceSchema.js";
import { therapistModel } from "./therapistSchema.js";
// ******************** MIDDLEWARES ********************
import { tokenAuthMiddleware } from "../../middlewares/auth/tokenMiddleware.js";
import {
  clientsOnly,
  therapistsOnly,
} from "../../middlewares/auth/roleChecker.js";

const router = express.Router();

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
  });

export default router;
