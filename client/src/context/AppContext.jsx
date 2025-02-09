import { createContext, use, useEffect, useState } from "react";
import { dummyCourses } from "../assets/assets";

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

  const initialState = {
    user: null,
    currency,
    allCourses,
    calculateAverageRating,
    isEducator, setIsEducator,
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