import { body } from "express-validator";

export const userValidation = [
  body("email")
    .exists()
    .withMessage("Email is a mandatory field!")
    .isEmail()
    .withMessage("Please send a valid email!"),
  body("password")
    .exists()
    .isLength({ min: 3 })
    .withMessage("Password must be at least 3 digits long!")
    .matches(/\d/)
    .withMessage("Password must contain a number")
    // .isIn(["123", "password"])
    // .withMessage("Please do not use a common password!"),
];
