import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import axiosInstance from '../utils/axiosInstance';

/**
 * Calendar Page
 * Displays tasks, events, and meetings in calendar view
 */
const Calendar = () => {
  const [events, setEvents] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [customEvents, setCustomEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showEventModal, setShowEventModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [eventForm, setEventForm] = useState({
    title: '',
    description: '',
    start_date: '',
    end_date: '',
    type: 'custom', // custom, google_meet
    meeting_link: '',
    color: '#F25292',
  });

  useEffect(() => {
    fetchCalendarData();
  }, []);

  const fetchCalendarData = async () => {
    try {
      // Fetch tasks
      const tasksRes = await axiosInstance.get('/api/tasks');
      setTasks(tasksRes.data);

      // Fetch custom events (you'll need to create this endpoint)
      try {
        const eventsRes = await axiosInstance.get('/api/calendar-events');
        setCustomEvents(eventsRes.data);
      } catch (error) {
        console.log('Calendar events endpoint not ready yet');
        setCustomEvents([]);
      }

      // Combine all events
      combineEvents(tasksRes.data, []);
    } catch (error) {
      console.error('Error fetching calendar data:', error);
    } finally {
      setLoading(false);
    }
  };

  const combineEvents = (tasksList, eventsList) => {
    const allEvents = [];

    // Add tasks as events
    tasksList.forEach(task => {
      if (task.due_date) {
        allEvents.push({
          id: `task-${task.id}`,
          title: task.title,
          start: task.start_date || task.due_date,
          end: task.due_date,
          backgroundColor: task.workflow_status?.color || '#8B5CF6',
          borderColor: task.workflow_status?.color || '#8B5CF6',
          extendedProps: {
            type: 'task',
            priority: task.priority,
            status: task.workflow_status?.name,
            description: task.description,
          }
        });
      }
    });

    // Add custom events
    eventsList.forEach(event => {
      allEvents.push({
        id: `event-${event.id}`,
        title: event.title,
        start: event.start_date,
        end: event.end_date,
        backgroundColor: event.color || '#F25292',
        borderColor: event.color || '#F25292',
        extendedProps: {
          type: event.type,
          description: event.description,
          meeting_link: event.meeting_link,
        }
      });
    });

    setEvents(allEvents);
  };

  const handleDateClick = (info) => {
    setSelectedDate(info.dateStr);
    setEventForm({
      ...eventForm,
      start_date: info.dateStr,
      end_date: info.dateStr,
    });
    setShowEventModal(true);
  };

  const handleEventClick = (info) => {
    const event = info.event;
    const props = event.extendedProps;

    if (props.type === 'task') {
      // Navigate to task view
      window.location.href = `/tasks/${event.id.replace('task-', '')}`;
    } else {
      // Show event details or edit
      alert(`Event: ${event.title}\n${props.description || ''}\n${props.meeting_link || ''}`);
    }
  };

  const handleSubmitEvent = async (e) => {
    e.preventDefault();
    
    try {
      // Create custom event (you'll need to create this endpoint)
      const response = await axiosInstance.post('/api/calendar-events', eventForm);
      
      setCustomEvents([...customEvents, response.data]);
      combineEvents(tasks, [...customEvents, response.data]);
      setShowEventModal(false);
      resetForm();
      
      alert('Event created successfully!');
    } catch (error) {
      console.error('Error creating event:', error);
      alert('Failed to create event. Endpoint may not be ready yet.');
    }
  };

  const resetForm = () => {
    setEventForm({
      title: '',
      description: '',
      start_date: '',
      end_date: '',
      type: 'custom',
      meeting_link: '',
      color: '#F25292',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{borderColor: '#8B5CF6'}}></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Calendar</h1>
          <p className="text-sm text-gray-600 mt-1">Manage your tasks, events, and meetings</p>
        </div>
        <button
          onClick={() => setShowEventModal(true)}
          className="px-4 py-2 text-white rounded-lg font-medium hover:opacity-90 transition-opacity flex items-center gap-2"
          style={{background: 'linear-gradient(135deg, rgb(139, 92, 246) 0%, rgb(124, 58, 237) 100%)'}}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Event
        </button>
      </div>

      {/* Calendar Legend */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6 border border-gray-200">
        <div className="flex items-center gap-6 flex-wrap">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded" style={{backgroundColor: '#8B5CF6'}}></div>
            <span className="text-sm text-gray-700">Tasks</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded" style={{backgroundColor: '#F25292'}}></div>
            <span className="text-sm text-gray-700">Custom Events</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded" style={{backgroundColor: '#10B981'}}></div>
            <span className="text-sm text-gray-700">Google Meet</span>
          </div>
        </div>
      </div>

      {/* Calendar */}
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay'
          }}
          events={events}
          dateClick={handleDateClick}
          eventClick={handleEventClick}
          editable={true}
          selectable={true}
          selectMirror={true}
          dayMaxEvents={true}
          weekends={true}
          height="auto"
          eventTimeFormat={{
            hour: '2-digit',
            minute: '2-digit',
            meridiem: false
          }}
        />
      </div>

      {/* Add/Edit Event Modal */}
      {showEventModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="p-4 text-white rounded-t-lg" style={{ background: 'linear-gradient(135deg, rgb(139, 92, 246) 0%, rgb(124, 58, 237) 100%)' }}>
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold">Create Event</h2>
                <button
                  onClick={() => {
                    setShowEventModal(false);
                    resetForm();
                  }}
                  className="hover:bg-white hover:bg-opacity-20 rounded-lg p-1 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmitEvent} className="p-6">
              <div className="space-y-4">
                {/* Title */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Event Title *
                  </label>
                  <input
                    type="text"
                    value={eventForm.title}
                    onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
                    placeholder="Enter event title"
                  />
                </div>

                {/* Event Type */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Event Type
                  </label>
                  <select
                    value={eventForm.type}
                    onChange={(e) => setEventForm({ ...eventForm, type: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="custom">Custom Event</option>
                    <option value="google_meet">Google Meet</option>
                    <option value="meeting">Meeting</option>
                    <option value="reminder">Reminder</option>
                  </select>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={eventForm.description}
                    onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    rows="3"
                    placeholder="Event description"
                  ></textarea>
                </div>

                {/* Date Range */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Start Date *
                    </label>
                    <input
                      type="datetime-local"
                      value={eventForm.start_date}
                      onChange={(e) => setEventForm({ ...eventForm, start_date: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      End Date *
                    </label>
                    <input
                      type="datetime-local"
                      value={eventForm.end_date}
                      onChange={(e) => setEventForm({ ...eventForm, end_date: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>

                {/* Meeting Link (for Google Meet) */}
                {(eventForm.type === 'google_meet' || eventForm.type === 'meeting') && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Meeting Link
                    </label>
                    <input
                      type="url"
                      value={eventForm.meeting_link}
                      onChange={(e) => setEventForm({ ...eventForm, meeting_link: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="https://meet.google.com/xxx-xxxx-xxx"
                    />
                  </div>
                )}

                {/* Color Picker */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Event Color
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={eventForm.color}
                      onChange={(e) => setEventForm({ ...eventForm, color: e.target.value })}
                      className="w-16 h-10 rounded border border-gray-300 cursor-pointer"
                    />
                    <span className="text-sm text-gray-600">{eventForm.color}</span>
                    <div className="flex gap-2 ml-auto">
                      <button
                        type="button"
                        onClick={() => setEventForm({ ...eventForm, color: '#F25292' })}
                        className="w-8 h-8 rounded-full border-2 border-gray-300"
                        style={{backgroundColor: '#F25292'}}
                      ></button>
                      <button
                        type="button"
                        onClick={() => setEventForm({ ...eventForm, color: '#8B5CF6' })}
                        className="w-8 h-8 rounded-full border-2 border-gray-300"
                        style={{backgroundColor: '#8B5CF6'}}
                      ></button>
                      <button
                        type="button"
                        onClick={() => setEventForm({ ...eventForm, color: '#10B981' })}
                        className="w-8 h-8 rounded-full border-2 border-gray-300"
                        style={{backgroundColor: '#10B981'}}
                      ></button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowEventModal(false);
                    resetForm();
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 rounded-lg text-white font-medium hover:opacity-90 transition-opacity"
                  style={{ background: 'linear-gradient(135deg, rgb(139, 92, 246) 0%, rgb(124, 58, 237) 100%)' }}
                >
                  Create Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Calendar;
