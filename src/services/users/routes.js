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
// import { therapistsOnly } from "../../midllewares/auth/therapistsOnly.js";

const usersRouter = express.Router();

usersRouter.post("/register", userValidation, async (req, res, next) => {
  try {
    const errorsList = validationResult(req);
    if (!errorsList.isEmpty()) {
      // If we had validation errors --> we need to trigger Bad Request Error Handler
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

usersRouter.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await userModel.checkCredentials(email, password);
    if (user) {
      const accessToken = await generateToken(user);
      res.send({ accessToken });
    } else {
      next(createHttpError(401, "Credentials not correct"));
    }
  } catch (error) {
    next(error);
  }
});

usersRouter.get("/me", tokenAuthMiddleware, async (req, res, next) => {
  try {
    res.send(req.user);
  } catch (error) {
    next(error);
  }
});

// JUST FOR DEVELOPEMENT PURPOSES
// usersRouter.get("/", tokenAuthMiddleware, HostOnly, async (req, res, next) => {
//   try {
//       const users = await userModel.find();
//       res.send(users);
//   } catch (error) {
//     next(error);
//   }
// }
// );

// usersRouter.get("/:userId", tokenAuthMiddleware, HostOnly, async (req, res, next) => {
//     try {
//         const user = await userModel.findById({_id: req.params.userId}).populate({path: 'accomodations', select: "name"})
//         res.send(user)
//     } catch (error) {
//       next(error);
//     }
//   }
// );


export default usersRouter;