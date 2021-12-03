// ******************** PACKAGES ********************
import createHttpError from "http-errors";
import express from "express";
import { validationResult } from "express-validator";
// ******************** MODELS ********************
import appointmentModel from "../../appointments/schema.js";
import { clientModel } from "./clientSchema.js";
import { therapistModel } from "../therapists/therapistSchema.js";
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

// Get Profile (for) Client
router.route("/me").get(tokenAuthMiddleware, async (req, res, next) => {
  try {
    const client = await clientModel
      .findById(req.user._id)
      .populate("appointments");
    res.send(client);
  } catch (error) {
    next(error);
  }
});

router
  .route("/me/appointments/:therapistId")
  .post(tokenAuthMiddleware, async (req, res, next) => {
    try {
      // -> update appointments in both Client schema and Therapist Schema
      const newAppointment = new appointmentModel({
        ...req.body,
        clientId: req.user._id,
        therapistId: req.params.therapistId,
      });

      const updateTherapist = await therapistModel.findByIdAndUpdate(
        req.params.therapistId,
        { $push: { appointments: newAppointment } },
        { new: true }
      );

      const updateClient = await clientModel.findByIdAndUpdate(
        req.user._id,
        { $push: { appointments: newAppointment } },
        { new: true }
      );
      const { _id } = await newAppointment.save();
      res.send({ _id }).status(201);
    } catch (error) {
      next(error);
    }
  });

// Get Client by Id
router.route("/:clientId").get(tokenAuthMiddleware, async (req, res, next) => {
  try {
    const client = await clientModel
      .findById(req.params.clientId)
      .select(["-appointments", "-__v"]);
    res.send(client);
  } catch (error) {
    next(error);
  }
});

export default router;

// Get all Clients
// router
//   .route("/")
//   .get(tokenAuthMiddleware, async (req, res, next) => {
//     try {
//       const clients = await clientModel
//         .find()
//         .select(["-appointments", "-__v"]);
//       res.send(clients);
//     } catch (error) {
//       next(error);
//     }
//   });

// const clientAppointments = await clientModel.findByIdAndUpdate(
//   req.user._id,
//   { $push: { appointments: newAppointment } },
//   { new: true }
// );
// const therapistAppointments = await therapistModel.findByIdAndUpdate(
//   req.params.therapistId,
//   { $push: { appointments: newAppointment } },
//   { new: true }
// );

// if ({ _id }) {
//   const newTherapist = await therapistModel.findById(req.params.therapistId);
//   const newClient = await clientModel.findById(req.user._id);

//   const addTherapistToMine = await clientModel.findByIdAndUpdate(
//     req.user._id,
//     { $set: { therapist: newTherapist } },
//     { new: true }
//   );

//   const addClientToMine = await therapistModel.findByIdAndUpdate(
//     req.params.therapistId,
//     { $push: { clients: newClient } },
//     { new: true }
//   );
// }
