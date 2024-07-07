import "express-async-errors"; //This will handle all the async errors thrown in the route handlers via
// the sync error hander middleware we have defined at the end of the file
// so we don't need to use try catch block in each route handler
//This prevent the server from crashing due to unhandled promise rejections/errors
import express from "express";
const app = express();
import morgan from "morgan";
import * as dotenv from "dotenv";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
dotenv.config();

//router
import jobRouter from "./routes/jobRouter.js";
import authRouter from "./routes/authRouter.js";
import userRouter from "./routes/userRouter.js";

//middleware
import errorHandlerMiddleware from "./middleware/errorHandlerMiddleware.js";
import { authenthicateUser } from "./middleware/authMiddleware.js";

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

app.use(cookieParser());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Server is ready");
});

app.get("/api/v1/test", (req, res) => {
  res.json({ message: "API is running..." });
});

app.use("/api/v1/jobs", authenthicateUser, jobRouter);
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/users", authenthicateUser, userRouter);

//This will hit when no route is found for the request so keep it at the end
app.use("*", (req, res) => {
  res.status(404).json({ msg: "Not found" });
});

//Error handling middleware, this will hit when an error is thrown explicitly by us in any route handler or
// implicitly due to some functionality issue on the handler function of existing route
// so this is not exactly a middleware as it get excuted when the request reaches to handler function of route
app.use(errorHandlerMiddleware);

const port = process.env.PORT || 5100;

try {
  await mongoose.connect(process.env.MONGO_URL);
  app.listen(port, () => {
    console.log(`Server is running on port ${port}...`);
  });
} catch (error) {
  console.log(error);
  process.exit(1);
}
