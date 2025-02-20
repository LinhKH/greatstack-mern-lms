import React, { useContext, useEffect, useState } from "react";
import { AppContext } from "../../context/AppContext";
import { useParams } from "react-router-dom";
import { assets } from "../../assets/assets";
import humanizeDuration from "humanize-duration";
import YouTube from "react-youtube";
import Footer from "../../components/student/Footer";
import RatingComponent from "../../components/student/RatingComponent";
import { toast } from "sonner";
import axios from "axios";
import Loading from "../../components/common/Loading";

const Player = () => {
  const { courseId } = useParams();
  const {
    enrolledCourses,
    calculateCourseChapterTime,
    userData,
    getToken,
    backendUrl,
  } = useContext(AppContext);
  const [courseData, setCourseData] = useState(null);
  const [playerData, setPlayerData] = useState(null);
  const [progressData, setProgressData] = useState(null);
  const [initialRating, setInitialRating] = useState(0);
  const [comment, setComment] = useState("");

  const [openSections, setOpenSections] = useState({
    0: true,
  });

  const fetchCourseData = async () => {
    await enrolledCourses.map((course) => {
      if (course._id === courseId) {
        setCourseData(course);
        course?.courseRatings.map((rating) => {
          if (rating.userId === userData._id) {
            setInitialRating(rating.rating);
          }
        });
      }
    });
  };

  const markLectureAsCompleted = async (lectureId) => {
    try {
      const token = await getToken();
      const { data } = await axios.post(
        `${backendUrl}/api/user/update-course-progress`,
        { courseId, lectureId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (data.success) {
        getCourseProgress();
        toast.success(data.message);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  const getCourseProgress = async () => {
    try {
      const token = await getToken();
      const { data } = await axios.post(
        `${backendUrl}/api/user/get-course-progress`,
        { courseId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (data.success) {
        setProgressData(data.progressData);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  const handleRating = async (rating) => {
    try {
      const token = await getToken();
      const { data } = await axios.post(
        `${backendUrl}/api/user/add-rating`,
        { courseId, rating },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (data.success) {
        toast.success(data.message);
        fetchCourseData();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = await getToken();
      const { data } = await axios.post(
        `${backendUrl}/api/user/add-comment`,
        { courseId: courseData._id, comment },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (data.success) {
        toast.success(data.message);
        setComment("");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.info(error.response.data.message);
    }
  };

  const toggleOpenSections = (index) => {
    setOpenSections((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  useEffect(() => {
    if (enrolledCourses) {
      fetchCourseData();
    }
  }, [enrolledCourses]);

  useEffect(() => {
    getCourseProgress();
  }, []);

  return (
    <>
      {!courseData && <Loading />}
      <div className="p-4 sm:p-10 flex flex-row-reverse md:grid md:grid-cols-2 gap-10 md:px-36">
        {/* left column */}
        <div className="text-gray-800">
          <h2 className="text-xl font-semibold">Course Structure</h2>
          <div className="pt-5">
            {courseData &&
              courseData.courseContent.map((chapter, index) => (
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
                      {chapter.chapterContent.map((lecture, i) => (
                        <li key={i} className="flex items-start gap-2 py-1">
                          <img
                            src={
                              progressData &&
                              progressData.lectureCompleted.includes(
                                lecture.lectureId
                              )
                                ? assets.blue_tick_icon
                                : assets.play_icon
                            }
                            alt="play_icon"
                            className="w-4 h-4 mt-1"
                          />
                          <div className="flex items-center justify-between w-full text-gray-800 text-xs md:text-default">
                            <p className="text-sm md:text-default">
                              {lecture.lectureTitle}
                            </p>
                            <div className="flex gap-2">
                              {lecture.lectureUrl && (
                                <p
                                  onClick={() =>
                                    setPlayerData({
                                      ...lecture,
                                      chapter: index + 1,
                                      lecture: i + 1,
                                    })
                                  }
                                  className="text-blue-500 underline cursor-pointer"
                                >
                                  Watch
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
          <div className="flex items-center gap-2 py-3 mt-10">
            <h1 className="text-xl font-bold">Rate this course:</h1>
            <RatingComponent
              initialRating={initialRating}
              onRate={handleRating}
            />
          </div>
          <div className="flex flex-col gap-2 mt-4">
            <h1 className="text-xl font-bold">Comment this course:</h1>
            <textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              required
              className="outline-none md:py-2.5 py-2 px-3 rounded border border-gray-500"
            />
          </div>
          <button
            type="button" onClick={handleCommentSubmit}
            className="bg-black text-white w-max py-2.5 px-8 rounded my-4"
          >
            Submit
          </button>
        </div>
        {/* right column */}
        <div className="md:mt-10">
          {playerData ? (
            <div>
              <YouTube
                videoId={playerData.lectureUrl.split("/").pop()}
                opts={{ playerVars: { autoplay: 1 } }}
                iframeClassName="w-full aspect-video"
              />
              <div className="flex justify-between items-centerm mt-1">
                <p>
                  {playerData.chapter}.{playerData.lecture}{" "}
                  {playerData.lectureTitle}
                </p>
                <button
                  className="text-blue-600"
                  onClick={() => markLectureAsCompleted(playerData.lectureId)}
                >
                  {progressData &&
                  progressData.lectureCompleted.includes(playerData.lectureId)
                    ? "Completed"
                    : "Mark Completed"}
                </button>
              </div>
            </div>
          ) : (
            <img
              src={courseData && courseData.courseThumbnail}
              alt="courseThumbnail"
            />
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Player;
