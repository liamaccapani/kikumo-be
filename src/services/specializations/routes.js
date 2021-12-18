// ******************** PACKAGES ********************
import createHttpError from "http-errors";
import express from "express";
// ******************** MODELS ********************
import specializationModel from "./schema.js"
// ******************** MIDDLEWARES ********************
import { clientsOnly, therapistsOnly,} from "../../middlewares/auth/roleChecker.js";
import { tokenAuthMiddleware } from "../../middlewares/auth/tokenMiddleware.js";


const router = express.Router();

// ADMINS ONLY ON POST!
router
  .route("/")
  .get(tokenAuthMiddleware, async (req, res, next) => {
    try {
      const specializations = await specializationModel.find()
      res.send(specializations);
    } catch (error) {
      next(error);
    }
  })
  .post(tokenAuthMiddleware, async (req, res, next) => {
    try {
      const newSpecialization = new specializationModel(req.body)
      const { _id } = await newSpecialization.save();
      res.send({_id}).status(201)
    } catch (error) {
      next(error);
    }
  });


export default router;