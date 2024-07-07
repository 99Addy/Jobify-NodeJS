import Job from "../models/jobModel.js";
import { StatusCodes } from "http-status-codes";
import { NotFoundError } from "../errors/customErrors.js";

//GET ALL JOBS
export const getAllJobs = async (req, res) => {
  const jobs = await Job.find({ createdBy: req.user.userId }); //This will find for createdBy field as defined in Jobmodel
  res.status(StatusCodes.OK).json({ jobs });
};

//GET SINGLE JOB
export const getSingleJob = async (req, res) => {
  const { id } = req.params;
  const job = await Job.findById(id);
  res.status(StatusCodes.OK).json(job);
};

//CREATE JOB
export const createJob = async (req, res) => {
  const { company, position } = req.body;
  req.body.createdBy = req.user.userId; //This will add createdBy field as defined in Jobmodel
  //Note
  //we don't need to pass object {company, position} as req.body also contains those and will process only those
  const job = await Job.create(req.body);
  res.status(StatusCodes.CREATED).json({ job });
};

//EDIT JOB
export const updateJob = async (req, res) => {
  const { id } = req.params;

  const updatedJob = await Job.findByIdAndUpdate(id, req.body, { new: true });

  if (!updatedJob) throw new NotFoundError(`No job with id ${id}`);

  res.status(StatusCodes.CREATED).json({ msg: "Job updated", job: updatedJob });
};

//DELETE JOB
export const deleteJob = async (req, res) => {
  const { id } = req.params;
  const removedJob = await Job.findByIdAndDelete(id);

  if (!removedJob) throw new NotFoundError(`No job with id ${id}`);

  res.status(202).json({ msg: "Job deleted", job: removedJob });
};
