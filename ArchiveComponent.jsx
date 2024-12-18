import { useState } from "react";

const ArchiveComponent = () => {
  const [archives, setArchives] = useState([
    { id: 1, title: "Fundamentals of Research", category: "My lists - Personal" },
    { id: 2, title: "Multimedia", category: "My lists - Personal" },
    { id: 3, title: "Web Development", category: "My lists - Personal" },
    { id: 4, title: "SIA", category: "My lists - Personal" },
    { id: 5, title: "ELECTIVE", category: "My lists - Personal" },
    { id: 6, title: "Database", category: "My lists - Personal" },
  ]);

  const handleDeleteAll = () => setArchives([]);
  const handleRestoreAll = () =>
    setArchives([
      { id: 1, title: "Fundamentals of Research", category: "My lists - Personal" },
      { id: 2, title: "Multimedia", category: "My lists - Personal" },
      { id: 3, title: "Web Development", category: "My lists - Personal" },
      { id: 4, title: "SIA", category: "My lists - Personal" },
      { id: 5, title: "ELECTIVE", category: "My lists - Personal" },
      { id: 6, title: "Database", category: "My lists - Personal" },
    ]);

  return (
    <div className="bg-system-background p-16 h-screen bg-no-repeat bg-fixed font-poppins">
      {/* Header */}
      <h1 className="text-4xl font-bold text-gray-800 mb-12 ml-40 font-poppins">My Archive</h1>

      {/* Button Container */}
      <div className="flex justify-between items-center mb-6">
        {/* My Day and My Diary Buttons */}
        <div className="flex space-x-4 ml-10">
          <button className="bg-[#FFD4B3] text-black ml-56 font-semibold py-2 px-4 rounded-l-md hover:bg-orange-200">
            My Day
          </button>
          <button className="bg-white text-black font-semibold py-2 px-4 rounded-r-md shadow hover:bg-gray-300">
            My Diary
          </button>
        </div>

        {/* Restore All and Delete All Buttons */}
        <div className="flex space-x-4 mr-64">
          <button
            onClick={handleRestoreAll}
            className="bg-white text-black-700 font-semibold py-1 px-3 text-sm rounded-md hover:bg-gray-300"
          >
            Restore All
          </button>
          <button
            onClick={handleDeleteAll}
            className="bg-white text-black-700 font-semibold py-1 px-3 text-sm rounded-md hover:bg-gray-300"
          >
            Delete All
          </button>
        </div>
      </div>

      {/* Archive List Container */}
      <div className="mx-auto max-w-7xl bg-white bg-opacity-95 rounded-lg shadow-lg p-6">
        {archives.map((archive) => (
          <div
            key={archive.id}
            className="flex items-center border-b last:border-b-0 px-6 py-4 hover:bg-gray-100 relative"
          >

            {/* Archive Content */}
            <div className="flex-grow">
              <p className="text-sm text-gray-500">{archive.category}</p>
              <h2 className="text-lg font-semibold text-gray-800">{archive.title}</h2>
            </div>

            {/* SVG Buttons (Restore and Delete) */}
            <div className="flex space-x-4 absolute right-4">
              <button>
                <img src="/assets/restore.svg" alt="Restore" className="w-6 h-6" />
              </button>
              <button>
                <img src="/assets/delete.svg" alt="Delete" className="w-6 h-6" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ArchiveComponent;
