// ******************** PACKAGES ********************
import createHttpError from "http-errors";
import express from "express";
// ******************** MODELS ********************
import sessionModel from "./schema.js";
// ******************** MIDDLEWARES ********************
import { clientsOnly, therapistsOnly } from "../../middlewares/auth/roleChecker.js";
import { tokenAuthMiddleware } from "../../middlewares/auth/tokenMiddleware.js";

const router = express.Router();

// GET /sessions => therapist gets own sessions (where therapistId = req.user_id)
router
  .route("/")
  .get(tokenAuthMiddleware, therapistsOnly, async (req, res, next) => {
    const sessions = await sessionModel
      .find({
        therapistId: req.user._id,
      })
      .populate("clientId");
    res.send(sessions);
  })

// POST /sessions => the therapist (req.user._id) creates available sessions
  .post(tokenAuthMiddleware, therapistsOnly, async (req, res, next) => {
    try {
      const newSession = new sessionModel({
        ...req.body,
        therapistId: req.user._id,
      });
      const session = await newSession.save();
      res.send(session).status(201);
    } catch (error) {
      next(error);
    }
  });

// GET /clientSessions => client gets own sessions ( where clientId = req.user._id)
router
  .route("/clients")
  .get(tokenAuthMiddleware, clientsOnly, async (req, res, next) => {
    try {
      const myAppointments = await sessionModel
        .find({ clientId: req.user._id })
        .populate("therapistId");
      res.send(myAppointments).status(200);
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
            ...req.body,
          },
        },
        { new: true }
      );
      res.send(sessionToBook).status(200);
    } catch (error) {
      next(error);
    }
  });

// GET /sessions/:therapistId => client gets all sessions available for a specific therapist
router.route("/:therapistId").get(tokenAuthMiddleware, async (req, res, next) => {
  try {
    const therapistSessions = await sessionModel.find(
      {therapistId: req.params.therapistId}
    )
    res.send(therapistSessions);
  } catch (error) {
    next(error);
  }
})

// GET /:sessionId => get specific session
router
  .route("/:sessionId")
  .get(tokenAuthMiddleware, async (req, res, next) => {
    const session = await sessionModel.findById(req.params.sessionId).populate(['clientId', 'therapistId']);
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
