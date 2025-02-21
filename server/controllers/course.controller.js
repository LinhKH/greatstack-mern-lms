import CourseModel from "../models/course.model.js";
import PurchaseModel from "../models/purchase.model.js";
import UserModel from "../models/user.model.js";

// get all courses
export const getAllCourses = async (req, res) => {
  try {
    const courses = await CourseModel.find({ isPublished: true })
      .select(["-courseContent", "-enrolledStudents"])
      .populate({ path: "educator" });
    res.json({ success: true, courses });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch courses" });
  }
};

// get course by id
export const getCourseById = async (req, res) => {
  try {
    const course = await CourseModel.findById(req.params.id)
      .populate({
        path: "educator",
      })
      .populate({
        path: "courseRatings.userId",
        select: "name imageUrl",
      });

    // remove lectureUrl if isPreviewFree is false

    course.courseContent.forEach((chapter) => {
      chapter.chapterContent.forEach((lecture) => {
        if (!lecture.isPreviewFree) {
          lecture.lectureUrl = "";
        }
      });
    });

    // calculate days left at this price
    let daysLeft = null;
    if (course.discountEndDate) {
      const currentDate = new Date();
      const discountEndDate = new Date(course.discountEndDate.toString());
      const timeDiff = discountEndDate - currentDate;
      daysLeft = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
    }

    res.json({ success: true, course, daysLeft });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Failed to fetch course" });
  }
};

export const getCourseDetailWithPurchaseStatus = async (req, res) => {
  try {
    const { courseId } = req.params;

    const userId = req.auth.userId;
    console.log(userId);

    // If user isn't authenticated, return a 401 error
    if (!userId) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    const user = await UserModel.findOne({ clerkUserId: userId });

    if (!user) {
      return res.status(404).json("User not found!");
    }

    const course = await CourseModel.findById(courseId)
      .populate({ path: "educator" })
      .populate({ path: "enrolledStudents" });

    const purchased = await PurchaseModel.findOne({
      userId: user._id,
      courseId,
    });

    if (!course) {
      return res
        .status(404)
        .json({ success: false, message: "course not found!" });
    }

    return res.status(200).json({
      success: true,
      course,
      purchased: !!purchased, // true if purchased, false otherwise
    });
  } catch (error) {
    console.log(error);
  }
};
