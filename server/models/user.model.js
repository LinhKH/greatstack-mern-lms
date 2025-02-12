import mongoose from "mongoose";
import bcryptjs from "bcryptjs";

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
    password: {
      type: String,
      required: [true, "provide password"],
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

// Pre-save hook to hash the password
userSchema.pre("save", async function (next) {
  if (this.isModified("password") || this.isNew) {
    this.password = await bcryptjs.hash(this.password, 10);
  }
  next();
});

// Method to check password
userSchema.methods.checkPassword = async function (password) {
  return await bcryptjs.compare(password, this.password);
};

const UserModel = mongoose.model("User", userSchema);

export default UserModel;
