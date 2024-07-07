import mongoose from "mongoose";
import { JOB_STATUSES, JOB_TYPES } from "../utils/constants.js";

const jobSchema = new mongoose.Schema(
  {
    position: String,
    company: String,
    jobStatus: {
      type: String,
      enum: Object.values(JOB_STATUSES),
      default: JOB_STATUSES.PENDING, //Although default is not required as middleware is validating that jobStatus should be present
    },
    jobType: {
      type: String,
      enum: Object.values(JOB_TYPES),
      default: JOB_TYPES.FULL_TIME,
    },
    jobLocation: {
      type: String,
      default: "my city",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

//'Job' is the name of the collection or tabl ein the database
export default mongoose.model("Job", jobSchema);
