import React from "react";
import { Link } from "react-router-dom";
import { FaTimesCircle } from "react-icons/fa";

const Cancel = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-red-100">
      <div className="m-2 w-full max-w-md bg-white p-6 py-8 rounded-lg shadow-lg flex flex-col justify-center items-center gap-5">
        <FaTimesCircle size={50} className="text-red-600" />
        <p className="text-red-800 font-bold text-xl text-center">
          Order Cancelled
        </p>
        <Link
          to="/"
          className="border border-red-900 text-red-900 hover:bg-red-900 hover:text-white transition-all px-6 py-2 rounded-full"
        >
          Go To Home
        </Link>
      </div>
    </div>
  );
};

export default Cancel;
