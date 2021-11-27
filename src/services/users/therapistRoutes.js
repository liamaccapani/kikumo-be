// ******************** PACKAGES ********************
import express from "express";
import createHttpError from "http-errors";
import { validationResult } from "express-validator";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
// ******************** MODELS ********************
import experienceModel from "./experienceSchema.js";
import { therapistModel } from "./therapistSchema.js";
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
      const newTherapist = new therapistModel(req.body);
      const { _id } = await newTherapist.save();
      const accessToken = await generateToken(newTherapist);
      res.status(201).send({ _id, accessToken });
    }
  } catch (error) {
    next(error);
  }
});


// Get all therapists (only for clients)
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


// Get Therapist by Id
router
  .route("/:therapistId")
  .get(tokenAuthMiddleware, clientsOnly, async (req, res, next) => {
    try {
      const therapist = await therapistModel
        .findById(req.params.therapistId)
        .select(["-appointments", "-__v"]);
      res.send(therapist);
    } catch (error) {
      next(error);
    }
  });

// Get Profile (for) therapist + Edi name and Surname
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
      const updateTherapist = await therapistModel.findByIdAndUpdate(req.user._id, req.body, {new: true})
      res.send(updateTherapist).status(200)
    } catch (error) {
      next(error);
    }
  });

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

// Change Avatar
router.route("/me/avatar").post(tokenAuthMiddleware, therapistsOnly, multer({ storage: cloudStorage }).single("avatar"), async (req, res, next) => {
  try {
    // console.log(req.file)
    const newTherapistAvatar = await therapistModel.findByIdAndUpdate(req.user._id, {$set: { avatar: req.file.path }}, {new: true})
    // console.log(avatar)
    res.send(newTherapistAvatar)
  } catch (error) {
    next(error)
  }
})

// Get all my Clients

// Get single Client by id

export default router;
