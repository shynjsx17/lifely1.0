import React, { useState } from "react";
import Sidebar from "../Navigation/Sidebar";
import RestoreIcon from '../icons/restore.svg';
import DeleteIcon from '../icons/delete.svg';
import PlusIcon from '../icons/plus.svg';

const ArchiveComponent = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [archives, setArchives] = useState([
    { id: 1, title: "Fundamentals of Research", category: "My lists - Personal", isChecked: false },
    { id: 2, title: "Multimedia", category: "My lists - Personal", isChecked: false },
    { id: 3, title: "Web Development", category: "My lists - Personal", isChecked: false },
    { id: 4, title: "SIA", category: "My lists - Personal", isChecked: false },
    { id: 5, title: "ELECTIVE", category: "My lists - Personal", isChecked: false },
    { id: 6, title: "Database", category: "My lists - Personal", isChecked: false },
  ]);

  const [deletedArchives, setDeletedArchives] = useState([]);
  const [currentView, setCurrentView] = useState("archive");
  const [isSelectAll, setIsSelectAll] = useState(false);

  const handleCheckboxChange = (id) => {
    setArchives(
      archives.map((archive) =>
        archive.id === id ? { ...archive, isChecked: !archive.isChecked } : archive
      )
    );
  };

  const handleDelete = (id) => {
    const updatedArchives = archives.filter((archive) => archive.id !== id);
    const deletedItem = archives.find((archive) => archive.id === id);
    setArchives(updatedArchives);
    setDeletedArchives([...deletedArchives, deletedItem]);
  };

  const handleRestore = (id) => {
    const itemToRestore = deletedArchives.find((archive) => archive.id === id);
    if (itemToRestore) {
      setArchives([...archives, itemToRestore]);
      setDeletedArchives(deletedArchives.filter((archive) => archive.id !== id));
    }
  };

  const handleDeleteAll = () => {
    const checkedArchives = archives.filter((archive) => archive.isChecked);
    const remainingArchives = archives.filter((archive) => !archive.isChecked);
    setArchives(remainingArchives);
    setDeletedArchives([...deletedArchives, ...checkedArchives]);
    setIsSelectAll(false); // Reset to Select All
  };

  const handleRestoreAll = () => {
    setArchives([
      { id: 1, title: "Fundamentals of Research", category: "My lists - Personal" },
      { id: 2, title: "Multimedia", category: "My lists - Personal" },
      { id: 3, title: "Web Development", category: "My lists - Personal" },
      { id: 4, title: "SIA", category: "My lists - Personal" },
      { id: 5, title: "ELECTIVE", category: "My lists - Personal" },
      { id: 6, title: "Database", category: "My lists - Personal" },
    ]);
    setIsSelectAll(false); // Reset to Select All
  };

  const handleSelectAll = () => {
    if (archives.length > 0) {
      const updatedArchives = archives.map((archive) => ({ ...archive, isChecked: !isSelectAll }));
      setArchives(updatedArchives);
      setIsSelectAll(!isSelectAll);
    }
  };

  return (
    <div className="min-h-screen bg-system-background bg-no-repeat bg-cover bg-fixed">
      <Sidebar 
        isCollapsed={isSidebarCollapsed} 
        setIsCollapsed={setIsSidebarCollapsed} 
      />
      <div className="bg-system-background p-16 h-screen bg-no-repeat bg-fixed font-poppins">
      
      {/* Header */}
      <h1 className="text-4xl font-bold text-gray-800 mb-10 ml-60 font-poppins">My Archive</h1>

      {/* Button Container */}
      <div className="flex justify-between items-center mb-6">

        {/* My Day and My Diary Buttons */}
        <div className="flex space-x-4 ml-10">
          <button
            onClick={() => setCurrentView("day")}
            className={`${
              currentView === "day" ? "bg-[#FFD4B3]" : "bg-white"
            } text-black ml-56 font-semibold py-2 px-4 shadow rounded-l-md hover:bg-gray-300 border rounded-md`}
          >
            My Day
          </button>
          <button
            onClick={() => setCurrentView("diary")}
            className={`${
              currentView === "diary" ? "bg-[#FFD4B3]" : "bg-white"
            } text-black-700 shadow font-semibold py-1 px-3 text-sm rounded-md hover:bg-gray-300`}
          >
            My Diary
          </button>
        </div>

        {/* Select All, Restore All, and Delete All Buttons */}
        <div className="flex flex-wrap space-x-4 mr-64">
          <button
            onClick={handleSelectAll}
            className="bg-white text-black-700 font-semibold shadow py-1 px-3 text-sm rounded-md hover:bg-gray-300"
          >
            {isSelectAll ? "Unselect All" : "Select All"}
          </button>
          <button
            onClick={handleRestoreAll}
            className="bg-white text-black-700 font-semibold shadow py-1 px-3 text-sm rounded-md hover:bg-gray-300"
          >
            Restore All
          </button>
          <button
            onClick={handleDeleteAll}
            className="bg-white shadow text-black-700 font-semibold py-1 px-3 text-sm rounded-md hover:bg-gray-300"
          >
            Delete All
          </button>
        </div>
      </div>

      {/* Archive List Container */}
      {currentView === "archive" && (
        <div className="mx-auto max-w-7xl bg-white bg-opacity-50 rounded-2xl shadow-lg p-6 h-auto min-h-[650px] flex flex-col justify-center items-center">
          {archives.length === 0 ? (
            <div className="text-center text-gray-500 text-lg">
              <p className="text-gray-500 text-lg font-bold">No Archive Task</p>
              <p className="text-gray-500">You have no archive now.</p>
              <p className="text-gray-500">Tap the button to add your task.</p>
              <button
                className="mt-4 bg-[#FFD4BB] text-[#000000] py-2 px-4 rounded-md flex items-center justify-center  hover:bg-gray-300 hover:text-black space-x-2"
              >
                <img 
                  src={require("../icons/plus.svg").default} 
                  alt="Add" 
                  className="w-5 h-5" 
                />
                <span>Create another task</span>
              </button>
            </div>
          ) : (
            <div className="overflow-y-auto w-full">
              {archives.map((archive) => (
                <div
                key={archive.id}
                className={`flex items-center border-b last:border-b-0 p-4 ${
                  archive.isChecked ? "bg-gray-200" : "hover:bg-gray-100"
                } relative bg-white shadow-md rounded-xl mb-4`}
              >
                  {/* Checkbox */}
                  <input
                    type="checkbox"
                    className="mr-4 w-5 h-5"
                    checked={archive.isChecked}
                    onChange={() => handleCheckboxChange(archive.id)}
                  />

                  {/* Archive Content */}
                  <div className="flex-grow">
                    <p className="text-sm text-gray-500">{archive.category}</p>
                    <h2 className="text-lg font-semibold text-gray-800">{archive.title}</h2>
                  </div>

                  {/* SVG Buttons (Restore and Delete) */}
                  <div className="flex space-x-4">
                    <button onClick={() => handleRestore(archive.id)}>
                      <img 
                        src={require("../icons/restore.svg").default} 
                        alt="Restore" 
                        className="w-5 h-5" 
                      />
                    </button>
                    <button onClick={() => handleDelete(archive.id)}>
                      <img 
                        src={require("../icons/delete.svg").default} 
                        alt="Delete" 
                        className="w-5 h-5" 
                      />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* My Day List */}
      {currentView === "day" && (
        <div className="mx-auto max-w-7xl bg-white bg-opacity-50 rounded-2xl shadow-lg p-6 h-[650px] flex flex-col justify-center items-center">
          {archives.length === 0 ? (
            <div className="text-center text-gray-500 flex flex-col justify-center items-center">
              <p className="text-gray-500 font-bold text-lg ">No Archive Task</p>
              <p className="text-gray-500">You have no archive now.</p>
              <p className="text-gray-500">Tap the button to add your task.</p>
              <button
                className="mt-4 bg-[#FFD4BB] text-[#000000] py-2 px-4 shadow rounded-md flex items-center justify-center hover:bg-gray-300 hover:text-black space-x-2"
              >
                <img 
                  src={require("../icons/plus.svg").default} 
                  alt="Add" 
                  className="w-5 h-5" 
                />
                <span>Create another task</span>
              </button>
            </div>
          ) : (
            <div className="overflow-y-auto w-full">
              {archives.map((archive) => (
                <div
                  key={archive.id}
                  className="flex items-center border-b last:border-b-0 p-4 hover:bg-gray-100 relative bg-white shadow-md rounded-xl mb-4"
                >

                  {/* Checkbox */}
                  <input
                    type="checkbox"
                    className="mr-4 w-5 h-5"
                    checked={archive.isChecked}
                    onChange={() => handleCheckboxChange(archive.id)}
                  />

                  {/* Archive Content */}
                  <div className="flex-grow">
                    <p className="text-sm text-gray-500">{archive.category}</p>
                    <h2 className="text-lg font-semibold text-gray-800">{archive.title}</h2>
                  </div>

                  {/* SVG Buttons (Restore and Delete) */}
                  <div className="flex space-x-4">
                    <button onClick={() => handleRestore(archive.id)}>
                      <img 
                        src={require("../icons/restore.svg").default} 
                        alt="Restore" 
                        className="w-5 h-5" 
                      />
                    </button>
                    <button onClick={() => handleDelete(archive.id)}>
                      <img 
                        src={require("../icons/delete.svg").default} 
                        alt="Delete" 
                        className="w-5 h-5" 
                      />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* My Diary Section */}
      {currentView === "diary" && (
        <div className="mx-auto max-w-7xl bg-white bg-opacity-50 rounded-2xl shadow-lg p-6 h-[650px] flex flex-col justify-center items-center">
          <p className="text-gray-500 font-bold text-lg">No Archive Diary</p>
          <p className="text-gray-500">You have no archive now.</p>
          <p className="text-gray-500">Tap the button to add your diary.</p>
          <button
            className="mt-4 bg-[#FFD4BB] text-[rgb(0,0,0)] py-2 px-4 shadow rounded-md flex items-center justify-center  hover:bg-gray-300 hover:text-black space-x-2"
          >
            <img 
              src={require("../icons/plus.svg").default} 
              alt="Add" 
              className="w-5 h-5" 
            />
            <span>Create another task</span>
          </button>
        </div>
      )}
    </div>
    </div>
  );
};

export default ArchiveComponent;