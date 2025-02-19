import CourseModel from "../models/course.model.js";

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
    const course = await CourseModel.findById(req.params.id).populate({
      path: "educator",
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


