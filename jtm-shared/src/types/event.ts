// JTM Shared Types - Event Management
export interface Event {
  id: string;
  title: string;
  description: string;
  flyer?: string; // Image URL
  date: Date;
  location: string;
  rsvpRequired: boolean;
  rsvpForm?: DynamicRSVPForm;
  rsvpDeadline?: Date;
  maxParticipants?: number;
}

export interface DynamicRSVPForm {
  fields: RSVPField[];
}

export interface RSVPField {
  id: string;
  type: 'text' | 'number' | 'select' | 'checkbox' | 'radio';
  label: string;
  required: boolean;
  options?: string[]; // For select/radio fields
}

export interface RSVPResponse {
  id: string;
  eventId: string;
  userId: string;
  responses: Record<string, any>; // Dynamic form responses
  paymentConfirmed: boolean;
  paymentReference?: string;
  qrCode?: string;
  checkedIn: boolean;
  checkedInAt?: Date;
}

export interface EventLifecycle {
  creation: boolean;
  rsvpFormBuilder: boolean;
  publication: boolean;
  rsvpCollection: boolean;
  paymentVerification: boolean;
  reminderSending: boolean;
  checkInProcess: boolean;
  postEventAnalytics: boolean;
}