import React from "react";
import { assets, dummyEducatorData as educatorData } from "../../assets/assets";
import { UserButton, useUser } from "@clerk/clerk-react";
import { Link } from "react-router-dom";

const Navbar = () => {
  const { user } = useUser();
  return (
    <div className="flex items-center justify-between px-4 md:px-8 border-b border-gray-500 py-3">
      <Link to={"/"}>
        <img src={assets.logo} className="w-28 lg:w-32" alt="logo" />
      </Link>
      <div className="flex items-center gap-5 text-gray-500 relative">
        <p>Hi! {user ? user.fullName : 'Developers'}</p>
        { user ? <UserButton /> : <img src={assets.profile_img} className="max-w-8 rounded-full" alt="user" /> }
      </div>
    </div>
  );
};

export default Navbar;
