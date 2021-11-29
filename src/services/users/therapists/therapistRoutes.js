// ******************** PACKAGES ********************
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import createHttpError from "http-errors";
import express from "express";
import multer from "multer";
import { validationResult } from "express-validator";
// ******************** MODELS ********************
import appointmentModel from "../../appointments/schema.js"
import { clientModel } from "../clients/clientSchema.js";
import experienceModel from "../../experiences/experienceSchema.js";
import { therapistModel } from "./therapistSchema.js";
// ******************** MIDDLEWARES ********************
import { clientsOnly, therapistsOnly,} from "../../../middlewares/auth/roleChecker.js";
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

// Get all Therapists (only for Clients)
router
  .route("/")
  .get(tokenAuthMiddleware, async (req, res, next) => {
    try {
      const therapists = await therapistModel
        .find()
        .select(["-appointments", "-__v"]);
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

// Get all my Clients TO BE TESTED, for now empty array because nobody is there 🐲
router.route("/me/clients")
  .get(tokenAuthMiddleware, async (req, res, next) => {
    try {
      const myClients = req.user.clients
      res.send(myClients);
    } catch (error) {
      next(error);
    }
})

// Get Therapist by Id 
// + GET availability (separate route??) TO BE TESTED 🐲
// + GET address TO BE TESTED 🐲
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

// POST therapistId/appointments by client TO BE TESTED 🐲
router.route("/:therapistId/appointments").post(tokenAuthMiddleware, async (req, res, next) => {
  try {
    // -> update appointments in both Client schema and Therapist Schema
    const newAppointment = new appointmentModel(req.body)
    const { _id } = await newAppointment.save();
    const clientAppointments = await clientModel.findByIdAndUpdate(
      req.body.clientId,
      { $push: { appointments: newAppointment } }, 
      {new: true}
    )
    const therapistAppointments = await therapistModel.findByIdAndUpdate(
      req.params.therapistId, 
      { $push: { appointments: newAppointment } }, 
      {new: true}
    )
    
    if({_id}){
      try {
      // NB Filter / Find if clientId is already in the array clients
      // NB Filter / Find if therapistId is already in the array therapists
      const newTherapist = await therapistModel.findById(req.params.therapistId)
      const newClient = await clientModel.findById(req.body.clientId)

      const addTherapistToMine = await clientModel.findByIdAndUpdate(
        req.body.clientId, 
        { $push: { therapists: newTherapist } },
        {new: true}
      )

      const addClientToMine = await therapistModel.findByIdAndUpdate(
        req.params.therapistId,
        { $push: { clients: newClient } },
        {new: true}
      )
      } catch (error) {
        
      }
    }
    
    res.send({_id}).status(201)
  } catch (error) {
    next(error)
  }
});



export default router;
