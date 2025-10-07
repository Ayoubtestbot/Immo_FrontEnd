import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { withAuth } from '@/lib/withAuth';
import DashboardLayout from '@/components/DashboardLayout';
import { Button, Row, Col, Alert } from 'react-bootstrap';
import axios from 'axios';

import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction'; // for dateClick
import ViewLeadModal from '@/components/ViewLeadModal'; // New import
import type { Lead, User, Note, Activity, Property } from '@prisma/client';

import { LeadWithAssignedTo } from '@/types';

interface CalendarEvent {
  id: string;
  firstName: string;
  lastName: string;
  email: string; // Added
  phone: string | null; // Added
  createdAt: string; // Added
  city: string | null; // Added
  appointmentDate: string;
  assignedTo: { name: string } | null;
  title?: string; // FullCalendar event property
  date?: string; // FullCalendar event property
  extendedProps?: { // To store full lead data for the modal
    lead: LeadWithAssignedTo;
  };
}

const CalendarPage = () => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showViewModal, setShowViewModal] = useState(false); // New state
  const [editingLead, setEditingLead] = useState<LeadWithAssignedTo | null>(null); // New state
  const router = useRouter();

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      setError(null);
      try {
        const startOfYear = new Date(new Date().getFullYear(), 0, 1);
        const endOfYear = new Date(new Date().getFullYear() + 1, 0, 0);

        const response = await axios.get<CalendarEvent[]>('/api/calendar/events', {
          params: {
            start: startOfYear.toISOString(),
            end: endOfYear.toISOString(),
          },
        });

        const formattedEvents = response.data.map(event => {
          const appointmentDateTime = new Date(event.appointmentDate);
          const isAllDay = appointmentDateTime.getHours() === 0 && appointmentDateTime.getMinutes() === 0 && appointmentDateTime.getSeconds() === 0;

          return {
            ...event,
            id: event.id,
            title: `${event.firstName} ${event.lastName} (${event.assignedTo?.name || 'Unassigned'})`,
            start: event.appointmentDate, // FullCalendar can handle ISO strings directly
            allDay: isAllDay,
            extendedProps: {
              lead: { // Store the full lead object here
                ...event,
                assignedTo: event.assignedTo ? { ...event.assignedTo, id: '' } : null, // Mock assignedTo.id as it's not returned by API
              } as any,
            },
          };
        });
        setEvents(formattedEvents);
      } catch (err) {
        console.error('Failed to fetch calendar events:', err);
        setError('Failed to load calendar events.');
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  const handleEventClick = (clickInfo: any) => {
    const leadData = clickInfo.event.extendedProps.lead;
    if (leadData) {
      setEditingLead(leadData);
      setShowViewModal(true);
    }
  };

  const handleCloseViewModal = () => {
    setEditingLead(null);
    setShowViewModal(false);
  };

  return (
    <DashboardLayout>
      <h1 className="h2 mb-4">Calendrier des rendez-vous</h1>

      {loading ? (
        <Alert variant="info">Loading calendar events...</Alert>
      ) : error ? (
        <Alert variant="danger">{error}</Alert>
      ) : (
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="timeGridWeek"
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay'
          }}
          events={events}
          eventClick={handleEventClick}
          eventContent={(arg) => {
            return (
              <div className="event-custom-content">
                <b>{arg.timeText}</b>
                <i>{arg.event.title}</i>
              </div>
            );
          }}
          locale="fr"
          eventTimeFormat={{
            hour: '2-digit',
            minute: '2-digit',
            meridiem: false,
            hour12: false,
          }}
        />
      )}

      {editingLead && (
        <ViewLeadModal
          show={showViewModal}
          handleClose={handleCloseViewModal}
          lead={editingLead}
        />
      )}
    </DashboardLayout>
  );
};

export const getServerSideProps = withAuth(async (context) => {
  return {
    props: {},
  };
}, ['AGENCY_OWNER', 'AGENCY_MEMBER', 'AGENCY_SUPER_AGENT']);

export default CalendarPage;

