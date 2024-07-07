import { UnauthenticatedError } from "../errors/customErrors.js";
import { verifyJWT } from "../utils/tokenUtils.js";

export const authenthicateUser = (req, res, next) => {
  const { token } = req.cookies;
  if (!token) {
    throw new UnauthenticatedError("Authentication invalid");
  }
  try {
    const user = verifyJWT(token);
    req.user = { userId: user.userId, role: user.role };
    next();
  } catch (error) {
    throw new UnauthenticatedError("Authentication invalid");
  }
};

//roles is just 'admin' as we have passed in userRouter
export const authorizePermissions = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      throw new UnauthorizedError("Unauthorized to access this route");
    }
    next();
  };
};

//This can also be used to validate admin, but not used by instructor
// export const validateAdmin = (req, res, next) => {
//   if (req.user.role !== "admin") {
//     throw new UnauthenticatedError("Not authorized as an admin");
//   }
//   next();
// };
