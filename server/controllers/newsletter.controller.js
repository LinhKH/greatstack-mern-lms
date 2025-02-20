import NewsletterModel from "../models/newsletter.model.js";

export const subscribeNewsletter = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res
        .status(400)
        .json({ success: false, message: "Email is required" });
    }

    const existingSubscription = await NewsletterModel.findOne({ email });

    if (existingSubscription) {
      return res
        .status(400)
        .json({ success: false, message: "Email is already subscribed" });
    }

    const newSubscription = new NewsletterModel({ email });
    await newSubscription.save();

    res
      .status(200)
      .json({
        success: true,
        message: "Subscribed to newsletter successfully",
      });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ success: false, message: "Failed to subscribe to newsletter" });
  }
};
