import React, { use, useContext } from "react";
import { assets } from "../../assets/assets";
import { AppContext } from "../../context/AppContext";
import { useLocation } from "react-router-dom";

const Rating = ({ course }) => {
  const { calculateAverageRating } = useContext(AppContext);
  const { pathname } = useLocation();
  console.log(pathname);
  return (
    <div className="flex items-center space-x-2 pt-3 pb-1 text-sm">
      <p>{calculateAverageRating(course)}</p>
      <div className="flex">
        {[...Array(5)].map((_, i) => (
          <img
            className="w-3.5 h-3.5"
            key={i}
            src={
              i < Math.floor(calculateAverageRating(course))
                ? assets.star
                : assets.star_blank
            }
          />
        ))}
      </div>
      <p className="text-blue-600 text-base md:text-sm">
        ({course.courseRatings.length}{" "}
        {pathname.startsWith("/course/") &&
          (course.courseRatings.length > 1 ? "ratings" : "rating")}
        )
      </p>
      {pathname.startsWith("/course/") && (
        <p className="text-base md:text-sm">
          {course.enrolledStudents.length}{" "}
          {course.enrolledStudents.length > 1 ? "students" : "student"}
        </p>
      )}
    </div>
  );
};

export default Rating;
