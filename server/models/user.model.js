import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    clerkUserId: {
      type: String,
      required: true,
      unique: true,
    },
    name: {
      type: String,
      required: [true, "Provide name"],
    },
    email: {
      type: String,
      required: [true, "provide email"],
      unique: true,
    },
    role: {
      type: String,
      enum: ["educator", "student"],
      default: "student",
    },
    imageUrl: {
      type: String,
      required: [true, "provide image url"],
    },
    enrolledCourses: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "Course",
      },
    ],
  },
  {
    timestamps: true,
  }
);

const UserModel = mongoose.model("User", userSchema);

export default UserModel;
