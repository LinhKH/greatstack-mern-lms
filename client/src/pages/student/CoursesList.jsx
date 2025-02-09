import React, { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import SearchBar from "../../components/student/SearchBar";
import { AppContext } from "../../context/AppContext";
import CourseCard from "../../components/student/CourseCard";
import { assets } from "../../assets/assets";
import Footer from "../../components/student/Footer";

const CoursesList = () => {
  const navigate = useNavigate();
  const { input } = useParams();
  const { allCourses } = useContext(AppContext);
  const [filteredCourses, setFilteredCourses] = useState([]);

  useEffect(() => {
    if (input) {
      const filteredCourses = allCourses.filter(course => course.courseTitle.toLowerCase().includes(input.toLowerCase()));
      setFilteredCourses(filteredCourses);
    } else {
      setFilteredCourses(allCourses);
    }
  }, [input, allCourses]);

  return (
    <>
      <div className="relative md:px-36 px-8 pt-20 text-left">
        <div className="flex md:flex-row flex-col gap-6 items-start justify-between w-full">
          <div>
            <h1 className="text-4xl font-semibold text-gray-800">Course List</h1>
            <p className="text-gray-500">
              <span
                onClick={() => navigate("/")}
                className="text-blue-600 cursor-pointer"
              >
                Home
              </span>{" "}
              / <span>Course list</span>
            </p>
          </div>
          <SearchBar data={input} />
        </div>
        {
          input && (
            <div className="inline-flex items-center gap-4 px-4 py-2 border mt-8 -mb-8 text-gray-600">
              <p>{input}</p>
              <img src={assets.cross_icon} alt="cross_icon" className="cursor-pointer" onClick={() => navigate('/course-list')} />
            </div>
          )
        }
        <div className="grid grid-cols-auto px-4 md:px-0 md:my-16 my-10 gap-4">
          {
            filteredCourses.map((course, index) => (<CourseCard course={course} key={index} />))
          }
        </div>
      </div>
      <Footer />
    </>
  );
};

export default CoursesList;
