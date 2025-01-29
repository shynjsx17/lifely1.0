const handleUpdateDueDate = async (taskId, date) => {
  try {
    const formattedDate = dayjs(date).format('YYYY-MM-DD');
    const response = await fetch(`http://localhost/lifely1.0/backend/api/tasks.php?id=${taskId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${sessionStorage.getItem('session_token')}`
      },
      body: JSON.stringify({
        reminder_date: formattedDate
      })
    });

    if (response.ok) {
      await fetchTasks();
      setShowDatePicker(false);
    }
  } catch (error) {
    console.error('Error updating due date:', error);
  }
};

// Update the date picker in the task modal
{showDatePicker && (
  <div className="absolute top-full left-0 mt-2 z-50 bg-white rounded-lg shadow-lg p-4">
    <div className="grid grid-cols-7 gap-2">
      {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(day => (
        <div key={day} className="text-center text-sm font-medium">
          {day}
        </div>
      ))}
      {generateDate(currentMonth, currentYear).map((dateObj, index) => (
        <button
          key={index}
          onClick={() => handleUpdateDueDate(selectedTaskId, dateObj.date)}
          className={`p-2 text-center rounded-full hover:bg-gray-100 ${
            dateObj.currentMonth ? '' : 'text-gray-400'
          } ${dateObj.today ? 'bg-blue-500 text-white' : ''}`}
        >
          {dateObj.date.date()}
        </button>
      ))}
    </div>
  </div>
)}

// Update the task display to properly format dates
<div className="text-sm text-gray-500">
  {task.reminder_date && (
    <span className="mr-2">
      Due: {dayjs(task.reminder_date).format('MMM D, YYYY')}
    </span>
  )}
</div> 