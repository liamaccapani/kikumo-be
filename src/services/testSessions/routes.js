// ******************** PACKAGES ********************
import express from "express";
// ******************** MODELS ********************
import sessionTestModel from "./schema.js";
// ******************** MIDDLEWARES ********************
import { tokenAuthMiddleware } from "../../middlewares/auth/tokenMiddleware.js";

const router = express.Router();

router.route("/addEvent").post(tokenAuthMiddleware, async (req, res, next) => {
  try {
    const newSession = new sessionTestModel({
      ...req.body,
      therapistId: req.user._id,
    });
    const session = await newSession.save();
    res.send(session).status(201)
  } catch (error) {
    next(error);
  }
});

router.route("/getEvent").get(tokenAuthMiddleware, async (req, res, next) => {
    try {
      const sessions = await sessionTestModel.find({
          therapistId: req.user._id
      })
      res.send(sessions).status(200)
    } catch (error) {
      next(error);
    }
  });
export default router;
