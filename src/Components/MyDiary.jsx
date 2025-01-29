import React, { useState, useEffect } from 'react';
import Sidebar from "../Navigation/Sidebar";
import { useAuth } from '../context/AuthContext';
import EmojiPicker from 'emoji-picker-react';

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
  const [viewingEntry, setViewingEntry] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedEntry, setEditedEntry] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchError, setSearchError] = useState("");
  const WORD_LIMIT = 1000;
  const [wordCount, setWordCount] = useState(0);
  const [editWordCount, setEditWordCount] = useState(0);
  const [editContentError, setEditContentError] = useState('');
  const [titleError, setTitleError] = useState('');
  const [contentError, setContentError] = useState('');
  const TITLE_CHAR_LIMIT = 50; // You can adjust this number as needed
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

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

  const countWords = (text) => {
    const strippedText = text.replace(/<[^>]*>/g, ''); // Remove HTML tags
    return strippedText.trim().split(/\s+/).filter(word => word.length > 0).length;
  };

  const handleContentChange = (e) => {
    const content = e.target.innerHTML;
    const words = countWords(content);
    setWordCount(words);

    if (words > WORD_LIMIT) {
      setContentError(`Content cannot exceed ${WORD_LIMIT} words`);
      return false;
    }
    
    setContentError('');
    return true;
  };

  const saveContent = async () => {
    // Reset error states
    setTitleError('');
    setContentError('');
    
    // Validate title
    if (!headerText || headerText === "Why I'm Writing...") {
      setTitleError('Please enter a title for your diary entry');
      return;
    }

    // Validate content
    const contentElement = document.getElementById('editable-content');
    const content = contentElement.innerHTML;
    if (!content || content.trim() === '') {
      setContentError('Please write something in your diary entry');
      return;
    }

    // Check word count
    if (!handleContentChange({ target: contentElement })) {
      return;
    }

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
        contentElement.innerHTML = '';
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
    // Reset error states
    setTitleError('');
    setContentError('');

    // Validate title
    if (!editedEntry.title || editedEntry.title.trim() === '') {
      setTitleError('Please enter a title for your diary entry');
      return;
    }

    // Validate content
    if (!editedEntry.content || editedEntry.content.trim() === '') {
      setContentError('Please write something in your diary entry');
      return;
    }

    try {
      const response = await fetch('http://localhost/lifely1.0/backend/api/diary.php', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionStorage.getItem('session_token')}`
        },
        body: JSON.stringify({
          id: entryId,
          title: editedEntry.title,
          content: editedEntry.content,
          mood: editedEntry.mood
        })
      });

      const data = await response.json();
      if (data.status === 'success') {
        fetchEntries();
        setShowSuccessModal(true);
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

  const openEntryView = (entry, e) => {
    e.stopPropagation();
    setViewingEntry(entry);
    setDropdownVisible(null);
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    
    if (value === "") {
      setSearchQuery("");
      setSearchError("");
      return;
    }
    
    if (value.length < 2) {
      setSearchError("Search must be at least 2 characters");
    } else if (value.length > 50) {
      setSearchError("Search cannot exceed 50 characters");
      return;
    } else {
      setSearchError("");
    }
    
    setSearchQuery(value);
  };

  const getFilteredEntries = () => {
    if (searchQuery.trim().length < 2) {
      return entries;
    }

    const query = searchQuery.toLowerCase();
    return entries.filter(entry => 
      entry.title.toLowerCase().includes(query) ||
      entry.content.toLowerCase().includes(query) ||
      entry.mood.toLowerCase().includes(query)
    );
  };

  const handleEditContentChange = (e) => {
    const content = e.target.innerHTML;
    const words = countWords(content);
    setEditWordCount(words);

    if (words > WORD_LIMIT) {
      setEditContentError(`Content cannot exceed ${WORD_LIMIT} words`);
      return false;
    }

    // Update content without trying to preserve cursor position
    setEditContentError('');
    setEditedEntry(prev => ({
      ...prev,
      content: content
    }));
    return true;
  };

  const onEmojiClick = (emojiObject) => {
    const editor = document.getElementById('editable-content');
    if (!editor) return;

    try {
      // Get current selection
      const selection = window.getSelection();
      let range;

      // If there's no selection, create one at the end
      if (selection.rangeCount === 0) {
        range = document.createRange();
        range.selectNodeContents(editor);
        range.collapse(false);
        selection.removeAllRanges();
        selection.addRange(range);
      } else {
        range = selection.getRangeAt(0);
      }

      // Create and insert the emoji
      const emojiText = document.createTextNode(emojiObject.emoji);
      range.insertNode(emojiText);
      
      // Move cursor after emoji
      range.setStartAfter(emojiText);
      range.setEndAfter(emojiText);
      selection.removeAllRanges();
      selection.addRange(range);

      // Update content
      editor.focus();
      const event = new Event('input', { bubbles: true });
      editor.dispatchEvent(event);
      handleContentChange({ target: editor });
    } catch (error) {
      console.error('Error inserting emoji:', error);
    }
  };

  return (
    <div className="flex min-h-screen bg-system-background">
      <Sidebar 
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
      />
      <div className={`flex-1 transition-all duration-300 ${
        isSidebarCollapsed ? "ml-[60px]" : "ml-[240px]"
      } p-4 md:p-8 bg-system-background font-poppins`}>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight mb-2">Good Day, {user?.username || 'User'}!</h1>
        <h1 className="text-lg md:text-xl font-bold tracking-tight mb-4" style={{ color: '#FFB78B' }}>
          Something troubling you? Write it down.
        </h1>

        {/* Success Popup */}
        {showPopup && (
          <div className="fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded shadow-lg">
            Entry saved successfully!
          </div>
        )}

        {/* View Entries Button */}
        <div className="flex mb-4 space-x-4 flex-wrap gap-2">
          <button
            onClick={() => setViewSavedEntries(!viewSavedEntries)}
            className="w-full sm:w-auto px-4 py-2 bg-[#FFB78B] text-white rounded-md hover:bg-[#ffa770]"
          >
            {viewSavedEntries ? 'Write New Entry' : 'View Saved Entries'}
          </button>
        </div>

        {/* Writing Area */}
        {!viewSavedEntries && (
          <div className="w-full max-w-7xl mx-auto bg-white p-4 md:p-6 rounded-xl shadow-lg relative">
            <input
              type="text"
              value={headerText}
              onChange={(e) => {
                const newValue = e.target.value;
                if (newValue.length <= TITLE_CHAR_LIMIT) {
                  setHeaderText(newValue);
                  setTitleError('');
                } else {
                  setTitleError(`Title cannot exceed ${TITLE_CHAR_LIMIT} characters`);
                }
              }}
              placeholder="Why I'm Writing..."
              maxLength={TITLE_CHAR_LIMIT}
              className={`text-xl text-gray-500 mb-2 w-full border-none focus:outline-none ${
                titleError ? 'border-red-500' : ''
              }`}
            />
            {titleError && (
              <div className="text-red-500 text-sm mb-2">{titleError}</div>
            )}
            <div className="text-sm text-gray-400 mb-2">
              {headerText === "Why I'm Writing..." ? 0 : headerText.length}/{TITLE_CHAR_LIMIT} characters
            </div>

            {/* Date Display */}
            <div className="flex items-center mt-4 mb-4">
              <img src={require("../icons/calendar.svg").default} alt="Calendar Icon" className="w-4 h-4 mr-2" />
              <span className="text-sm">{today}</span>
            </div>

            {/* Text Editor Area with Auto-expanding Container */}
            <div className="relative">
              <div
                id="editable-content"
                contentEditable
                onInput={handleContentChange}
                className={`w-full min-h-[400px] p-4 border rounded bg-white bg-opacity-90 
                           overflow-y-auto focus:outline-none mb-16 transition-all duration-200
                           whitespace-pre-wrap break-words ${
                             contentError ? 'border-red-500' : ''
                           }`}
                style={{
                  resize: 'none',
                  height: 'auto',
                  maxHeight: '70vh' // Maximum height before scrolling
                }}
              />
              {contentError && (
                <div className="text-red-500 text-sm mt-2">{contentError}</div>
              )}

              {/* Formatting Tools with Word Count - Fixed at bottom */}
              <div className="absolute bottom-0 left-0 right-0 bg-white p-2 md:p-4 border-t">
                <div className="flex flex-col sm:flex-row justify-between items-center gap-2">
                  <div className="flex space-x-2 md:space-x-4 flex-wrap">
                    {/* Text Style Tools */}
                    <div className="flex space-x-2 border-r pr-2">
                      <button onClick={() => document.execCommand('bold')} className="p-2 hover:bg-gray-100 rounded">
                        <img src={require("../icons/bold.svg").default} alt="Bold" className="w-6 h-6" />
                      </button>
                      <button onClick={() => document.execCommand('italic')} className="p-2 hover:bg-gray-100 rounded">
                        <img src={require("../icons/Italic.svg").default} alt="Italic" className="w-6 h-6" />
                      </button>
                      <button onClick={() => document.execCommand('underline')} className="p-2 hover:bg-gray-100 rounded">
                        <img src={require("../icons/underline.svg").default} alt="Underline" className="w-6 h-6" />
                      </button>
                      <button onClick={() => document.execCommand('strikeThrough')} className="p-2 hover:bg-gray-100 rounded">
                        <img src={require("../icons/strikethrough.svg").default} alt="Strikethrough" className="w-6 h-6" />
                      </button>
                    </div>

                    {/* Alignment Tools */}
                    <div className="flex space-x-2 border-r pr-2">
                      <button onClick={() => document.execCommand('justifyLeft')} className="p-2 hover:bg-gray-100 rounded">
                        <img src={require("../icons/align-left.svg").default} alt="Align Left" className="w-6 h-6" />
                      </button>
                      <button onClick={() => document.execCommand('justifyCenter')} className="p-2 hover:bg-gray-100 rounded">
                        <img src={require("../icons/align-center.svg").default} alt="Align Center" className="w-6 h-6" />
                      </button>
                      <button onClick={() => document.execCommand('justifyRight')} className="p-2 hover:bg-gray-100 rounded">
                        <img src={require("../icons/align-right.svg").default} alt="Align Right" className="w-6 h-6" />
                      </button>
                    </div>

                    {/* Emoji Picker */}
                    <div className="relative">
                      <button 
                        onClick={() => setShowEmojiPicker(!showEmojiPicker)} 
                        className="p-2 hover:bg-gray-100 rounded"
                      >
                        <img src={require("../icons/emoji.svg").default} alt="Emoji" className="w-6 h-6" />
                      </button>
                      {showEmojiPicker && (
                        <div className="absolute bottom-full right-0 mb-2 z-50">
                          <div className="shadow-lg rounded-lg">
                            <EmojiPicker
                              onEmojiClick={onEmojiClick}
                              width={300}
                              height={400}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 md:space-x-4">
                    <span className="text-xs md:text-sm text-gray-400">
                      {wordCount}/{WORD_LIMIT} words
                    </span>
                    
                    <button
                      onClick={saveContent}
                      className={`px-4 md:px-6 py-2 bg-[#FFB78B] text-white rounded-md hover:bg-[#ffa770] ${
                        wordCount > WORD_LIMIT ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                      disabled={wordCount > WORD_LIMIT}
                    >
                      Save
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Mood Tracker */}
            <div className="relative md:absolute md:top-4 md:right-4 mt-4 md:mt-0">
              <h2 className="text-gray-500 text-base md:text-lg mb-2">Mood Tracker:</h2>
              <div className="flex flex-wrap gap-2">
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
        )}

        {/* View Saved Entries */}
        {viewSavedEntries && (
          <div className="w-full max-w-7xl mx-auto">
            {/* Header Section with Search */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
              {/* Left side - Greeting and Button */}
              <div className="flex flex-col">
                <div className="mb-4">
                 
                </div>
                
               
              </div>

              {/* Right side - Search Bar */}
              <div className="w-full md:w-72">
                <div className="relative">
                  <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                    <svg
                      className="w-5 h-5 text-gray-400"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    placeholder="Search"
                    value={searchQuery}
                    onChange={handleSearchChange}
                    maxLength={50}
                    className="w-full pl-10 pr-4 py-2.5 rounded-full border border-gray-300 focus:outline-none focus:border-gray-400 focus:ring-0 bg-white shadow-sm"
                  />
                </div>
                {searchError && (
                  <div className="absolute -bottom-6 left-0 text-red-500 text-xs">
                    {searchError}
                  </div>
                )}
              </div>
            </div>

            {entries.length === 0 ? (
              <p className="text-center text-xl">No entries saved yet.</p>
            ) : (
              <>
                <div className="grid gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                  {getFilteredEntries().map((entry) => (
                    <div key={entry.id} className="bg-white p-4 md:p-6 rounded-xl shadow-lg relative">
                      <div className="absolute top-4 right-4">
                        <button
                          onClick={(e) => setDropdownVisible(dropdownVisible === entry.id ? null : entry.id)}
                          className="text-xl hover:bg-gray-100 rounded-full w-8 h-8 flex items-center justify-center"
                        >
                          &#x22EE;
                        </button>
                        {dropdownVisible === entry.id && (
                          <div className="absolute right-0 mt-2 bg-white shadow-lg rounded-md border w-32 z-10">
                            <button
                              onClick={(e) => openEntryView(entry, e)}
                              className="block w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 text-left"
                            >
                              View
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditedEntry({...entry});
                                setIsEditing(true);
                              }}
                          
                              onClick={(e) => {
                                e.stopPropagation();
                                archiveEntry(entry.id);
                              }}
                              className="block w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 text-left"
                            >
                              Archive
                            </button>
                          </div>
                        )}
                      </div>
                      
                      {/* Make the card clickable to view entry */}
                      <div onClick={(e) => openEntryView(entry, e)} className="cursor-pointer">
                        <h3 className="text-xl font-semibold mb-2">{entry.title}</h3>
                        <div className="text-sm text-gray-500 mb-2">
                          {new Date(entry.date).toLocaleDateString()}
                        </div>
                        <div className="text-sm mb-2">
                          Mood: <span className="capitalize">{entry.mood}</span>
                        </div>
                        <div 
                          className="prose max-w-none line-clamp-3"
                          dangerouslySetInnerHTML={{ __html: entry.content }}
                        />
                      </div>
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
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-4 md:p-8 max-w-sm w-full mx-4 text-center">
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

        {viewingEntry && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 md:p-4">
            <div className="bg-white rounded-lg w-full max-w-[1300px] mx-auto relative max-h-[90vh] flex flex-col">
              <div className="p-4 md:p-8 overflow-y-auto">
                {isEditing ? (
                  // Edit Mode
                  <>
                    <input
                      type="text"
                      value={editedEntry.title}
                      onChange={(e) => {
                        setEditedEntry({...editedEntry, title: e.target.value});
                        setTitleError(''); // Clear error on change
                      }}
                      className={`text-3xl font-semibold mb-4 w-full border-none focus:outline-none ${
                        titleError ? 'border-red-500' : ''
                      }`}
                    />
                    {titleError && (
                      <div className="text-red-500 text-sm mb-2">{titleError}</div>
                    )}
                    
                    <div className="flex items-center mb-4">
                      <img src={require("../icons/calendar.svg").default} alt="Calendar" className="w-5 h-5 mr-2" />
                      <span className="text-gray-600">
                        {new Date(editedEntry.date).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="mb-6">
                      <div className="flex space-x-2">
                        {['sad', 'angry', 'neutral', 'happy', 'very happy'].map((moodOption) => (
                          <button
                            key={moodOption}
                            onClick={() => setEditedEntry({...editedEntry, mood: moodOption})}
                            className={`px-4 py-1 rounded-full text-sm ${
                              editedEntry.mood === moodOption ? 'text-black' : 'text-gray-600'
                            } ${
                              {
                                'sad': 'bg-[#FFB6A6]',
                                'angry': 'bg-[#FFCF55]',
                                'neutral': 'bg-[#FFF731]',
                                'happy': 'bg-[#00FFFF]',
                                'very happy': 'bg-[#29E259]'
                              }[moodOption]
                            }`}
                          >
                            {moodOption.charAt(0).toUpperCase() + moodOption.slice(1)}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="relative">
                      <div
                        contentEditable
                        className="min-h-[400px] w-full p-4 border rounded-lg focus:outline-none focus:border-[#FFB78B] mb-16"
                        dangerouslySetInnerHTML={{ __html: editedEntry.content }}
                        onInput={handleEditContentChange}
                      />

                      <div className="absolute bottom-0 left-0 right-0 bg-white p-4 border-t">
                        <div className="flex justify-between items-center">
                          {editContentError && (
                            <span className="text-red-500 text-sm">
                              {editContentError}
                            </span>
                          )}
                          
                          <div className="flex items-center space-x-4">
                            <span className="text-sm text-gray-400">
                              {editWordCount}/{WORD_LIMIT} words
                            </span>

                            <div className="flex space-x-3">
                              <button
                                onClick={async () => {
                                  if (handleEditContentChange({ target: document.querySelector('[contenteditable]') })) {
                                    await editEntry(editedEntry.id);
                                    setIsEditing(false);
                                    setViewingEntry({...editedEntry});
                                  }
                                }}
                                className={`px-6 py-2 bg-[#FFB78B] text-white rounded-md hover:bg-[#ffa770] ${
                                  editWordCount > WORD_LIMIT ? 'opacity-50 cursor-not-allowed' : ''
                                }`}
                                disabled={editWordCount > WORD_LIMIT}
                              >
                                Save Changes
                              </button>
                              <button
                                onClick={() => {
                                  setIsEditing(false);
                                  setEditedEntry(null);
                                }}
                                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  // View Mode
                  <div className="flex flex-col h-full">
                    <div className="mb-6">
                      <h2 className="text-2xl font-bold mb-4">{viewingEntry.title}</h2>
                      
                      <div className="flex items-center mb-4">
                        <img src={require("../icons/calendar.svg").default} alt="Calendar" className="w-4 h-4 mr-2" />
                        <span className="text-gray-600 text-sm">
                          {new Date(viewingEntry.date).toLocaleDateString()}
                        </span>
                      </div>

                      <div>
                        <span className={`inline-block px-4 py-1 rounded-full text-sm ${
                          {
                            'sad': 'bg-[#FFB6A6]',
                            'angry': 'bg-[#FFCF55]',
                            'neutral': 'bg-[#FFF731]',
                            'happy': 'bg-[#00FFFF]',
                            'very happy': 'bg-[#29E259]'
                          }[viewingEntry.mood]
                        }`}>
                          {viewingEntry.mood.charAt(0).toUpperCase() + viewingEntry.mood.slice(1)}
                        </span>
                      </div>
                    </div>

                    <div className="flex-grow mb-6 overflow-y-auto">
                      <div 
                        className="prose max-w-none"
                        style={{ 
                          whiteSpace: 'pre-wrap',
                          wordBreak: 'break-word',
                          lineHeight: '1.6'
                        }}
                        dangerouslySetInnerHTML={{ __html: viewingEntry.content }}
                      />
                    </div>

                    <div className="flex justify-end space-x-2 pt-4 border-t">
                      <button
                        onClick={() => {
                          setEditedEntry({...viewingEntry});
                          setIsEditing(true);
                        }}
                        className="px-6 py-2 bg-[#FFB78B] text-white rounded-md hover:bg-[#ffa770] text-sm"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => {
                          setViewingEntry(null);
                          setIsEditing(false);
                          setEditedEntry(null);
                        }}
                        className="px-6 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 text-sm"
                      >
                        Close
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyDiary;
