import createHttpError from "http-errors";
import userModel from "../../services/users/userBaseSchema.js";
import { verifyToken } from "./tokenAuth.js";

export const tokenAuthMiddleware = async (req, res, next) => {
  if (req.headers.authorization) {
    try {
      const token = req.headers.authorization.replace("Bearer ", "");
      const decodedToken = await verifyToken(token);
      const user = await userModel.findById(decodedToken._id);
      if (user) {
        req.user = user;
        next();
      } else {
        next(createHttpError(404, "User not found"));
      }
    } catch (error) {
      next(createHttpError(401, "Token not valid"));
    }
  } else {
    next(createHttpError(401, "Provide credentials"));
  }
};