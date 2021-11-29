// ******************** PACKAGES ********************
import createHttpError from "http-errors";
import express from "express";
// ******************** MODELS ********************
import experienceModel from "./experienceSchema.js";
import { therapistModel } from "../users/therapists/therapistSchemajs";
// ******************** MIDDLEWARES ********************
import { therapistsOnly } from "../../middlewares/auth/roleChecker.js";
import { tokenAuthMiddleware } from "../../middlewares/auth/tokenMiddleware.js";


const router = express.Router();

// Experiences (therapists only)
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

// Edit or Delete Experience
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
      );
      res.send(therapist);
    } catch (error) {
      next(error);
    }
  });