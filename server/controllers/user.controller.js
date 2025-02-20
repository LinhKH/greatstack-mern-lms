import CourseModel from "../models/course.model.js";
import PurchaseModel from "../models/purchase.model.js";
import UserModel from "../models/user.model.js";
import Stripe from "../configs/stripe.js";
import CourseProgress from "../models/courseProgress.model.js";

// get user data
export const getUserData = async (req, res) => {
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

    res.json({ success: true, user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Failed to fetch users" });
  }
};

// users enrolled courses with lecture links
export const userEnrolledCourses = async (req, res) => {
  try {
    const userId = req.auth.userId;

    // If user isn't authenticated, return a 401 error
    if (!userId) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    const user = await UserModel.findOne({ clerkUserId: userId }).populate({ path: "enrolledCourses" });

    if (!user) {
      return res.status(404).json("User not found!");
    }

    res.json({ success: true, enrolledCourses: user.enrolledCourses });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Failed to fetch courses" });
  }
};

// purchase course
export const purchaseCourse = async (req, res) => {
  try {
    const { courseId } = req.body;
    const { origin } = req.headers;
    const userId = req.auth.userId;

    // If user isn't authenticated, return a 401 error
    if (!userId) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    const user = await UserModel.findOne({ clerkUserId: userId }).populate({
      path: "enrolledCourses",
    });

    if (!user) {
      return res.status(404).json("User not found!");
    }

    const courseData = await CourseModel.findById(courseId);

    if (!courseData) {
      return res
        .status(404)
        .json({ success: false, message: "Course not found" });
    }

    const purchaseData = {
      courseId: courseData._id,
      userId: user._id,
      amount: (
        courseData.coursePrice -
        (courseData.coursePrice * courseData.discount) / 100
      ).toFixed(2),
    };

    const newPurchase = await PurchaseModel.create(purchaseData);

    // Stripe payment gateway integration
    const line_items = [
      {
        price_data: {
          currency: process.env.CURRENCY.toLowerCase(),
          product_data: {
            name: courseData.courseTitle,
          },
          unit_amount: Math.floor(
            newPurchase.amount
          ) * 100,
        },
        adjustable_quantity: {
          enabled: true,
          minimum: 1,
        },
        quantity: 1,
      },
    ];

    const params = {
      submit_type: "pay",
      mode: "payment",
      payment_method_types: ["card"],
      customer_email: user.email,
      metadata: {
        userId: user._id.toString(),
        purchaseId: newPurchase._id.toString(),
      },
      line_items: line_items,
      success_url: `${process.env.CLIENT_URL}/loading/my-enrollments`,
      cancel_url: `${process.env.CLIENT_URL}/loading/cancel`,
    };

    const session = await Stripe.checkout.sessions.create(params);

    res.json({ success: true, session_url: session.url });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ success: false, message: "Failed to purchase course" });
  }
};

// update user course progress
export const updateCourseProgress = async (req, res) => {
  try {
    const userId = req.auth.userId;
    const { courseId, lectureId } = req.body;

    // If user isn't authenticated, return a 401 error
    if (!userId) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    const user = await UserModel.findOne({ clerkUserId: userId });

    if (!user) {
      return res.status(404).json("User not found!");
    }

    const progressData = await CourseProgress.findOne({
      userId: user._id,
      courseId,
    });
    if (progressData) {
      if (progressData.lectureCompleted.includes(lectureId)) {
        // return res.json({
        //   success: true,
        //   message: "Lecture already completed",
        // });
        // remove lecture from completed list
        progressData.lectureCompleted = progressData.lectureCompleted.filter((lecture) => lecture !== lectureId);
        progressData.save();
      } else {
        progressData.lectureCompleted.push(lectureId);
        progressData.save();
      }
    } else {
      const newProgressData = {
        userId: user._id,
        courseId,
        lectureCompleted: [lectureId],
      };
      await CourseProgress.create(newProgressData);
    }

    res.json({ success: true, message: "Course progress updated", user });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ success: false, message: "Failed to update user course " });
  }
};

// get user course progress
export const getCourseProgress = async (req, res) => {
  try {
    const userId = req.auth.userId;
    const { courseId } = req.body;

    // If user isn't authenticated, return a 401 error
    if (!userId) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    const user = await UserModel.findOne({ clerkUserId: userId });

    if (!user) {
      return res.status(404).json("User not found!");
    }

    const progressData = await CourseProgress.findOne({
      userId: user._id,
      courseId,
    });

    // if (!progressData) {
    //   return res.status(404).json("Course progress not found!");
    // }

    res.json({ success: true, progressData });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch course progress" });
  }
};

// add user rating to course
export const addCourseRating = async (req, res) => {
  try {
    const userId = req.auth.userId;
    const { courseId, rating } = req.body;

    // If user isn't authenticated, return a 401 error
    if (!userId) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    const user = await UserModel.findOne({ clerkUserId: userId });

    if (!user || !user.enrolledCourses.includes(courseId)) {
      return res.status(404).json("User not found or user not purchased this course!");
    }

    if (!courseId || !rating || rating < 1 || rating > 5) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid details" });
    };

    const courseData = await CourseModel.findById(courseId);

    if (!courseData) {
      return res
        .status(404)
        .json({ success: false, message: "Course not found" });
    }

    const existRatingIndex = courseData.courseRatings.findIndex(
      (courseRating) => courseRating.userId.toString() === user._id.toString()
    );

    if (existRatingIndex !== -1) {
      courseData.courseRatings[existRatingIndex].rating = rating;
    } else {
      courseData.courseRatings.push({ userId: user._id, rating });
    }

    await courseData.save();

    res.json({ success: true, message: "Rating added successfully" });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ success: false, message: "Failed to add rating" });
  }

};

// Add a comment to a course
export const addCourseComment = async (req, res) => {
  try {
    const { courseId, comment } = req.body;
    const userId = req.auth.userId;

    if (!userId) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    const user = await UserModel.findOne({ clerkUserId: userId });

    if (!user) {
      return res.status(404).json("User not found!");
    }

    const course = await CourseModel.findById(courseId);

    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found" });
    }

    const existingRatingIndex = course.courseRatings.findIndex(
      (courseRating) => courseRating.userId.toString() === user._id.toString()
    );

    if (existingRatingIndex !== -1) {
      if (course.courseRatings[existingRatingIndex].comment) {
        return res
          .status(400)
          .json({ success: false, message: "User have already commented on this course" });
      }
      course.courseRatings[existingRatingIndex].comment = comment;
    } else {
      course.courseRatings.push({ userId: user._id, comment });
    }

    await course.save();

    res.json({ success: true, message: "Comment added successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Failed to add comment" });
  }
};
