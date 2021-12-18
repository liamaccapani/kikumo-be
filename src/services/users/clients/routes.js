// ******************** PACKAGES ********************
import createHttpError from "http-errors";
import express from "express";
import { validationResult } from "express-validator";
// ******************** MODELS ********************
import { clientModel } from "./clientSchema.js";
import sessionModel from "../../sessions/schema.js";
import { therapistModel } from "../therapists/therapistSchema.js";
// ******************** MIDDLEWARES ********************
import { clientsOnly, therapistsOnly } from "../../../middlewares/auth/roleChecker.js";
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
    res.send(client);
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
