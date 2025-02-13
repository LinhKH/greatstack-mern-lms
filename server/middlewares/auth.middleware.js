import { clerkClient } from "@clerk/express";

export const protectEducator = async (req, res, next) => {
  try {
    const userId = req.auth.userId;

    // If user isn't authenticated, return a 401 error
    if (!userId) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    const user = await clerkClient.users.getUser(userId);

    if (user.publicMetadata.role !== "educator") {
      return res
        .status(403)
        .json({
          success: false,
          message: "User is not authorized to perform this action",
        });
    }

    next();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to authenticate user" });
  }
};
