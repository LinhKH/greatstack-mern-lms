import mongoose from "mongoose";

const courseProgressSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.ObjectId,
      required: true,
    },
    courseId: {
      type: mongoose.Schema.ObjectId,
      required: true,
    },
    completed: {
      type: Boolean,
      required: false,
    },
    lectureCompleted: [],
  },
  {
    minimize: false,
  }
);

const CourseProgress = mongoose.model("CourseProgress", courseProgressSchema);

export default CourseProgress;
