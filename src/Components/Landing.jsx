import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';

// Images
import bgImage from "../Images/BG.png";
import lifelyLogo from "../Images/LifelyLogo.png";
import laptop from "../Images/laptop.png";
import pageImage from "../Images/page.png";

// Icons
import plannerIcon from "../icons/planner.svg";
import remindIcon from "../icons/remind.svg";
import diaryIcon from "../icons/diary.svg";
import phoneIcon from "../icons/phone.png";
import emailIcon from "../icons/email.png";
import twitterIcon from "../icons/twitter.png";

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen">
      {/* Background with Opacity */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url(${bgImage})`,
          opacity: 0.7, // para sa opacity
          zIndex: -1, // para ma set into back ng contents
        }}
      ></div>

      {/* Navbar with Background Image */}
      <nav className="fixed top-0 left-0 w-full bg-cover bg-center z-50"
        style={{
          backgroundImage: `url(${bgImage})`,
        }}
      >
        <div className="flex justify-between items-center h-28 px-4">

        {/* Left: Logo Placeholder */}
        <div className="flex items-center pl-5">
          <div className="w-16 h-16 flex items-center justify-center">
            <img src={lifelyLogo} alt="Lifely Logo" className="w-full h-full object-contain" />
          </div>
        </div>

          {/* Right: Login and Sign Up */}
          <div className="flex items-center space-x-4 pr-5">
            <button 
              className="text-black px-4 py-2 pr-5 hover:text-gray-400 transition text-sm sm:text-lg"
              onClick={() => navigate('/login')}
            >
              Login
            </button>
            <button 
              className="bg-white text-black px-4 py-2 rounded-full hover:bg-pink-100 transition text-sm sm:text-lg"
              onClick={() => navigate('/register')}
            >
              Sign Up
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="relative pt-28 pb-0 flex items-center justify-center min-h-screen">

        {/* Wrapper now spans the full screen width */}
        <div className="bg-transparent p-40 flex flex-wrap md:flex-nowrap w-full">

          {/* Left Section */}
          <div className="pl-0 w-full md:w-1/2 text-center md:text-left mb-6 md:mb-0">
            <h1 className="text-2xl sm:text-7xl font-bold text-black">
              A simple way to <br />
              <span className="text-[#FFB78B]">track it all</span> with <span>Lifely</span>

            </h1>
            <p className="text-sm sm:text-3xl text-black mt-10">
              Simplify your routine, track progress, and stay on top of what matters most, all with an intuitive and user-friendly  interface designed to make your life easier.
            </p>


            {/* Get Started Button with animation */}
            <motion.div 
              className="mt-10"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <button 
                onClick={() => navigate('/register')}
                className="bg-[#FFB78B] text-black font-semibold px-6 py-3 rounded-lg hover:bg-[#e6a874] text-sm sm:text-3xl shadow-lg hover:shadow-xl"
              >
                Get Started with Lifely
              </button>
            </motion.div>
          </div>

          {/* Laptop side with animation */}
          <motion.div 
            className="w-full md:w-1/2 pr-30 flex justify-end items-center"
            initial={{ opacity: 0, x: 100 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="w-95 h-80 flex items-center justify-center">
               <img src={laptop} alt="laptop" />
            </div>
          </motion.div>
        </div>
      </div>

      {/* Text below with animation */}
      <motion.div 
        className="bg-transparent p-10 pt-0 rounded-lg flex flex-wrap md:flex-nowrap w-full"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="w-full text-center mt-0 mb-10 pb-0">
          <p className="text-lg sm:text-2xl text-black font-bold">
            Highly effective for students, professionals, and anyone to stay organized
          </p>
        </div>
      </motion.div>

      {/* Features section with animation */}
      <motion.div 
        className="bg-white p-10 pt-5 rounded-lg flex flex-wrap md:flex-nowrap w-full"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
      >
        <div className="w-full text-center mt-10 pb-6">

          {/* Logo Placeholder */}
          <div className="w-20 h-20 mx-auto flex items-center justify-center mb-6">
            <img src={lifelyLogo} alt="Lifely Logo" className="w-full h-full object-contain" />
          </div>

          {/* "Our Special Features" Text */}
          <p className="text-lg mt-10 sm:text-5xl text-black font-bold">
            Our Special Features
          </p>
        </div>
      </motion.div>

      {/* Three Hovering Rounded Rectangles with Title Placeholders */}
      <div className="bg-white p-10 pb-16 flex justify-center gap-28">

        {/* Planner */}
        <div className="w-80 h-96 rounded-lg bg-pastelPink bg-opacity-80 hover:bg-pink-100 transition-shadow shadow-lg flex items-center justify-center flex-col">
          <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mb-4">
            <img src={plannerIcon} alt="Add" className="w-14 h-12 opacity-65" />
          </div>
          <p className="text-lg text-center text-black font-bold">Daily Planner</p>
          <p className="mt-5 mb-5 px-10 text-lg text-center text-black font-medium">Plan and organize your day with ease, ensuring every task is accounted for</p>
        </div>

        {/* Reminder */}
        <div className="w-80 h-96 rounded-lg bg-pastelPink bg-opacity-80 hover:bg-pink-100 transition-shadow shadow-lg flex items-center justify-center flex-col">
          <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mb-4">
            <img src={remindIcon} alt="Add" className="w-14 h-12 opacity-65" />
          </div>
          <p className="text-lg text-center text-black font-bold">Reminders</p>
          <p className="mt-5 mb-5 px-10 text-lg text-center text-black font-medium">Never miss important tasks or deadlines with timely notifications</p>
        </div>

        {/* Diary */}
        <div className="w-80 h-96 rounded-lg bg-pastelPink bg-opacity-80 hover:bg-pink-100 transition-shadow shadow-lg flex items-center justify-center flex-col">
          <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mb-5">
            <img src={diaryIcon} alt="Add" className="w-14 h-12 opacity-70" />
          </div>
          <p className="text-lg text-center text-black font-bold">Diary Keeping</p>
          <p className="mt-5 mb-5 px-10 text-lg text-center text-black font-medium">Keep your thoughts, ideas, and memories in one secure, easy-to-access place</p>
        </div>
      </div>

      <div className="relative pt-0 pb-0 flex items-center justify-center min-h-screen">

        {/* Wrapper now spans the full screen width */}
        <div className="bg-transparent p-40 pt-0 pb-0 flex flex-wrap md:flex-nowrap w-full">

          {/* Definition for Page na ICON */}
          <div className="w-full md:w-1/2 pr-32 flex justify-center items-center">
            <div className="w-90 h-80 flex items-center justify-center">
              <img src={pageImage} alt="page" />
            </div>
          </div>

          {/* Page na ICON part */}
          <div className="pl-0 w-full md:w-1/2 text-center md:text-end mb-6 md:mb-0">
            <h1 className="text-2xl sm:text-7xl font-bold text-black">
              Your ultimate <span className="text-[#FFB78B]">tool</span> for staying <br /><span>organized</span>
            </h1>
            <p className="text-sm sm:text-3xl text-black mt-10">
              Lifely helps you manage tasks, set reminders, and keep track of your plans-all in one simple,  user-friendly platform designed to make your life easier and more productive.
            </p>
          </div>          

        </div>
      </div>

      <div className="bg-white p-2 pt-0 rounded-lg flex flex-wrap md:flex-nowrap w-full">
       {/* FOOTER PART */}
  <div className="flex flex-col lg:flex-row justify-between items-start py-6 pb-0 h-auto">
    {/* LOGO */}
    <div className="flex flex-col items-start pl-2">
      <div className="w-12 h-10 flex items-center justify-center ml-5 mb-2">
        <img src={lifelyLogo} alt="" />
      </div>

      {/* INTERESTED */}
      <p className="text-sm sm:text-3xl font-bold ml-5">Interested in Learning More?</p>
      <div>
        <h2 className="text-2xl sm:text-7xl font-bold ml-4">CONNECT WITH US</h2>
      </div>
    </div>

       {/* CONTACTS */}
    <div className="flex flex-col items-center ml-96">
      <h2 className="text-lg font-bold mt-14">CONTACTS</h2>
      <div className="mt-3 space-y-2">
        <div className="flex items-center space-x-2">
          <div className="w-7 h-7 flex items-center justify-center ml-6">
            <img src={phoneIcon} alt="phone" />
          </div>
          <span>09123457689</span>
        </div>

        <div className="flex items-center space-x-2">
          <div className="w-5 h-5 flex items-center justify-center ml-7">
            <img src={emailIcon} alt="email" />
          </div>
          <span>lifely@gmail.com</span>
        </div>

    <div className="flex items-center space-x-2">
      <div className="w-5 h-5 flex items-center justify-center ml-7">
        <img src={twitterIcon} alt="twitter" />
      </div>
      <span>@lifely_official</span>
    </div>
  </div>
</div>


       {/* ABOUT US */}
       <div className="text-sm max-w-xs text-center lg:text-left ml-80 mr-10">
        <div className="text-lg font-bold mb-2 mt-14">ABOUT US</div>
        <span className="text-base text-justify">
           Welcome to Lifely, your all-in-one companion for staying organized, productive, and mindful. 
        </span>
        </div>
        </div>
      </div>
      
      <div className="bg-white pt-0 rounded-lg w-full"
      style={{
       backgroundImage: `url(${bgImage})`,
      }}>

   {/* LINE AT COPYRIGHT */}
      <div >
        <p className="text-center font-bold text-sm pb-3 pt-4">&copy; 2024 Lifely.</p>
      </div>
    </div>

  </div>
  );
};

export default Landing;