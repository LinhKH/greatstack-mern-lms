import { Webhook } from "svix";
import User from "../models/user.model.js";
import Stripe from "../configs/stripe.js";
import PurchaseModel from "../models/purchase.model.js";
import UserModel from "../models/user.model.js";
import CourseModel from "../models/course.model.js";

// api controller function to manage clerk user with database
export const clerkWebhook = async (req, res) => {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    throw new Error("Webhook secret needed!");
  }

  const payload = req.body;
  const headers = req.headers;

  const webhook = new Webhook(WEBHOOK_SECRET);
  let evt;
  try {
    evt = await webhook.verify(payload, headers);
  } catch (error) {
    res.status(400).json({
      message: "Webhook verification failed!",
    });
  }
  const { type, data } = evt;
  // console.log(evt);
  switch (type) {
    case "user.created":
      const newUser = new User({
        clerkUserId: data.id,
        name:
          data.first_name + " " + data.last_name ||
          data.email_addresses[0].email_address,
        email: data.email_addresses[0].email_address,
        imageUrl: data.profile_image_url,
      });

      await newUser.save();

      break;
    case "user.updated":
      await User.findOneAndUpdate(
        { clerkUserId: data.id },
        {
          name:
            data.first_name + " " + data.last_name ||
            data.email_addresses[0].email_address,
          email: data.email_addresses[0].email_address,
          imageUrl: data.profile_image_url,
        },
        { new: true }
      );
      break;

    case "user.deleted":
      await User.findOneAndDelete({
        clerkUserId: data.id,
      });
      break;

    default:
      break;
  }

  return res.status(200).json({
    message: "Webhook received",
  });
};

export const stripeWebhook = async (req, res) => {
  const WEBHOOK_SECRET = process.env.STRIPE_ENPOINT_WEBHOOK_SECRET_KEY;

  if (!WEBHOOK_SECRET) {
    throw new Error("Webhook secret needed!");
  }

  const evt = req.body;
  // console.log(evt);
  switch (evt.type) {
    case "payment_intent.succeeded":
      const paymentIntent = evt.data.object;
      const paymentIntentId = paymentIntent.id;

      const session = await Stripe.checkout.sessions.list({
        payment_intent: paymentIntentId,
      });

      const { purchaseId } = session.data[0].metadata;

      const purchaseData = await PurchaseModel.findById(purchaseId);
      const userData = await UserModel.findById(purchaseData.userId);
      const courseData = await CourseModel.findById(purchaseData.courseId);

      courseData.enrolledStudents.push(userData._id);
      await courseData.save();
      userData.enrolledCourses.push(courseData._id);
      await userData.save();
      purchaseData.status = "completed";
      await purchaseData.save();

      break;

    case "payment_intent.payment_failed":
      const failedPaymentIntent = evt.data.object;
      const failedPaymentIntentId = failedPaymentIntent.id;

      const failedSession = Stripe.checkout.sessions.list({
        payment_intent: failedPaymentIntentId,
      });

      const { FailedPurchaseId } = failedSession.data[0].metadata;
      const failedPurchaseData = await PurchaseModel.findById(FailedPurchaseId);
      failedPurchaseData.status = "failed";
      failedPurchaseData.save();

      break;

    default:
      console.log(`Unhandled event type ${evt.type}`);
      break;
  }

  res.json({ received: true });
};
