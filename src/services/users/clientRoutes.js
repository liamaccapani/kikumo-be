// ******************** PACKAGES ********************
import express from "express";
import createHttpError from "http-errors";
import { validationResult } from "express-validator";
// ******************** MODELS ********************
import userModel from "./userBaseSchema.js";
// ******************** MIDDLEWARES ********************
import { tokenAuthMiddleware } from "../../middlewares/auth/tokenMiddleware.js";
import { generateToken } from "../../middlewares/auth/tokenAuth.js";
import { userValidation } from "../../middlewares/validation/userValidation.js";

const clientsRouter = express.Router();

clientsRouter.post("/register", userValidation, async (req, res, next) => {
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

clientsRouter.get("/me", tokenAuthMiddleware, async (req, res, next) => {
  try {
    res.send(req.user);
  } catch (error) {
    next(error);
  }
});

export default clientsRouter;
