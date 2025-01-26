import React, { useState, useEffect } from 'react';
import Sidebar from "../Navigation/Sidebar";
import { useAuth } from '../context/AuthContext';

const MyDiary = () => {
  const { user } = useAuth();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [headerText, setHeaderText] = useState("Why I'm Writing...");
  const [mood, setMood] = useState('neutral');
  const [showPopup, setShowPopup] = useState(false);
  const [viewSavedEntries, setViewSavedEntries] = useState(false);
  const [entries, setEntries] = useState([]);
  const [dropdownVisible, setDropdownVisible] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Fetch diary entries from database
  const fetchEntries = async () => {
    try {
      console.log('Fetching diary entries...'); // Debug log
      const token = sessionStorage.getItem('session_token');
      console.log('Using token:', token); // Debug log

      const response = await fetch('http://localhost/lifely1.0/backend/api/diary.php', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Response status:', response.status); // Debug log
      const data = await response.json();
      console.log('Full API response:', data); // Debug log

      if (data.status === 'success' && data.data && Array.isArray(data.data.entries)) {
        // Filter out archived entries
        const nonArchivedEntries = data.data.entries.filter(entry => !entry.is_archived);
        console.log('Non-archived entries:', nonArchivedEntries); // Debug log
        setEntries(nonArchivedEntries);
      } else {
        console.error('Invalid response format or no entries:', data);
        setEntries([]);
      }
    } catch (error) {
      console.error('Error fetching diary entries:', error);
      setEntries([]);
    }
  };

  useEffect(() => {
    if (viewSavedEntries) {
      fetchEntries();
    }
  }, [currentPage, viewSavedEntries]);

  const saveContent = async () => {
    const content = document.getElementById('editable-content').innerHTML;
    const newEntry = {
      title: headerText,
      content: content,
      mood: mood
    };

    try {
      const response = await fetch('http://localhost/lifely1.0/backend/api/diary.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionStorage.getItem('session_token')}`
        },
        body: JSON.stringify(newEntry)
      });

      const data = await response.json();
      if (data.status === 'success') {
        // Clear the content
        document.getElementById('editable-content').innerHTML = '';
        setHeaderText("Why I'm Writing...");
        setMood('neutral');
        
        // Show success modal instead of popup
        setShowSuccessModal(true);
        
        // Fetch updated entries if viewing saved entries
        if (viewSavedEntries) {
          fetchEntries();
        }
      } else {
        console.error('Error saving entry:', data.message);
      }
    } catch (error) {
      console.error('Error saving entry:', error);
    }
  };

  const editEntry = async (entryId) => {
    try {
      const response = await fetch('http://localhost/lifely1.0/backend/api/diary.php', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionStorage.getItem('session_token')}`
        },
        body: JSON.stringify({
          id: entryId,
          title: headerText,
          content: document.getElementById('editable-content').innerHTML,
          mood: mood
        })
      });

      const data = await response.json();
      if (data.status === 'success') {
        fetchEntries();
        setDropdownVisible(null);
      } else {
        console.error('Error updating entry:', data.message);
      }
    } catch (error) {
      console.error('Error updating entry:', error);
    }
  };

  const archiveEntry = async (entryId) => {
    try {
      const response = await fetch('http://localhost/lifely1.0/backend/api/diary.php', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionStorage.getItem('session_token')}`
        },
        body: JSON.stringify({
          id: entryId,
          is_archived: true
        })
      });

      const data = await response.json();
      if (data.status === 'success') {
        // Immediately remove the archived entry from the local state
        setEntries(prevEntries => prevEntries.filter(entry => entry.id !== entryId));
        setDropdownVisible(null);
      } else {
        console.error('Error archiving entry:', data.message);
      }
    } catch (error) {
      console.error('Error archiving entry:', error);
    }
  };

  const handleArchiveDiary = async (entryId) => {
    try {
      const response = await fetch(`http://localhost/lifely1.0/backend/api/diary.php?id=${entryId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionStorage.getItem('session_token')}`
        },
        body: JSON.stringify({
          is_archived: true
        })
      });

      if (response.ok) {
        fetchEntries();
      }
    } catch (error) {
      console.error('Error archiving diary entry:', error);
    }
  };

  const today = new Date().toLocaleDateString();

  return (
    <div className="flex min-h-screen bg-system-background">
      <Sidebar 
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
      />
      <div className={`flex-1 transition-all duration-300 ${
        isSidebarCollapsed ? "ml-[60px]" : "ml-[240px]"
      } p-8 bg-system-background font-poppins`}>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Good Day, {user?.userName || 'User'}!</h1>
        <h1 className="text-xl font-bold tracking-tight mb-4" style={{ color: '#FFB78B' }}>
          Something troubling you? Write it down.
        </h1>

        {/* Success Popup */}
        {showPopup && (
          <div className="fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded shadow-lg">
            Entry saved successfully!
          </div>
        )}

        {/* View Entries Button */}
        <div className="flex mb-4 space-x-4">
          <button
            onClick={() => setViewSavedEntries(!viewSavedEntries)}
            className="px-4 py-2 bg-[#FFB78B] text-white rounded-md hover:bg-[#ffa770]"
          >
            {viewSavedEntries ? 'Write New Entry' : 'View Saved Entries'}
          </button>
        </div>

        {/* Writing Area */}
        {!viewSavedEntries && (
          <div className="w-full max-w-7xl mx-auto bg-white p-6 rounded-xl shadow-lg relative">
            {/* Title Input */}
            <input
              value={headerText}
              onChange={(e) => setHeaderText(e.target.value)}
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

            {/* Date Display */}
            <div className="flex items-center mt-4 mb-4">
              <img src={require("../icons/calendar.svg").default} alt="Calendar Icon" className="w-6 h-6 mr-2" />
              <span className="text-sm">{today}</span>
            </div>

            {/* Text Editor Area */}
            <div className="relative">
              <div
                id="editable-content"
                contentEditable
                className="w-full min-h-[400px] p-4 border rounded bg-white bg-opacity-90 overflow-y-auto focus:outline-none mb-16"
              />

              /* Formatting Tools - Fixed at bottom */}
                      <div className="absolute bottom-0 left-0 right-0 bg-white p-4 border-t flex justify-between items-center">
                      <div className="flex space-x-4">
                        <button onClick={() => document.execCommand('bold')} className="p-2 hover:bg-gray-100 rounded">
                        <img src={require("../icons/bold.svg").default} alt="Bold" className="w-6 h-6" />
                        </button>
                        <button onClick={() => document.execCommand('italic')} className="p-2 hover:bg-gray-100 rounded">
                        <img src={require("../icons/Italic.svg").default} alt="Italic" className="w-6 h-6" />
                        </button>
                        <button onClick={() => document.execCommand('underline')} className="p-2 hover:bg-gray-100 rounded">
                        <img src={require("../icons/underline.svg").default} alt="Underline" className="w-6 h-6" />
                        </button>
                      </div>
                      <button
                        onClick={saveContent}
                        className="px-6 py-2 bg-[#FFB78B] text-white rounded-md hover:bg-[#ffa770]"
                      >
                        Save
                      </button>
                      </div>
                    </div>

                    {/* Mood Tracker */}
                    <div className="absolute top-4 right-4">
                      <h2 className="text-gray-500 text-lg mb-2">Mood Tracker:</h2>
                      <div className="flex space-x-2">
                      {['sad', 'angry', 'neutral', 'happy', 'very happy'].map((moodOption) => {
                        const moodColors = {
                        'sad': 'bg-[#FFB6A6]',
                        'angry': 'bg-[#FFCF55]',
                        'neutral': 'bg-[#FFF731]',
                        'happy': 'bg-[#00FFFF]',
                        'very happy': 'bg-[#29E259]'
                        };

                        return (
                        <button
                          key={moodOption}
                          onClick={() => setMood(moodOption)}
                          className={`px-4 py-2 rounded-full ${mood === moodOption ? 'text-white' : 'text-black'} ${moodColors[moodOption]}`}
                        >
                          {moodOption.charAt(0).toUpperCase() + moodOption.slice(1)}
                        </button>
                        );
                      })}
                      </div>
                    </div>
                    </div>
                  ) }

                  {/* View Saved Entries */}
        {viewSavedEntries && (
          <div className="w-full max-w-7xl mx-auto space-y-6">
            {entries.length === 0 ? (
              <p className="text-center text-xl">No entries saved yet.</p>
            ) : (
              <>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {entries.map((entry) => (
                    <div key={entry.id} className="bg-white p-6 rounded-xl shadow-lg relative">
                      <div className="absolute top-4 right-4">
                        <button
                          onClick={() => setDropdownVisible(dropdownVisible === entry.id ? null : entry.id)}
                          className="text-xl hover:bg-gray-100 rounded-full w-8 h-8 flex items-center justify-center"
                        >
                          &#x22EE;
                        </button>
                        {dropdownVisible === entry.id && (
                          <div className="absolute right-0 mt-2 bg-white shadow-lg rounded-md border w-32 z-10">
                            <button
                              onClick={() => editEntry(entry.id)}
                              className="block w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 text-left"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => archiveEntry(entry.id)}
                              className="block w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 text-left"
                            >
                              Archive
                            </button>
                          </div>
                        )}
                      </div>
                      <h3 className="text-xl font-semibold mb-2">{entry.title}</h3>
                      <div className="text-sm text-gray-500 mb-2">
                        {new Date(entry.date).toLocaleDateString()}
                      </div>
                      <div className="text-sm mb-2">
                        Mood: <span className="capitalize">{entry.mood}</span>
                      </div>
                      <div 
                        className="prose max-w-none"
                        dangerouslySetInnerHTML={{ __html: entry.content }}
                      />
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center space-x-2 mt-6">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      className="px-4 py-2 bg-[#FFB78B] text-white rounded-md hover:bg-[#ffa770] disabled:opacity-50"
                    >
                      Previous
                    </button>
                    <span className="px-4 py-2">
                      Page {currentPage} of {totalPages}
                    </span>
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                      className="px-4 py-2 bg-[#FFB78B] text-white rounded-md hover:bg-[#ffa770] disabled:opacity-50"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {showSuccessModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 max-w-sm w-full mx-4 text-center">
              <div className="mb-4">
                <img src={require("../icons/diary.svg").default} alt="Diary" className="w-16 h-16 mx-auto mb-4" />
                <h2 className="text-2xl font-bold mb-2">ENTRY SAVED!</h2>
                <p className="text-gray-600 italic">
                  "Your memory is safe and sound. Someday, you'll look back on this moment and smile—trust the journey."
                </p>
              </div>
              <div className="flex justify-center space-x-4">
                <button
                  onClick={() => {
                    setShowSuccessModal(false);
                    setViewSavedEntries(false);
                  }}
                  className="px-4 py-2 bg-[#FFB78B] text-white rounded-md hover:bg-[#ffa770]"
                >
                  + New Entry
                </button>
                <button
                  onClick={() => {
                    setShowSuccessModal(false);
                    setViewSavedEntries(true);
                  }}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyDiary;
