import React, { useContext, useState } from 'react';
import { assets } from '../../assets/assets';
import axios from 'axios';
import { AppContext } from '../../context/AppContext';
import { toast } from 'sonner';

const Footer = () => {
  const [email, setEmail] = useState("");
  const { backendUrl } = useContext(AppContext);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const { data } = await axios.post(`${backendUrl}/api/newsletter/subscribe`, { email });

      if (data.success) {
        toast.success(data.message);
        setEmail("");
      } else {
        console.log(1)
        toast.error(data.message);
      }
    } catch (error) {
      console.log(error)
      toast.error(error.response.data.message);
    }
  };
  return (
    <footer className='bg-gray-800 md:px-36 text-left w-full mt-10'>
      <div className="flex flex-col md:flex-row items-start px-8 md:px-0 justify-center gap-10 md:gap-32 py-10 border-b border-white/30">
        <div className='flex flex-col md:items-start items-center w-full'>
          <img src={assets.logo_dark} alt="logo_dark" />
          <p className='mt-6 text-center md:text-left text-sm text-white/30'>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Officiis dolore similique assumenda suscipit ex, fugiat eius inventore totam enim dolorem dignissimos iure quibusdam at, sit placeat sapiente distinctio ab vero?</p>
        </div>
        <div className='flex flex-col md:items-start items-center w-full'>
          <h2 className='font-semibold text-white mb-5'>Company</h2>
          <ul className='flex md:flex-col w-full justify-between text-sm text-white/80 md:space-y-2'>
            <li className='text-white/60 text-sm'>Home</li>
            <li className='text-white/60 text-sm'>About</li>
            <li className='text-white/60 text-sm'>Services</li>
            <li className='text-white/60 text-sm'>Contact</li>
          </ul>
        </div>
        <div className='hidden md:flex flex-col items-start w-full'>
          <h2 className='font-semibold text-white mb-5'>Subscribe to our newsletter.</h2>
          <p className='text-sm text-white/80'>The lastest news, articles, and resources, sent to your inbox weekly.</p>
          <form className='flex items-center gap-2 mt-4' onSubmit={handleSubmit}>
            
              <input onChange={(e) => setEmail(e.target.value)} value={email} className='border border-gray-500/30 bg-gray-800 text-gray-500 placeholder-gray-500 outline-none w-64 h-9 rounded px-2 text-sm' type="email" placeholder='Enter your email' />
              <button className='bg-blue-600 w-24 h-9 text-white rounded'>Subscribe</button>
           
          </form>
        </div>
      </div>
      <p className='py-4 text-center text-xs md:text-sm text-white/60'>
        &copy; 2024 by LinhDev.  All rights reserved
      </p>
    </footer>
  )
}

export default Footer
