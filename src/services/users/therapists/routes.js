// ******************** PACKAGES ********************
import createHttpError from "http-errors";
import express from "express";
import { validationResult } from "express-validator";
// ******************** MODELS ********************
import { clientModel } from "../clients/clientSchema.js";
import experienceModel from "../../experiences/experienceSchema.js";
import sessionModel from "../../sessions/schema.js";
import specializationModel from "../../specializations/schema.js";
import { therapistModel } from "./therapistSchema.js";
// ******************** MIDDLEWARES ********************
import {
  clientsOnly,
  therapistsOnly,
} from "../../../middlewares/auth/roleChecker.js";
import { tokenAuthMiddleware } from "../../../middlewares/auth/tokenMiddleware.js";
import { userValidation } from "../../../middlewares/validation/userValidation.js";
// ******************** FUNCTIONS ********************
import { generateToken } from "../../../middlewares/auth/tokenAuth.js";

const router = express.Router();

// POST => Register
router.route("/register").post(userValidation, async (req, res, next) => {
  try {
    const errorsList = validationResult(req);
    if (!errorsList.isEmpty()) {
      next(createHttpError(400, { errorsList }));
    } else {
      const newTherapist = new therapistModel(req.body);
      const { _id } = await newTherapist.save();
      const accessToken = await generateToken(newTherapist);
      res.status(201).send({ _id, accessToken });
    }
  } catch (error) {
    next(error);
  }
});

// GET all Therapists
router.route("/").get(tokenAuthMiddleware, async (req, res, next) => {
  try {
    const therapists = await therapistModel
      .find()
      .select(["-appointments", "-clients", "-__v"])
      .populate('specializations');
    res.send(therapists);
  } catch (error) {
    next(error);
  }
});

// GET Profile (for) Therapist
router
  .route("/me")
  .get(tokenAuthMiddleware, async (req, res, next) => {
    try {
      const therapist = await therapistModel
      .findById(req.user._id)
      .populate("specializations");
      res.send(therapist);
    } catch (error) {
      console.log(error);
      next(error);
    }
  })

// PUT => edit own specialization by adding one to array
router
  .route("/me/specializations")
  .put(tokenAuthMiddleware, async (req, res, next) => {
    try {
      const specialization = await specializationModel.findById(
        req.body.specializationId
      );
      const addToMine = await therapistModel
        .findByIdAndUpdate(
          req.user._id,
          { $push: { specializations: specialization } },
          { new: true }
        )
        .populate('specializations');
      res.send(addToMine);
    } catch (error) {
      next(error);
    }
  });

// Get Therapist by Id
// + GET availability (separate route??) TO BE TESTED 🐲
// + GET address (separate route??) TO BE TESTED 🐲
router
  .route("/:therapistId")
  .get(tokenAuthMiddleware, async (req, res, next) => {
    try {
      const therapist = await therapistModel
        .findById(req.params.therapistId)
        .populate("specializations")
        // .select(["-appointments", "-__v"]);
      res.send(therapist);
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
      const { _id } = await newExperience.save();
      res.send(updatedTherapist);
    } catch (error) {
      next(error);
    }
  });

  // router
  // .route("/me/availability")
  // .get(tokenAuthMiddleware, async (req, res, next) => {
  //   try {
  //     res.send(req.user.availableDays);
  //   } catch (error) {
  //     next(error);
  //   }
  // })
  // .post(tokenAuthMiddleware, therapistsOnly, async (req, res, next) => {
  //   try {
  //     const newDay = new Date(req.body);
  //     const updatedTherapist = await therapistModel.findByIdAndUpdate(
  //       req.user._id,
  //       { $push: { availableDays: newDay } },
  //       { new: true }
  //     );
  //     res.send(updatedTherapist);
  //   } catch (error) {
  //     next(error);
  //   }
  // });

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

export default router;
