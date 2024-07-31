import mongoose from "mongoose";

export const createMongooseId = () =>
  new mongoose.Types.ObjectId().toHexString();
