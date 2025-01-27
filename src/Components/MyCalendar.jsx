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
        {/* Compressed Navbar */}
        <div className="flex-none w-full bg-white bg-opacity-70 z-10 shadow-md fixed top-0">
          <div className="flex items-center p-2">
            {/* All elements aligned to the left */}
            <div className="flex items-center space-x-4">
              {/* Menu and Calendar Icons */}
              <div className="flex items-center space-x-2">
                <button className="p-1">
                  <FaBars className="w-4 h-4 text-gray-600" />
                </button>            
                <FaCalendarAlt className="w-4 h-4 text-gray-600" />
                <h1 className="text-lg font-semibold">My Calendar</h1>
              </div>

              {/* Today Button and Navigation */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={goToToday}
                  className="px-3 py-1 text-sm text-black bg-white border border-black rounded-md hover:bg-gray-100"
                >
                  Today
                </button>
                <button
                  onClick={goToPreviousMonth}
                  className="p-1 text-gray-600 hover:bg-gray-200 rounded-full"
                >
                  <FaChevronLeft className="w-3 h-3" />
                </button>
                <h2 className="text-sm font-medium">
                  {`${months[currentMonth]} ${currentYear}`}
                </h2>
                <button
                  onClick={goToNextMonth}
                  className="p-1 text-gray-600 hover:bg-gray-200 rounded-full"
                >
                  <FaChevronRight className="w-3 h-3" />
                </button>
              </div>

              {/* Search Icon */}
              <div className="flex items-center space-x-2 border-l border-r px-4">
                <button className="p-1 hover:bg-gray-200 rounded-full">
                  <FaSearch className="w-4 h-4 text-gray-600" />
                </button>
              </div>

              {/* Month and Year Selectors */}
              <div className="flex items-center space-x-2">
                <select 
                  value={currentMonth} 
                  onChange={(e) => setCurrentMonth(parseInt(e.target.value))} 
                  className="text-sm bg-white border border-gray-300 rounded-md p-1"
                >
                  {months.map((month, index) => (
                    <option key={index} value={index}>{month}</option>
                  ))}
                </select>
                <select 
                  value={currentYear} 
                  onChange={(e) => setCurrentYear(parseInt(e.target.value))} 
                  className="text-sm bg-white border border-gray-300 rounded-md p-1"
                >
                  {Array.from({ length: 50 }, (_, i) => currentYear - 20 + i).map((year) => (
                    <option key={year} value={year}>{year}</option>
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
