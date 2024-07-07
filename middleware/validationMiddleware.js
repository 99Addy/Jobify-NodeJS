import { body, param, validationResult } from "express-validator";
import {
  BadRequestError,
  NotFoundError,
  UnauthorizedError,
} from "../errors/customErrors.js";
import { JOB_STATUSES, JOB_TYPES } from "../utils/constants.js";
import mongoose from "mongoose";
import Job from "../models/jobModel.js";
import User from "../models/userModel.js";

//Here, [] signifies that the two middle wares function valitadeValues and (req,res,next) will be applied in sequence
// this is property of express to group middleware using []
const withValidationErrors = (validateValues) => {
  return [
    validateValues,
    (req, res, next) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        const errorMessages = errors.array().map((error) => error.msg);
        if (errorMessages[0].startsWith("No job")) {
          throw new NotFoundError(errorMessages); /// When id is now found
        }
        if (errorMessages[0].startsWith("Not authorized")) {
          throw new UnauthorizedError(errorMessages);
        }
        throw new BadRequestError(errorMessages); /// when id is invalid
      }
      next();
    },
  ];
};

export const validateJobInput = withValidationErrors([
  body("company").notEmpty().withMessage("Company is required"),
  body("position").notEmpty().withMessage("Position is required"),
  body("jobLocation").notEmpty().withMessage("Job Location is required"),
  body("jobStatus")
    .isIn(Object.values(JOB_STATUSES))
    .withMessage("Invalid job status"),
  body("jobType")
    .isIn(Object.values(JOB_TYPES))
    .withMessage("Invalid job type"),
]);

export const validateIdParam = withValidationErrors([
  param("id").custom(async (value, { req }) => {
    const isValidJobId = mongoose.Types.ObjectId.isValid(value);

    if (!isValidJobId) throw new BadRequestError("Invalid MongoDB id");
    //Note here we throwing BadRequestError but the .custom() will account it as just an error, not as BadRequestError
    // cuz custom will just push it into returned errors array with message
    //Hence the above function where we check !errors.isEmpty() need to handle different types of errors

    const job = await Job.findById(value);
    // Previously this code was in controller function getSingleJob so comments are of that function
    // Here are the two ways to handle the error if job is not found but there is repetation if we choose any one of them
    //   if (!job) {
    //     throw new Error(`No job with id ${id}`);    //This will hit the error handling middleware in server.js
    //     res.status(404).json({ msg: `No job with id ${id}` });
    //     return;
    //   }

    //In this way we use the custom error class which extends the error class
    //This will also hit the error handling middleware in server.js
    // Here we don't need to repeat same thing like providing status code and Error class describe by name the type of Error
    if (!job) throw new NotFoundError(`No job with id ${value}`);
    //Note here we throwing BadRequestError but the .custom() will account it as just an error, not as BadRequestError
    // cuz custom will just push it into returned errors array with message

    const isAdmin = req.user.role === "admin";
    const isOwner = job.createdBy.toString() === req.user.userId;
    if (!isAdmin && !isOwner) {
      throw new UnauthorizedError("Not authorized to access this route");
    }
  }),
]);

export const validateRegisterInput = withValidationErrors([
  body("name").notEmpty().withMessage("Name is required"),
  body("email")
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Invalid email format")
    .custom(async (email) => {
      const user = await User.findOne({ email });
      if (user) {
        throw new Error("Email already exists");
      }
    }),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),
  body("location").notEmpty().withMessage("Location is required"),
  body("lastName").notEmpty().withMessage("Last name is required"),
]);

export const validateLoginInput = withValidationErrors([
  body("email")
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Invalid email format"),
  body("password").notEmpty().withMessage("Password is required"),
]);

//
export const validateUpdateUserInput = withValidationErrors([
  body("name").notEmpty().withMessage("Name is required"),
  body("email")
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Invalid email format")
    .custom(async (email, { req }) => {
      const user = await User.findOne({ email }); //This checks if user with the email already exists
      if (user && user._id.toString() !== req.user.userId) {
        //User can only update his own email
        throw new Error("Email already exists");
      }
    }),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),
  body("location").notEmpty().withMessage("Location is required"),
  body("lastName").notEmpty().withMessage("Last name is required"),
]);
