import User from "../models/userModel.js";
import { StatusCodes } from "http-status-codes";
import { comparePasswords, hashPassword } from "../utils/passwordUtils.js";
import { UnauthenticatedError } from "../errors/customErrors.js";
import { createJWT } from "../utils/tokenUtils.js";

export const registerUser = async (req, res) => {
  const isFirstUser = (await User.countDocuments({})) === 0;
  if (isFirstUser) {
    req.body.role = "admin";
  }
  req.body.password = await hashPassword(req.body.password);
  const user = await User.create(req.body);
  res.status(StatusCodes.CREATED).json({ msg: "User is created" });
};

export const loginUser = async (req, res) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    throw new UnauthenticatedError("Invalid Credentials");
  }
  const isPasswordCorrect = await comparePasswords(
    req.body.password,
    user.password
  );
  if (!isPasswordCorrect) {
    throw new UnauthenticatedError("Invalid Credentials");
  }

  const token = createJWT({ userId: user._id, role: user.role });

  // We are using HTTP-only cookie to store the token rather than local storage, as HTTP-only cookie
  // cannot be accessed by client/browser JS
  // also one the browser has this cookie, it will send it back with every request without
  // us having to manually attach it to the headers
  res.cookie("token", token, {
    httpOnly: true,
    expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
    secure: process.env.NODE_ENV === "production",
  });

  res.status(StatusCodes.CREATED).json({ msg: "User logged in" });
};

export const logoutUser = (req, res) => {
  res.cookie("token", "logout", {
    httpOnly: true,
    expires: new Date(Date.now()),
  });
  res.status(StatusCodes.OK).json({ msg: "User logged out" });
};
