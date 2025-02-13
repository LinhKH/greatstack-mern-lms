import { clerkClient } from "@clerk/express";
import CourseModel from "../models/course.model.js";
import UserModel from "../models/user.model.js";
import { v2 as cloudinary } from "cloudinary";

export const updateRoleToEducator = async (req, res) => {
  try {
    const userId = req.auth.userId;

    // If user isn't authenticated, return a 401 error
    if (!userId) {
      res.status(401).json({ error: "User not authenticated" });
    }

    await clerkClient.users.updateUserMetadata(userId, {
      publicMetadata: {
        role: "educator",
      },
    });

    res.json({ message: "User role updated to educator. You can publish a course now." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to update user role" });
  }
};

export const addCourse = async (req, res) => {
  try {
    const { courseData } = req.body;
    const imageFile = req.file; // using with multer middleware use diskStorage
    const clerkUserId = req.auth.userId;

    // If user isn't authenticated, return a 401 error
    if (!clerkUserId) {
      res.status(401).json({ error: "User not authenticated" });
    }

    const user = await UserModel.findOne({ clerkUserId });

    if (!user) {
      return res.status(404).json("User not found!");
    }

    console.log(imageFile);
    
    if (!imageFile) {
      return res.status(400).json({ success: false, message: "Course image is required" });
    }

    const parsedCourseData = JSON.parse(courseData);
    parsedCourseData.educator = user._id;

    const result = await cloudinary.uploader.upload(imageFile.path, {
      use_filename: true,
      folder: "mern-lms",
    }).catch((error) => {
      throw new Error(error.message);
    });
    parsedCourseData.courseThumbnail = result.secure_url;
    const newCourse = new CourseModel(parsedCourseData);

    await newCourse.save();

    res.status(200).json({ success: true, message: "Course created successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Failed to create course" });
  }
};
