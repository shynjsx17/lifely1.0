import React, { useState } from 'react';
import dayjs from 'dayjs';
import Sidebar from '../Navigation/Sidebar';
import backgroundImage from '../Images/BG.png';
import { FaBars, FaSearch, FaCog, FaQuestionCircle, FaCalendarAlt, FaChevronLeft, FaChevronRight } from 'react-icons/fa';

const generateDate = (month = dayjs().month(), year = dayjs().year()) => {
  const firstDateOfMonth = dayjs().year(year).month(month).startOf('month');
  const lastDateOfMonth = dayjs().year(year).month(month).endOf('month');

  const arrayOfDate = [];

  // Create prefix dates
  for (let i = 0; i < firstDateOfMonth.day(); i++) {
    const date = firstDateOfMonth.day(i);
    arrayOfDate.push({
      currentMonth: false,
      date,
    });
  }

  // Generate current dates
  for (let i = firstDateOfMonth.date(); i <= lastDateOfMonth.date(); i++) {
    arrayOfDate.push({
      currentMonth: true,
      date: firstDateOfMonth.date(i),
      today:
        firstDateOfMonth.date(i).toDate().toDateString() ===
        dayjs().toDate().toDateString(),
    });
  }

  // Fill remaining dates
  const remaining = 42 - arrayOfDate.length;
  for (
    let i = lastDateOfMonth.date() + 1;
    i <= lastDateOfMonth.date() + remaining;
    i++
  ) {
    arrayOfDate.push({
      currentMonth: false,
      date: lastDateOfMonth.date(i),
    });
  }

  return arrayOfDate;
};

const months = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const MyCalendar = () => {
  const [currentMonth, setCurrentMonth] = useState(dayjs().month());
  const [currentYear, setCurrentYear] = useState(dayjs().year());
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const dates = generateDate(currentMonth, currentYear);

  const goToPreviousMonth = () => {
    const newMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const newYear = currentMonth === 0 ? currentYear - 1 : currentYear;
    setCurrentMonth(newMonth);
    setCurrentYear(newYear);
  };

  const goToNextMonth = () => {
    const newMonth = currentMonth === 11 ? 0 : currentMonth + 1;
    const newYear = currentMonth === 11 ? currentYear + 1 : currentYear;
    setCurrentMonth(newMonth);
    setCurrentYear(newYear);
  };

  const goToToday = () => {
    const today = dayjs();
    setCurrentMonth(today.month());
    setCurrentYear(today.year());
    setSelectedDate(today);
  };

  const handleDateClick = (date) => {
    setSelectedDate(date.date);
  };

  return (
    <div className="flex h-screen flex-col">
      <Sidebar
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
      />
      <div 
        className={`flex-1 transition-all duration-300 ${
          isSidebarCollapsed ? "ml-[60px]" : "ml-[240px]"
        }`}
      >
        {/* Navbar */}
        <div className="flex-none w-full bg-white bg-opacity-70 z-10 shadow-md fixed top-0">
          <div className="flex items-center p-4 justify-between">
            {/* Left Side */}
            <div className="flex items-center">
              {/* Hamburger Menu */}
              <button className="w-6 h-6 mr-2 flex justify-center items-center">
                <FaBars className="w-5 h-5 text-gray-600" />
              </button>            

              {/* Calendar Icon */}
              <FaCalendarAlt className="w-6 h-6 text-gray-600 mr-2" />

              {/* Title */}
              <h1 className="text-xl font-semibold">My Calendar</h1>

              {/* Today Button */}
              <button
                onClick={goToToday}
                className="px-4 py-2 text-black bg-white border border-black rounded-md hover:bg-gray-100 ml-4"
              >
                Today
              </button>

              {/* Month Navigation */}
              <div className="flex items-center ml-4">
                <button
                  onClick={goToPreviousMonth}
                  className="p-2 text-gray-600 hover:bg-gray-200 rounded-full"
                >
                  <FaChevronLeft className="w-4 h-4" />
                </button>
                
                <h2 className="text-lg font-semibold mx-4">
                  {`${months[currentMonth]} ${currentYear}`}
                </h2>
                
                <button
                  onClick={goToNextMonth}
                  className="p-2 text-gray-600 hover:bg-gray-200 rounded-full"
                >
                  <FaChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Right Side Icons */}
            <div className="flex items-center gap-4">
              <button className="p-2 hover:bg-gray-200 rounded-full">
                <FaSearch className="w-5 h-5 text-gray-600" />
              </button>
              <button className="p-2 hover:bg-gray-200 rounded-full">
                <FaQuestionCircle className="w-5 h-5 text-gray-600" />
              </button>
              <button className="p-2 hover:bg-gray-200 rounded-full">
                <FaCog className="w-5 h-5 text-gray-600" />
              </button>

              {/* Month and Year Picker */}
              <div className="flex items-center gap-2">
                <select 
                  value={currentMonth} 
                  onChange={(e) => setCurrentMonth(parseInt(e.target.value))} 
                  className="bg-white border border-gray-300 rounded-md p-1">
                  {months.map((month, index) => (
                    <option key={index} value={index}>
                      {month}
                    </option>
                  ))}
                </select>

                <select 
                  value={currentYear} 
                  onChange={(e) => setCurrentYear(parseInt(e.target.value))} 
                  className="bg-white border border-gray-300 rounded-md p-1">
                  {Array.from({ length: 50 }, (_, i) => currentYear - 20 + i).map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div 
          className="flex-1 pt-[64px] bg-cover bg-center flex" 
          style={{ backgroundImage: backgroundImage ? `url(${backgroundImage})` : 'none' }}
        >
         

          {/* Right Section: Calendar */}
          <div className="flex-1 p-6">
            <div className="grid grid-cols-7 gap-2 mt-4">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                <div key={day} className="text-center font-bold text-sm sm:text-base">
                  {day}
                </div>
              ))}
              {dates.map((dateObj, index) => (
                <div
                  key={index}
                  className={`p-12 text-center ${dateObj.currentMonth ? 'text-black' : 'text-gray-400'} ${dateObj.today ? 'bg-sky-500 text-white' : ''} ${selectedDate.isSame(dateObj.date, 'day') ? 'bg-emerald-600 text-white' : ''} border-r-2 border-b-2 hover:bg-gray-200 cursor-pointer`}
                  onClick={() => handleDateClick(dateObj)}
                >
                  <span className="font-semibold">{dateObj.date.date()}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyCalendar;
