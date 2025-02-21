import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
    },
  },
  {
    timestamps: true,
  }
);

// create slug from name
categorySchema.pre("save", function (next) {
  this.slug = this.name.split(" ").join("-").toLowerCase();
  next();
});

const CategoryModel = mongoose.model("Category", categorySchema);

export default CategoryModel;
