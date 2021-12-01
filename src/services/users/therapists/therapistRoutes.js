// ******************** PACKAGES ********************
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import createHttpError from "http-errors";
import express from "express";
import multer from "multer";
import { validationResult } from "express-validator";
// ******************** MODELS ********************
import appointmentModel from "../../appointments/schema.js";
import { clientModel } from "../clients/clientSchema.js";
import experienceModel from "../../experiences/experienceSchema.js";
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
      const newTherapist = new therapistModel(req.body);
      const { _id } = await newTherapist.save();
      const accessToken = await generateToken(newTherapist);
      res.status(201).send({ _id, accessToken });
    }
  } catch (error) {
    next(error);
  }
});

// Get all Therapists
router.route("/").get(tokenAuthMiddleware, async (req, res, next) => {
  try {
    const therapists = await therapistModel
      .find()
      .select(["-appointments", "-clients", "-__v"]);
    res.send(therapists);
  } catch (error) {
    next(error);
  }
});

// Get Profile (for) Therapist + Edit name and surname
router
  .route("/me")
  .get(tokenAuthMiddleware, async (req, res, next) => {
    try {
      res.send(req.user);
    } catch (error) {
      console.log(error);
      next(error);
    }
  })
  .put(tokenAuthMiddleware, async (req, res, next) => {
    try {
      const updateTherapist = await therapistModel.findByIdAndUpdate(
        req.user._id,
        req.body,
        { new: true }
      );
      res.send(updateTherapist).status(200);
    } catch (error) {
      next(error);
    }
  });

// Change Avatar
router
  .route("/me/avatar")
  .post(
    tokenAuthMiddleware,
    therapistsOnly,
    multer({ storage: cloudStorage }).single("avatar"),
    async (req, res, next) => {
      try {
        // console.log(req.file)
        const newTherapistAvatar = await therapistModel.findByIdAndUpdate(
          req.user._id,
          { $set: { avatar: req.file.path } },
          { new: true }
        );
        // console.log(avatar)
        res.send(newTherapistAvatar);
      } catch (error) {
        next(error);
      }
    }
  );

// Get all my Clients (Is it necessary?)
router.route("/me/clients").get(tokenAuthMiddleware, async (req, res, next) => {
  try {
    const myClients = req.user.clients;
    res.send(myClients);
  } catch (error) {
    next(error);
  }
});

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
        .populate("specializations");
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
        .select(["-appointments", "-__v"]);
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

export default router;
