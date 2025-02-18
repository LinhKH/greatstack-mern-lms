import { clerkClient } from "@clerk/express";
import CourseModel from "../models/course.model.js";
import UserModel from "../models/user.model.js";
import { v2 as cloudinary } from "cloudinary";
import PurchaseModel from "../models/purchase.model.js";

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

    res.json({
      success: true,
      message: "User role updated to educator. You can publish a course now.",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success:false, message: "Failed to update user role" });
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
      return res
        .status(400)
        .json({ success: false, message: "Course image is required" });
    }

    const parsedCourseData = JSON.parse(courseData);
    parsedCourseData.educator = user._id;

    const result = await cloudinary.uploader
      .upload(imageFile.path, {
        use_filename: true,
        folder: "mern-lms",
      })
      .catch((error) => {
        throw new Error(error.message);
      });
    parsedCourseData.courseThumbnail = result.secure_url;
    const newCourse = new CourseModel(parsedCourseData);

    await newCourse.save();

    res
      .status(200)
      .json({ success: true, message: "Course created successfully" });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ success: false, message: "Failed to create course" });
  }
};

export const getEducatorCourses = async (req, res) => {
  try {
    const userId = req.auth.userId;

    // If user isn't authenticated, return a 401 error
    if (!userId) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    const user = await UserModel.findOne({ clerkUserId: userId });

    if (!user) {
      return res.status(404).json("User not found!");
    }

    const courses = await CourseModel.find({ educator: user._id });

    res.json({ success: true, courses });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch courses" });
  }
};

// get educator dashboard data (total earning, enrolled student, total courses)
export const getEducatorDashboardData = async (req, res) => {
  try {
    const userId = req.auth.userId;

    // If user isn't authenticated, return a 401 error
    if (!userId) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    const user = await UserModel.findOne({ clerkUserId: userId });

    if (!user) {
      return res.status(404).json("User not found!");
    }

    const courses = await CourseModel.find({ educator: user._id });

    const courseIds = courses.map((course) => course._id);

    // calculate total earning from purchased courses
    const purchasedCourses = await PurchaseModel.find({
      courseId: { $in: courseIds },
      status: "completed",
    });

    const totalEarning = purchasedCourses.reduce((acc, purchased) => {
      return acc + purchased.amount;
    }, 0);

    const totalCourses = courses.length;

    // collect unique all enrolled students Ids with their course title
    const enrolledStudentsData = [];
    for (const course of courses) {
      const students = await UserModel.find(
        { _id: { $in: course.enrolledStudents } },
        "name imageUrl"
      );
      students.forEach((student) => {
        enrolledStudentsData.push({ student, courseTitle: course.courseTitle });
      });
    }

    // const enrolledStudents = purchasedCourses.reduce((acc, purchased) => {
    //   if (!acc[purchased.userId]) {
    //     acc[purchased.userId] = [purchased.courseId];
    //   } else {
    //     acc[purchased.userId].push(purchased.courseId);
    //   }
    //   return acc;
    // }, {});

    res.json({
      success: true,
      dashboardData: {
        totalEarning,
        totalCourses,
        enrolledStudentsData,
      },
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch dashboard data" });
  }
};

// get enrolled students data with purchased data
export const getEnrolledStudentsData = async (req, res) => {
  try {
    const userId = req.auth.userId;

    // If user isn't authenticated, return a 401 error
    if (!userId) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    const user = await UserModel.findOne({ clerkUserId: userId });

    if (!user) {
      return res.status(404).json("User not found!");
    }

    const courses = await CourseModel.find({ educator: user._id });

    const courseIds = courses.map((course) => course._id);

    // get all purchased courses
    const purchasedCourses = await PurchaseModel.find({
      courseId: { $in: courseIds },
      status: "completed",
    }).populate("userId", "name imageUrl").populate("courseId", "courseTitle");

    const enrolledStudentsData = purchasedCourses.map((purchased) => {
      return {
        student: purchased.userId,
        courseTitle: purchased.courseId.courseTitle,
        purchasedAt: purchased.createdAt,
      };
    });

    res.json({
      success: true,
      enrolledStudentsData,
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch enrolled students data" });
  }
};