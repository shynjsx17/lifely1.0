import React, { useState, useEffect } from 'react';
import Sidebar from "../Navigation/Sidebar";

const MyDiary = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [headerText, setHeaderText] = useState("Why I'm Writing...");
  const [mood, setMood] = useState('neutral');
  const [showPopup, setShowPopup] = useState(false);
  const [viewSavedEntries, setViewSavedEntries] = useState(false); // Track if saved entries are shown
  const [entries, setEntries] = useState([]);
  const [dropdownVisible, setDropdownVisible] = useState(null);

  useEffect(() => {
    const savedEntries = JSON.parse(localStorage.getItem('diaryEntries')) || [];
    setEntries(savedEntries);
  }, []);

  const saveContent = () => {
    const content = document.getElementById('editable-content').innerHTML;
    const newEntry = {
      headerText,
      content,
      mood,
      date: new Date().toLocaleDateString(),
    };

    const savedEntries = JSON.parse(localStorage.getItem('diaryEntries')) || [];
    savedEntries.push(newEntry);
    localStorage.setItem('diaryEntries', JSON.stringify(savedEntries));
    setEntries(savedEntries);

    setShowPopup(true);
  };

  const handleHeaderChange = (event) => {
    setHeaderText(event.target.value);
    localStorage.setItem('headerText', event.target.value);
  };

  const toggleFormat = (command) => {
    document.execCommand(command, false, null);
  };

  const editEntry = (index) => {
    const entryToEdit = entries[index];
    setHeaderText(entryToEdit.headerText);
    document.getElementById('editable-content').innerHTML = entryToEdit.content;
    setDropdownVisible(null);
  };

  const archiveEntry = (index) => {
    const updatedEntries = entries.filter((_, i) => i !== index);
    setEntries(updatedEntries);
    localStorage.setItem('diaryEntries', JSON.stringify(updatedEntries));
    setDropdownVisible(null);
  };

  const today = new Date().toLocaleDateString();

  return (
    <div className="flex min-h-screen">
      <Sidebar />

      <div className="flex-1 p-8 bg-system-background bg-no-repeat bg-fixed">
        <h1 className="text-4xl font-extrabold tracking-tight mb-2 pl-[160px]">Good Day,</h1>
        <h1 className="text-2xl font-bold tracking-tight mb-4 pl-[160px]" style={{ color: '#FFB78B' }}>
          Something troubling you? Write it down.
        </h1>

        {/* Buttons for Viewing and Writing Entries */}
        {!viewSavedEntries && (
          <div className="flex mb-4 pl-[160px] space-x-4">
            <button
              onClick={() => setViewSavedEntries(true)} // Toggle to view saved entries
              className="px-4 py-2 bg-[#FFB78B] text-white rounded-md hover:bg-[#ffa770]"
            >
              View Saved Entries
            </button>
          </div>
        )}

        {/* Conditional Rendering of Content */}
        {viewSavedEntries ? (
          <div className="w-full max-w-7xl mx-auto bg-transparent p-6 rounded-xl bg-opacity-90">
            {entries.length === 0 ? (
              <p className="text-center text-xl">No entries saved yet.</p>
            ) : (
              <div className="space-y-6">
                {entries.map((entry, index) => (
                  <div key={index} className="p-4 border-b relative bg-white shadow-md rounded-xl">
                    <div className="absolute top-2 right-2">
                      <button
                        onClick={() => setDropdownVisible(dropdownVisible === index ? null : index)}
                        className="text-xl"
                      >
                        &#x22EE;
                      </button>
                      {dropdownVisible === index && (
                        <div className="absolute right-0 mt-2 bg-white shadow-lg rounded-md border w-32">
                          <button
                            onClick={() => editEntry(index)}
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => archiveEntry(index)}
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                          >
                            Archive
                          </button>
                          
                        </div>
                      )}
                    </div>

                    <h2 className="text-xl font-bold">{entry.headerText}</h2>
                    <p className="text-gray-500">{entry.date}</p>
                    <div className="mt-2" dangerouslySetInnerHTML={{ __html: entry.content }} />
                    
                    <div className="mt-2">
                      <span
                        className={`px-4 py-2 rounded-full ${
                          entry.mood === 'sad'
                            ? 'bg-[#FFB6A6]' // Light Pink
                            : entry.mood === 'angry'
                            ? 'bg-[#FFCF55]' // Yellow
                            : entry.mood === 'neutral'
                            ? 'bg-[#FFF731]' // Bright Yellow
                            : entry.mood === 'happy'
                            ? 'bg-[#00FFFF]' // Cyan
                            : entry.mood === 'very happy'
                            ? 'bg-[#29E259]' // Green
                            : 'bg-gray-300'
                        } text-white`}
                      >
                        {entry.mood.charAt(0).toUpperCase() + entry.mood.slice(1)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className="flex justify-center mt-4">
              <button
                onClick={() => setViewSavedEntries(false)} // Toggle back to write new entry
                className="px-10 py-3 w-full max-w-7xl bg-white text-gray-400 shadow-lg rounded-xl hover:bg-gray-300 flex justify-between items-center"
              >
                <span>Add Entry</span>
                <div className="px-6 py-2 rounded-xl bg-[#FFB78B] text-black">Add</div>
              </button>
            </div>
          </div>
        ) : (
          <div className="w-full max-w-7xl mx-auto h-4/5 bg-white p-6 rounded-xl shadow-lg bg-opacity-90 relative">
            <input
              value={headerText}
              onChange={handleHeaderChange}
              onFocus={() => {
                if (headerText === "Why I'm Writing...") {
                  setHeaderText('');
                }
              }}
              onBlur={() => {
                if (headerText.trim() === '') {
                  setHeaderText("Why I'm Writing...");
                }
              }}
              className="text-gray-500 text-2xl tracking-tight w-72 mb-4 border-b focus:outline-none"
            />

            <div className="flex items-center mt-4 mb-4">
              <img src={require("../icons/calendar.svg").default} alt="Calendar Icon" className="w-6 h-6 mr-2" />
              <span className="text-sm">{today}</span>
            </div>

            <div
              id="editable-content"
              contentEditable
              className="w-full h-4/5 p-4 border rounded bg-white bg-opacity-90 overflow-y-auto focus:outline-none"
            />

            <div className="mt-2 bottom-4 left-4 flex w-full items-center">
              <div className="flex space-x-4">
                <button onClick={() => toggleFormat('bold')} className="px-4 py-2 bg-transparent border-none">
                  <img src={require("../icons/bold.svg").default} alt="Bold" className="w-6 h-6" />
                </button>
                <button onClick={() => toggleFormat('italic')} className="px-4 py-2 bg-transparent border-none">
                  <img src={require("../icons/Italic.svg").default} alt="Italic" className="w-6 h-6" />
                </button>
                <button onClick={() => toggleFormat('underline')} className="px-4 py-2 bg-transparent border-none">
                  <img src={require("../icons/underline.svg").default} alt="Underline" className="w-6 h-6" />
                </button>
              </div>
              <button
                onClick={saveContent}
                className="ml-auto px-4 py-2 mr-10 bg-[#FFB78B] text-white rounded-md hover:bg-[#ffa770]"
              >
                Save
              </button>
            </div>

            <div className="absolute top-4 right-4 space-y-2">
            <h2 className="text-gray-500 text-lg">Mood Tracker:</h2>
            <div className="flex space-x-4">
              {['sad', 'angry', 'neutral', 'happy', 'very happy'].map((moodOption) => {
                let moodColor;
          
                // Assigning specific colors for each mood option
                switch (moodOption) {
                  case 'sad':
                    moodColor = 'bg-[#FFB6A6]'; // Light Pink
                    break;
                  case 'angry':
                    moodColor = 'bg-[#FFCF55]'; // Yellow
                    break;
                  case 'neutral':
                    moodColor = 'bg-[#FFF731]'; // Bright Yellow
                    break;
                  case 'happy':
                    moodColor = 'bg-[#00FFFF]'; // Cyan
                    break;
                  case 'very happy':
                    moodColor = 'bg-[#29E259]'; // Green
                    break;
                  default:
                    moodColor = 'bg-gray-300'; // Default gray
                }

                return (
                  <button
                    key={moodOption}
                    onClick={() => {
                      setMood(moodOption);
                      localStorage.setItem('mood', moodOption);
                    }}
                    className={`px-4 py-2 rounded-full ${mood === moodOption ? 'text-white' : 'text-black'} ${moodColor}`}
                  >
                    {moodOption.charAt(0).toUpperCase() + moodOption.slice(1)}
                  </button>
                );
              })}
            </div>
          </div>

          </div>
        )}
      </div>

      {showPopup && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-10 w-2/6 rounded-lg shadow-lg text-center">
            <h2 className="text-2xl font-bold mb-4">ENTRY SAVED!</h2>
            <p className="text-black font-medium italic mb-6">
              Your memory is safe and sound. Someday, you’ll look back<br />on this moment and smile—trust the journey.
            </p>
            <div className="flex justify-center space-x-4">
              <button
                onClick={() => {
                  document.getElementById('editable-content').innerHTML = '';
                  setHeaderText("Why I'm Writing...");
                  setShowPopup(false);
                }}
                className="px-4 py-2 bg-[#FFB78B] text-white rounded-md hover:bg-[#ffa770]"
              >
                + New Entry
              </button>
              <button
                onClick={() => setShowPopup(false)}
                className="px-4 py-2 bg-[#FF8585] text-white rounded-md hover:bg-[#ff5f5f]}"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyDiary;