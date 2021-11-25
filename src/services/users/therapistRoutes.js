// ******************** PACKAGES ********************
import express from "express";
import createHttpError from "http-errors";
import { validationResult } from "express-validator";
// ******************** MODELS ********************
import userModel from "./userBaseSchema.js";
import experienceModel from "./experienceSchema.js"
import { therapistModel } from "./therapistSchema.js";
// ******************** MIDDLEWARES ********************
import { tokenAuthMiddleware } from "../../middlewares/auth/tokenMiddleware.js";
import { generateToken } from "../../middlewares/auth/tokenAuth.js";
import { userValidation } from "../../middlewares/validation/userValidation.js";
import { clientsOnly } from "../../middlewares/auth/roleChecker.js";

const therapistsRouter = express.Router();

therapistsRouter.post("/register", userValidation, async (req, res, next) => {
  try {
    const errorsList = validationResult(req);
    if (!errorsList.isEmpty()) {
      next(createHttpError(400, { errorsList }));
    } else {
      const newUser = new userModel(req.body);
      const { _id } = await newUser.save();
      const accessToken = await generateToken(newUser);
      res.status(201).send({ _id, accessToken });
    }
  } catch (error) {
    next(error);
  }
});

therapistsRouter.get(
  "/",
  tokenAuthMiddleware,
  clientsOnly,
  async (req, res, next) => {
    try {
      const therapists = await therapistModel
        .find()
        .select(["-appointments", "-__v"]);
      res.send(therapists);
    } catch (error) {
      next(error);
    }
  }
);

therapistsRouter.get("/me", tokenAuthMiddleware, async (req, res, next) => {
  try {
    res.send(req.user);
  } catch (error) {
    next(error);
  }
});

therapistsRouter.get("/me/experiences", tokenAuthMiddleware, async (req, res, next) => {
  try {
    res.send(req.user.experiences);
  } catch (error) {
    next(error);
  }
});

therapistsRouter.post("/me/experiences", tokenAuthMiddleware, async (req, res, next) => {
    try {
      const newExperience = new experienceModel(req.body)
      const updatedTherapist = await therapistModel.findByIdAndUpdate(
        req.user._id, 
        { $push: { experiences: newExperience } },
        { new: true }
      )
      if (updatedTherapist) {
        res.send(updatedTherapist)
      } else {
        next(createHttpError(404, "Therapist not found"))
      }
    } catch (error) {
      next(error);
    }
  }
);

export default therapistsRouter;
