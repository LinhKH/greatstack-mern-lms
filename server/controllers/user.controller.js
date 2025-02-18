import CourseModel from "../models/course.model.js";
import PurchaseModel from "../models/purchase.model.js";
import UserModel from "../models/user.model.js";
import Stripe from "../configs/stripe.js";

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
      success_url: `${process.env.CLIENT_URL}/my-enrollments`,
      cancel_url: `${process.env.CLIENT_URL}/cancel`,
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
