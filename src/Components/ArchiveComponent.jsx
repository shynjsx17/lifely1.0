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
    <div className="flex h-screen">
      <Sidebar
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
      />
      <div
        className={`flex-1 transition-all duration-300 ${
          isSidebarCollapsed ? "ml-[60px]" : "ml-[250px]"
        }`}
      >
        <div className="p-8 h-full overflow-y-auto">
          <div className="text-left mb-10 font-poppins">
            <h1 className="font-bold text-3xl">Archive</h1>
            <p className="font-bold text-xl text-[#FFB78B]">
              Your completed tasks are stored here
            </p>
          </div>

          {/* Task List */}
          <div className="space-y-4 mb-6">
            {archives.map((archive) => (
              <div
                key={archive.id}
                className="flex items-center justify-between bg-white shadow-md rounded-lg p-3 cursor-pointer"
              >
                {/* Task content */}
                <div className="flex flex-col flex-grow">
                  <p className="text-xs text-gray-500">My lists &gt; {archive.category}</p>
                  <p className="text-gray-800 font-semibold text-xl">
                    {archive.title}
                  </p>

                  {/* Tag */}
                  <div className="mt-2 flex">
                    <span
                      className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        archive.priority_tag === "High Priority"
                          ? "bg-red-500 text-white"
                          : archive.priority_tag === "Medium Priority"
                          ? "bg-yellow-500 text-white"
                          : "bg-green-500 text-white"
                      }`}
                    >
                      {archive.priority_tag}
                    </span>
                  </div>
                </div>

                {/* Restore button */}
                <button
                  onClick={() => handleRestore(archive.id)}
                  className="ml-4 px-4 py-2 bg-[#FFB78B] text-white rounded-lg hover:bg-[#ffa770] transition-colors"
                >
                  Restore
                </button>
              </div>
            ))}

            {archives.length === 0 && (
              <div className="text-center text-gray-500 py-8">
                No archived tasks
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArchiveComponent;