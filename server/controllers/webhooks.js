import { Webhook } from "svix";
import User from "../models/user.model.js";

// api controller function to manage clerk user with database
export const clerkWebhook = async (req, res) => {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    throw new Error("Webhook secret needed!");
  }

  const payload = req.body;
  const headers = req.headers;

  try {
    const webhook = new Webhook(WEBHOOK_SECRET);
    evt = await webhook.verify(JSON.stringify(payload), {
      "svix-id": headers["svix-id"],
      "svix-timestamp": headers["svix-timestamp"],
      "svix-signature": headers["svix-signature"],
    });
    const { type, data } = evt;
    console.log(evt);
    switch (type) {
      case "user.created":
        const newUser = new User({
          _id: data.id,
          name: data.first_name + ' ' + data.last_name || data.email_addresses[0].email_address,
          email: data.email_addresses[0].email_address,
          imageUrl: data.profile_img_url,
        });
    
        await newUser.save();
        
        break;
      case "user.updated":
        const updatedUser = await User.findOneAndUpdate(
          { _id: data.id },
          {
            name: data.first_name + ' ' + data.last_name || data.email_addresses[0].email_address,
            email: data.email_addresses[0].email_address,
            imageUrl: data.profile_img_url,
          },
          { new: true }
        );
        break;

      case "user.deleted":
        const deletedUser = await User.findOneAndDelete({
          _id: data.id,
        });
        break;
    
      default:
        break;
    }

    return res.status(200).json({
      message: "Webhook received",
    });
  } catch (error) {
    res.status(400).json({
      message: "Webhook verification failed!",
    });
  }
};