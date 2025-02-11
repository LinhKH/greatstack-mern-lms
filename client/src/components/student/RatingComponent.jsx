import React, { useEffect, useState } from "react";

const RatingComponent = ({ initialRating, onRate }) => {
  const [rating, setRating] = useState(initialRating || 0);

  const handleRating = (value) => {
    setRating(value);
    if (onRate) onRate(value);
  };

  useEffect(() => {
    if (initialRating) {
      setRating(initialRating);
    }
  }, [initialRating]);

  return (
    <div className="flex gap-1">
      {Array.from({ length: 5 }).map((_, index) => {
        const startValue = index + 1;
        return (
          <span
            onClick={() => handleRating(startValue)}
            key={index}
            className={`text-xl sm:text-2xl cursor-pointer transition-colors ${
              startValue <= rating ? "text-yellow-500" : "text-gray-400"
            }`}
          >
            &#9733;
          </span>
        );
      })}
    </div>
  );
};

export default RatingComponent;
