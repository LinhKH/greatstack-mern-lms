import { createContext, use, useEffect, useState } from "react";
import { dummyCourses } from "../assets/assets";
import humanizeDuration from 'humanize-duration';
import { useAuth, useUser } from "@clerk/clerk-react";
import axios from "axios";
import { toast } from "sonner";

export const AppContext = createContext();

export const AppContextProvider = ({ children }) => {
  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const currency = import.meta.env.VITE_CURRENCY;

  const { getToken } = useAuth();
  const { user } = useUser();

  const [allCourses, setAllCourses] = useState([]);
  const [isEducator, setIsEducator] = useState(false);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [userData, setUserData] = useState(null);

  // Fetch all courses
  const fetchAllCourses = async () => {
    // setAllCourses(dummyCourses);
    const { data } = await axios.get(`${backendUrl}/api/course/all`);
    if (data.success) {
      setAllCourses(data.courses);
    } else {
      toast.error(data.message);
    }
  };

  // fetch user data
  const fetchUserData = async () => {
    if (user.publicMetadata.role === 'educator') {
      setIsEducator(true);
    }
    try {
      const token = await getToken();
      const { data } = await axios.get(`${backendUrl}/api/user/data`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (data.success) {
        setUserData(data.user);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  // Function to calculate average rating of a course
  const calculateAverageRating = (course) => {
    if (course.courseRatings.length === 0) return 0;
    const totalRating = course.courseRatings.reduce((acc, rating) => acc + rating.rating, 0);
    return Math.floor(totalRating / course.courseRatings.length);
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

  // Function to set enrolled courses
  const fetchUserEnrolledCourse = async () => {
    // setEnrolledCourses(dummyCourses.filter(course => course.enrolledStudents.includes('user_2qQlvXyr02B4Bq6hT0Gvaa5fT9V')));
    try {
      const token = await getToken();
      const { data } = await axios.get(`${backendUrl}/api/user/enrolled-courses`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      if (data.success) {
        setEnrolledCourses(data.enrolledCourses.reverse());
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };


  const initialState = {
    user: null,
    currency,
    backendUrl,
    allCourses,
    calculateAverageRating,
    isEducator, setIsEducator,
    calculateCourseChapterTime,
    calculateCourseDuration,
    calculateNoOfLectures,
    enrolledCourses,
    fetchUserEnrolledCourse,
    userData, setUserData, getToken, fetchAllCourses, fetchUserData
  };

  useEffect(() => {
    fetchAllCourses();
  }, []);

  const logToken = async () => console.log(await getToken());

  useEffect(() => {
    if (user) {
      logToken();
      fetchUserData();
      fetchUserEnrolledCourse();
    }
  }, [user]);

  return (
    <AppContext.Provider value={initialState}>
      {children}
    </AppContext.Provider>
  );
};