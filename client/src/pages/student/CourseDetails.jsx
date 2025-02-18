import React, { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AppContext } from "../../context/AppContext";
import Loading from "../../components/common/Loading";
import { assets } from "../../assets/assets";
import humanizeDuration from "humanize-duration";
import Rating from "../../components/student/Rating";
import Footer from "../../components/student/Footer";
import Youtube from "react-youtube";
import { toast } from "sonner";
import axios from "axios";

const CourseDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [courseData, setCourseData] = useState(null);
  const [openSections, setOpenSections] = useState({
    0: true,
  });
  const [isAlreadyEnrolled, setIsAlreadyEnrolled] = useState(false);
  const [playerData, setPlayerData] = useState(null);
  const {
    allCourses,
    currency,
    calculateAverageRating,
    calculateCourseChapterTime,
    calculateCourseDuration,
    calculateNoOfLectures,
    backendUrl,
    userData,
    getToken,
  } = useContext(AppContext);
  const fetchCourseData = async () => {
    // const course = await allCourses.find((course) => course._id === id);

    const { data } = await axios.get(`${backendUrl}/api/course/${id}`);
    if (data.success) {
      setCourseData(data.course);
    } else {
      toast.error(data.message);
    }
  };

  const toggleOpenSections = (index) => {
    setOpenSections((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  const purchaseCourse = async () => {
    try {
      if (!userData) {
        toast.warning("Please login to enroll in the course");
        return;
      }
      if (isAlreadyEnrolled) {
        toast.warning("You are already enrolled in this course");
        return;
      }
      const token = await getToken();
      const { data } = await axios.post(
        `${backendUrl}/api/user/purchase`,
        { courseId: courseData._id },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (data.success) {
        toast.success(data.message);
        window.location.replace(data.session_url);
        // setIsAlreadyEnrolled(true);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    fetchCourseData();
  }, [allCourses]);

  useEffect(() => {
    if (userData && courseData) {
      setIsAlreadyEnrolled(userData.enrolledCourses.includes(courseData?._id));
    }
  }, [userData, courseData]);

  return (
    <div>
      {courseData ? (
        <>
          <div className="flex md:flex-row flex-col-reverse gap-10 relative items-start justify-between md:px-36 px-8 md:pt-32 pt-20 text-left">
            <div className="absolute top-0 left-0 w-full h-section-height -z-1 bg-gradient-to-b from-cyan-100/70"></div>
            {/* left */}
            <div className="max-w-xl z-10 text-gray-500">
              <h1 className="md:text-courser-details-heading-large text-courser-details-heading-small font-semibold text-gray-800">
                {courseData.courseTitle}
              </h1>
              <p
                dangerouslySetInnerHTML={{
                  __html: courseData.courseDescription.slice(0, 200),
                }}
                className="pt-4 md:text-base text-sm"
              ></p>
              {/* review and rating */}
              <Rating course={courseData} />
              <p className="text-sm">
                Course by{" "}
                <span className="text-blue-600 underline">
                  {courseData.educator.name}
                </span>
              </p>
              <div className="pt-8 text-gray-800">
                <h2 className="text-xl font-semibold">Course structure</h2>
                <div className="pt-5">
                  {courseData?.courseContent.map((chapter, index) => (
                    <div
                      key={index}
                      className="border border-gray-300 bg-white mb-2 rounded"
                    >
                      <div
                        className="flex items-center justify-between px-4 py-3 cursor-pointer select-none bg-gray-200/50"
                        onClick={() => toggleOpenSections(index)}
                      >
                        <div className="flex items-center gap-2">
                          <img
                            className={` transform transition-transform ${
                              openSections[index] ? "rotate-180" : ""
                            } `}
                            src={assets.down_arrow_icon}
                            alt="down_arrow_icon"
                          />
                          <p className="font-medium md:text-base text-sm">
                            {chapter.chapterTitle}
                          </p>
                        </div>
                        <p className="text-sm md:text-default">
                          {chapter.chapterContent.length} lecture -{" "}
                          {calculateCourseChapterTime(chapter)}
                        </p>
                      </div>
                      <div
                        className={`overflow-hidden transition-all duration-300 ease-in-out ${
                          openSections[index] ? "max-h-96" : "max-h-0"
                        }`}
                      >
                        <ul className="list-disc md:pl-10 pl-4 pr-4 py-2 text-gray-600 border-t border-gray-300">
                          {chapter.chapterContent.map((lecture, index) => (
                            <li
                              key={index}
                              className="flex items-start gap-2 py-1"
                            >
                              <img
                                src={assets.play_icon}
                                alt="play_icon"
                                className="w-4 h-4 mt-1"
                              />
                              <div className="flex items-center justify-between w-full text-gray-800 text-xs md:text-default">
                                <p className="text-sm md:text-default">
                                  {lecture.lectureTitle}
                                </p>
                                <div className="flex gap-2">
                                  {lecture.isPreviewFree && (
                                    <p
                                      onClick={() =>
                                        setPlayerData({
                                          videoId: lecture.lectureUrl
                                            .split("/")
                                            .pop(),
                                        })
                                      }
                                      className="text-blue-500 underline cursor-pointer"
                                    >
                                      Preview
                                    </p>
                                  )}
                                  <p>
                                    {humanizeDuration(
                                      lecture.lectureDuration * 60 * 1000,
                                      { units: ["h", "m"] }
                                    )}
                                  </p>
                                </div>
                              </div>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="py-20 text-sm md:text-default">
                <h2 className="text-xl font-semibold text-gray-800">
                  Course Description
                </h2>
                <p
                  className="pt-3 rich-text"
                  dangerouslySetInnerHTML={{
                    __html: courseData.courseDescription,
                  }}
                ></p>
              </div>
            </div>
            {/* right */}
            <div className="max-w-course-card z-10 shadow-custom-card rounded-t md:rounded-none overflow-hidden bg-white min-w-[300px] sm:min-w-[420px]">
              {playerData ? (
                <Youtube
                  videoId={playerData.videoId}
                  opts={{ playerVars: { autoplay: 1 } }}
                  iframeClassName="w-full aspect-video"
                />
              ) : (
                <img src={courseData.courseThumbnail} alt="courseThumbnail" />
              )}
              <div className="p-5">
                <div className="flex items-center gap-2">
                  <img
                    className="w-3.5"
                    src={assets.time_left_clock_icon}
                    alt="time_left_clock_icon"
                  />
                  <p className="text-red-500">
                    <span className="font-medium">5 days</span> left at this
                    price
                  </p>
                </div>
                <div className="flex gap-3 items-center pt-2">
                  <p className="text-gray-800 md:text-4xl text-2xl font-semibold">
                    {currency}{" "}
                    {(
                      courseData.coursePrice -
                      (courseData.discount * courseData.coursePrice) / 100
                    ).toFixed(2)}
                  </p>
                  <p className="md:text-lg text-gray-500 line-through">
                    {currency} {courseData.coursePrice}
                  </p>
                  <p className="md:text-lg text-gray-500">
                    {courseData.discount}% off
                  </p>
                </div>
                <div className="flex items-center text-sm md:text-default gap-4 pt-2 md:pt-4 text-gray-500">
                  <div className="flex items-center gap-1">
                    <img src={assets.star} alt="star" />
                    <p>{calculateAverageRating(courseData)}</p>
                  </div>
                  <div className="h-4 w-px bg-gray-500/40"></div>
                  <div className="flex items-center gap-1">
                    <img src={assets.time_clock_icon} alt="time_clock_icon" />
                    <p>{calculateCourseDuration(courseData)}</p>
                  </div>
                  <div className="h-4 w-px bg-gray-500/40"></div>
                  <div className="flex items-center gap-1">
                    <img src={assets.lesson_icon} alt="lesson_icon" />
                    <p>{calculateNoOfLectures(courseData)} lectures</p>
                  </div>
                </div>
                {!isAlreadyEnrolled && 
                <button
                  onClick={purchaseCourse}
                  className="md:mt-6 mt-4 w-full py-3 text-white font-medium bg-blue-600 rounded"
                >
                  {"Enroll Now"}
                </button>}
                {isAlreadyEnrolled && <button
                  onClick={() => navigate(`/player/${courseData._id}`)}
                  className="md:mt-6 mt-4 w-full py-3 text-white font-medium bg-purple-600 rounded cursor-pointer"
                >
                  {"Go to Course"}
                </button>}
                <div className="pt-6">
                  <p className="md:text-xl text-lg font-medium text-gray-800">
                    What's in the course?
                  </p>
                  <ul className="ml-4 pt-2 text-sm md:text-default list-disc text-gray-500">
                    <li>Lifetime access with free updates.</li>
                    <li>Live Chat Feature.</li>
                    <li>Order Management Feature</li>
                    <li>Creating a Custom Page Builder</li>
                    <li>Managing Dynamic Newsletters</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
          <Footer />
        </>
      ) : (
        <Loading />
      )}
    </div>
  );
};

export default CourseDetails;
