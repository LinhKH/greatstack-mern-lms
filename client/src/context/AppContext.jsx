import { createContext, use, useEffect, useState } from "react";
import { dummyCourses } from "../assets/assets";
import humanizeDuration from 'humanize-duration';

export const AppContext = createContext();

export const AppContextProvider = ({ children }) => {
  const currency = import.meta.env.VITE_CURRENCY;
  const [allCourses, setAllCourses] = useState([]);
  const [isEducator, setIsEducator] = useState(false);

  // Fetch all courses
  const fetchAllCourses = async () => {
    setAllCourses(dummyCourses);
  };

  // Function to calculate average rating of a course
  const calculateAverageRating = (course) => {
    if (course.courseRatings.length === 0) return 0;
    const totalRating = course.courseRatings.reduce((acc, rating) => acc + rating.rating, 0);
    return totalRating / course.courseRatings.length;
  };

  // Function to calculate the course chapter time
  const calculateCourseChapterTime = (chapter) => {
    const totalDuration = chapter.chapterContent.reduce((acc, lecture) => acc + lecture.lectureDuration, 0);
    return humanizeDuration(totalDuration * 60 * 1000, { units: ['h', 'm'], round: true });
  };

  // Functin to calculate course duration
  const calculateCourseDuration = (course) => {
    let time = 0;
    course.courseContent.forEach(chapter => {
      time += chapter.chapterContent.reduce((acc, lecture) => acc + lecture.lectureDuration, 0);
    });
    return humanizeDuration(time * 60 * 1000, { units: ['h', 'm'], round: true });
  };

  // Function to calculate to no of lectures in a course
  const calculateNoOfLectures = (course) => {
    let lectures = 0;
    course.courseContent.forEach(chapter => {
      lectures += chapter.chapterContent.length;
    });
    return lectures;
  };

  const initialState = {
    user: null,
    currency,
    allCourses,
    calculateAverageRating,
    isEducator, setIsEducator,
    calculateCourseChapterTime,
    calculateCourseDuration,
    calculateNoOfLectures,
  };

  useEffect(() => {
    fetchAllCourses();
  }, []);

  return (
    <AppContext.Provider value={initialState}>
      {children}
    </AppContext.Provider>
  );
};