import React, { useState, useEffect } from 'react';
import Sidebar from '../Navigation/Sidebar';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import googleCalendarPlugin from '@fullcalendar/google-calendar';
import { calendarService } from '../services/calendarService';
import { useAuth } from '../context/AuthContext';
import Swal from 'sweetalert2';

const MyCalendar = () => {
    const { user } = useAuth();
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [isGoogleCalendarConnected, setIsGoogleCalendarConnected] = useState(false);
    const [events, setEvents] = useState([]);

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        const error = urlParams.get('error');
        
        if (code) {
            handleOAuthCallback(code);
        } else if (error) {
            console.error('Google OAuth Error:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Failed to connect to Google Calendar: ' + error
            });
        } else {
            checkGoogleCalendarConnection();
        }
    }, []);

    const checkGoogleCalendarConnection = async () => {
        try {
            const response = await calendarService.getEvents(
                new Date(),
                new Date(new Date().setMonth(new Date().getMonth() + 1))
            );
            setIsGoogleCalendarConnected(true);
            setEvents(response.data || []);
        } catch (error) {
            console.error('Error checking Google Calendar connection:', error);
            setIsGoogleCalendarConnected(false);
        }
    };

    const handleConnectGoogle = async () => {
        try {
            const { data } = await calendarService.getAuthUrl();
            window.location.href = data.authUrl;
        } catch (error) {
            console.error('Error getting auth URL:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Failed to connect to Google Calendar'
            });
        }
    };

    const handleDateSelect = async (selectInfo) => {
        const title = await Swal.fire({
            title: 'Create Event',
            input: 'text',
            inputLabel: 'Event Title',
            showCancelButton: true,
            inputValidator: (value) => {
                if (!value) {
                    return 'Please enter a title';
                }
            }
        });

        if (title.isConfirmed) {
            try {
                const eventData = {
                    title: title.value,
                    start: selectInfo.startStr,
                    end: selectInfo.endStr,
                    allDay: selectInfo.allDay
                };

                await calendarService.createEvent(eventData);
                checkGoogleCalendarConnection(); // Refresh events
                
                Swal.fire({
                    icon: 'success',
                    title: 'Success',
                    text: 'Event created successfully'
                });
            } catch (error) {
                console.error('Error creating event:', error);
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Failed to create event'
                });
            }
        }
    };

    const handleEventClick = async (clickInfo) => {
        const event = clickInfo.event;
        
        const result = await Swal.fire({
            title: event.title,
            html: `
                <p>Start: ${event.start.toLocaleString()}</p>
                <p>End: ${event.end ? event.end.toLocaleString() : 'N/A'}</p>
            `,
            showDenyButton: true,
            showCancelButton: true,
            confirmButtonText: 'Edit',
            denyButtonText: 'Delete'
        });

        if (result.isConfirmed) {
            // Edit event
            const { value: newTitle } = await Swal.fire({
                title: 'Edit Event',
                input: 'text',
                inputValue: event.title,
                showCancelButton: true,
                inputValidator: (value) => {
                    if (!value) {
                        return 'Please enter a title';
                    }
                }
            });

            if (newTitle) {
                try {
                    await calendarService.updateEvent(event.id, {
                        title: newTitle
                    });
                    checkGoogleCalendarConnection(); // Refresh events
                } catch (error) {
                    console.error('Error updating event:', error);
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: 'Failed to update event'
                    });
                }
            }
        } else if (result.isDenied) {
            // Delete event
            const confirmDelete = await Swal.fire({
                title: 'Are you sure?',
                text: "You won't be able to revert this!",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Yes, delete it!'
            });

            if (confirmDelete.isConfirmed) {
                try {
                    await calendarService.deleteEvent(event.id);
                    checkGoogleCalendarConnection(); // Refresh events
                    Swal.fire('Deleted!', 'Your event has been deleted.', 'success');
                } catch (error) {
                    console.error('Error deleting event:', error);
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: 'Failed to delete event'
                    });
                }
            }
        }
    };

    const handleOAuthCallback = async (code) => {
        try {
            await calendarService.handleCallback(code);
            // After successful callback, check connection and load events
            await checkGoogleCalendarConnection();
            // Clear the URL parameters
            window.history.replaceState({}, document.title, "/mycalendar");
            Swal.fire({
                icon: 'success',
                title: 'Success',
                text: 'Successfully connected to Google Calendar'
            });
        } catch (error) {
            console.error('Error handling OAuth callback:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Failed to complete Google Calendar connection: ' + error.message
            });
        }
    };

    useEffect(() => {
        checkGoogleCalendarConnection();
    }, []);

    return (
        <div className="flex h-screen bg-gray-100">
            <Sidebar
                isCollapsed={isSidebarCollapsed}
                setIsCollapsed={setIsSidebarCollapsed}
            />
            <div className={`flex-1 transition-all duration-300 ${
                isSidebarCollapsed ? "ml-[60px]" : "ml-[250px]"
            }`}>
                <div className="p-8">
                    <div className="mb-6">
                        <h1 className="text-3xl font-bold text-gray-800">My Calendar</h1>
                        {!isGoogleCalendarConnected && (
                            <div className="mt-4 p-4 bg-white rounded-lg shadow-md">
                                <p className="text-gray-600 mb-4">
                                    Connect your Google Calendar to sync and manage your events.
                                </p>
                                <button
                                    onClick={handleConnectGoogle}
                                    className="bg-[#FFB78B] text-white px-4 py-2 rounded-lg hover:bg-[#ffa770] transition-colors"
                                >
                                    Connect Google Calendar
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="bg-white rounded-lg shadow-md p-6">
                        <FullCalendar
                            plugins={[
                                dayGridPlugin,
                                timeGridPlugin,
                                interactionPlugin,
                                googleCalendarPlugin
                            ]}
                            headerToolbar={{
                                left: 'prev,next today',
                                center: 'title',
                                right: 'dayGridMonth,timeGridWeek,timeGridDay'
                            }}
                            initialView="dayGridMonth"
                            editable={true}
                            selectable={true}
                            selectMirror={true}
                            dayMaxEvents={true}
                            events={events}
                            select={handleDateSelect}
                            eventClick={handleEventClick}
                            height="auto"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MyCalendar; 