import mongoose from "mongoose";

const lectureSchema = new mongoose.Schema(
  {
    lectureId: {
      type: String,
      required: true,
    },
    lectureTitle: {
      type: String,
      required: true,
    },
    lectureDuration: {
      type: Number,
      required: true,
    },
    lectureUrl: {
      type: String,
      required: true,
    },
    isPreviewFree: {
      type: Boolean,
      default: false,
    },
    lectureOrder: {
      type: Number,
      required: true,
    },
  },
  { _id: false }
);

const chapterSchema = new mongoose.Schema(
  {
    chapterId: {
      type: String,
      required: true,
    },
    chapterOrder: {
      type: Number,
      required: true,
    },
    chapterTitle: {
      type: String,
      required: true,
    },
    chapterContent: [lectureSchema],
  },
  { _id: false }
);

const ratingSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.ObjectId, ref: "User" },
    rating: { type: Number, min: 1, max: 5 },
  },
  { _id: false }
);

const courseSchema = new mongoose.Schema(
  {
    courseTitle: {
      type: String,
      required: true,
    },
    courseDescription: {
      type: String,
      required: true,
    },
    courseThumbnail: {
      type: String,
    },
    coursePrice: {
      type: Number,
      required: true,
    },
    isPublished: {
      type: Boolean,
      default: true,
    },
    discount: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    discountEndDate: {
      type: Date,
      required: true,
    },
    courseContent: [chapterSchema],
    courseRatings: [ratingSchema],
    educator: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: true,
    },
    enrolledStudents: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "User",
      },
    ],
  },
  {
    timestamps: true,
    minimize: false,
  }
);

const CourseModel = mongoose.model("Course", courseSchema);

export default CourseModel;
