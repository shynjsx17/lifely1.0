import { useState, useEffect } from 'react';
import Sidebar from '../Navigation/Sidebar';

const MyDiary = () => {
  const [code, setCode] = useState('');
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderlined, setIsUnderlined] = useState(false);
  const [mood, setMood] = useState('neutral'); // State for tracking mood
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false); // Sidebar state

  // Load saved content and toggle states from localStorage
  useEffect(() => {
    const savedCode = localStorage.getItem('code');
    const savedBold = localStorage.getItem('isBold') === 'true';
    const savedItalic = localStorage.getItem('isItalic') === 'true';
    const savedUnderlined = localStorage.getItem('isUnderlined') === 'true';

    if (savedCode) {
      setCode(savedCode);
    }

    setIsBold(savedBold);
    setIsItalic(savedItalic);
    setIsUnderlined(savedUnderlined);
  }, []);

  // Sync content changes with the state
  const handleChange = (event) => {
    setCode(event.target.value);
    localStorage.setItem('code', event.target.value);
  };

  // Toggle bold style
  const toggleBold = () => {
    setIsBold(!isBold);
    localStorage.setItem('isBold', !isBold);
  };

  // Toggle italic style
  const toggleItalic = () => {
    setIsItalic(!isItalic);
    localStorage.setItem('isItalic', !isItalic);
  };

  // Toggle underline style
  const toggleUnderline = () => {
    setIsUnderlined(!isUnderlined);
    localStorage.setItem('isUnderlined', !isUnderlined);
  };

  // Combine styles for text area
  const textStyle = {
    fontWeight: isBold ? 'bold' : 'normal',
    fontStyle: isItalic ? 'italic' : 'normal',
    textDecoration: isUnderlined ? 'underline' : 'none',
  };

  // Get today's date
  const today = new Date().toLocaleDateString();

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <Sidebar isCollapsed={isSidebarCollapsed} setIsCollapsed={setIsSidebarCollapsed} />

      {/* Main Content */}
      <div
        className={`flex-1 p-6 bg-system-background bg-cover bg-center transition-all duration-300 ${
          isSidebarCollapsed ? 'ml-[60px]' : 'ml-[200px]'
        } flex flex-col justify-center font-poppins`}
      >
        {/* "My Diary" Header */}
        <h1 className="text-3xl font-extrabold tracking-tight mb-2">Good Day,</h1>
        <h1 className="text-xl font-bold tracking-tight mb-4" style={{ color: '#FFB78B' }}>
          Something troubling you? Write it down.
        </h1>

        {/* Wrapper for Text Area */}
        <div className="w-full max-w-7xl mx-auto h-4/5 bg-white p-6 rounded-xl shadow-lg bg-opacity-90 relative">
          {/* Why I'm writing Header */}
          <h1 className="text-gray-500 text-2xl tracking-tight">Why I'm Writing...</h1>

          {/* Calendar with Current Date */}
          <div className="flex items-center mt-4 mb-4">
            <img src={require('../icons/calendar.svg').default} alt="Calendar Icon" className="w-6 h-6 mr-2" />
            <span className="text-sm">{today}</span>
          </div>

          {/* Text Area */}
          <textarea
            value={code}
            onChange={handleChange}
            placeholder="Write your thoughts here..."
            className="w-full h-80 p-4 border rounded bg-white bg-opacity-90"
            style={textStyle}
          />

          {/* Bold, Italic, and Underline Buttons */}
          <div className="absolute mb-10 left-4 flex space-x-4">
            <button onClick={toggleBold} className="px-4 py-2 bg-transparent border-none">
              <img
                src={require('../icons/bold.svg').default}
                alt="Bold"
                className={`w-6 h-6 ${isBold ? 'opacity-100' : 'opacity-50'}`}
              />
            </button>
            <button onClick={toggleItalic} className="px-4 py-2 bg-transparent border-none">
              <img
                src={require('../icons/Italic.svg').default}
                alt="Italic"
                className={`w-6 h-6 ${isItalic ? 'opacity-100' : 'opacity-50'}`}
              />
            </button>
            <button onClick={toggleUnderline} className="px-4 py-2 bg-transparent border-none">
              <img
                src={require('../icons/underline.svg').default}
                alt="Underline"
                className={`w-6 h-6 ${isUnderlined ? 'opacity-100' : 'opacity-50'}`}
              />
            </button>
          </div>

          {/* Mood Tracker Section */}
          <div className="absolute top-4 right-4 space-y-2">
            <h2 className="text-gray-500 text-lg">Mood Tracker:</h2>
            <div className="flex space-x-4">
              {/* Mood Buttons */}
              {['sad', 'angry', 'neutral', 'happy', 'very happy'].map((moodOption) => (
                <button
                  key={moodOption}
                  onClick={() => setMood(moodOption)}
                  className={`px-4 py-2 rounded-full ${mood === moodOption ? 'bg-blue-500 text-white' : 'bg-gray-300'}`}
                >
                  {moodOption.charAt(0).toUpperCase() + moodOption.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyDiary;