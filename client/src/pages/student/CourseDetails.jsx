import React, { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { AppContext } from "../../context/AppContext";
import Loading from "../../components/student/Loading";
import { assets } from "../../assets/assets";
import humanizeDuration from "humanize-duration";
import Rating from "../../components/student/Rating";

const CourseDetails = () => {
  const { id } = useParams();
  const [courseData, setCourseData] = useState(null);
  const [openSections, setOpenSections] = useState({});
  const {
    allCourses,
    calculateAverageRating,
    calculateCourseChapterTime,
    calculateCourseDuration,
    calculateNoOfLectures,
  } = useContext(AppContext);
  const fetchCourseData = async () => {
    const course = await allCourses.find((course) => course._id === id);
    setCourseData(course);
  };

  const toggleOpenSections = (index) => {
    setOpenSections((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  useEffect(() => {
    fetchCourseData();
  }, []);

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
                  {courseData.educator}
                </span>
              </p>
              <div className="pt-8 text-gray-800">
                <h2 className="text-xl font-semibold">Course structure</h2>
                <div className="pt-5">
                  {courseData.courseContent.map((chapter, index) => (
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
                                    <p className="text-blue-500 underline cursor-pointer">
                                      Review
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
            <div></div>
          </div>
        </>
      ) : (
        <Loading />
      )}
    </div>
  );
};

export default CourseDetails;
