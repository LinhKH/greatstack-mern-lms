import React from 'react';

const Loading = () => {
  return (
    <div className='fixed inset-0 bg-gray-200 bg-opacity-75 z-50 flex items-center justify-center pointer-events-auto'>
      <div className='w-16 sm:w-20 aspect-square border-4 border-gray-300 border-t-4 border-t-blue-400 rounded-full animate-spin'></div>
    </div>
  )
}

export default Loading
