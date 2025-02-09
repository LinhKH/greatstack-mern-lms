import React, { useContext } from 'react';
import { assets } from '../../assets/assets';
import { AppContext } from '../../context/AppContext';
import { Link } from 'react-router-dom';

const CourseCard = ({course}) => {
  const {currency, calculateAverageRating} = useContext(AppContext);
  return (
    <Link to={`/course/${course._id}`} className="border border-gray-500/300 pb-6 overflow-hidden rounded-lg" onClick={() => window.scrollTo(0,0)}>
      <img className='w-full' src={course.courseThumbnail} alt="" />
      <div className="p-3 text-left">
        <h3 className='text-base font-semibold'>{course.courseTitle}</h3>
        <p className='text-gray-500'>{course.educator.name}</p>
        <div className='flex items-center space-x-2'>
          <p>{calculateAverageRating(course)}</p>
          <div className='flex'>
            {[...Array(5)].map((_, i) => (<img className='w-3.5 h-3.5' key={i} src={i < Math.floor(calculateAverageRating(course)) ? assets.star : assets.star_blank} />))}
          </div>
          <p className='text-gray-500'>{course.courseRatings.length}</p>
        </div>
        <p className='text-base font-semibold text-gray-800'>{currency} { (course.coursePrice - course.discount * course.coursePrice /100).toFixed(2) }</p>
      </div>
    </Link>
  )
}

export default CourseCard
