// ******************** PACKAGES ********************
import createHttpError from "http-errors";
import express from "express";
// ******************** MODELS ********************
import sessionModel from "./schema.js";
// ******************** MIDDLEWARES ********************
import { therapistsOnly } from "../../middlewares/auth/roleChecker.js";
import { tokenAuthMiddleware } from "../../middlewares/auth/tokenMiddleware.js";

const router = express.Router();

// NEEDED ROUTES:
// POST -> by therapist to create available spots /sessions
// GET -> to get available spots for a specific therapist /sessions/:therapistId
// PUT -> by client to book a session with a specific therapist (set clientId, description ecc)
// /sessions/book/:sessionId
// PUT -> by therapist to edit something in specific session /sessions/:sessionId
// DELETE -> by therapist to delete specific session /session/:sessionId

// GET /sessions => get own sessions (where therapistId = req.user_id)
router
  .route("/")
  .get(tokenAuthMiddleware, therapistsOnly, async (req, res, next) => {
    const therapistAvailability = await sessionModel.find({
      therapistId: req.user._id,
    }).populate('clientId');
    res.send(therapistAvailability);
  })
// POST /sessions => the therapist (req.user._id) creates available sessions
  .post(tokenAuthMiddleware, therapistsOnly, async (req, res, next) => {
    try {
      const availability = new sessionModel({
        ...req.body,
        therapistId: req.user._id,
      });
      const { _id } = await availability.save();
      res.send({ _id }).status(201);
    } catch (error) {
      next(error);
    }
  });

// PUT /book/:sessionId => client edits a specific session by setting client id to req.user._id
router
  .route("/book/:sessionId")
  .put(tokenAuthMiddleware, async (req, res, next) => {
    try {
      const sessionToBook = await sessionModel.findByIdAndUpdate(
        req.params.sessionId,
        {
          $set: {
            clientId: req.user._id,
            ...req.body
          },
        },
        { new: true }
      );
      res.send(sessionToBook).status(200);
    } catch (error) {
      next(error);
    }
  });

// GET /:sessionId => get specific available session
router
  .route("/:sessionId")
  .get(tokenAuthMiddleware, async (req, res, next) => {
    const session = await sessionModel.findById(req.params.sessionId);
    res.send(session);
  })
  // PUT /:sessionId => therapist edits something in specific session
  .put(tokenAuthMiddleware, therapistsOnly, async (req, res, next) => {
    try {
      // -> update appointments in both Client schema and Therapist Schema
      const editedSession = await sessionModel.findByIdAndUpdate(
        req.params.sessionId,
        req.body,
        { new: true }
      );
      res.send(editedSession).status(200);
    } catch (error) {
      next(error);
    }
  })
  // DELETE /:sessionId => therapist deletes specific session
  .delete(tokenAuthMiddleware, therapistsOnly, async (req, res, next) => {
    try {
      const deleteSession = await sessionModel.findByIdAndDelete(
        req.params.sessionId
      );
    } catch (error) {
      next(error);
    }
  });

export default router;
