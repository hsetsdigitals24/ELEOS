// types/registration.ts — the per-event registration form, shared by the
// public form page, the admin form builder and the admin responses panel.
// Mirrors the server's shapes in server/src/types/index.ts. Runtime helpers
// (labels, limits, validation) live in lib/registration.ts.

/** Every field type the admin can put on an event's registration form. */
export type RegistrationFieldType =
  | "text"
  | "textarea"
  | "email"
  | "tel"
  | "number"
  | "date"
  | "select"
  | "radio"
  | "checkbox";

/** One question on an event's registration form. */
export interface RegistrationField {
  /**
   * Stable identifier, minted when the field is created and never changed
   * when it is renamed — this is what ties an old answer to its question.
   */
  key: string;
  label: string;
  type: RegistrationFieldType;
  placeholder: string;
  helpText: string;
  required: boolean;
  /** Choices for `select` / `radio`; empty for every other type. */
  options: string[];
}

/** Public shape of one event's registration form. */
export interface EventRegistrationForm {
  id: string;
  eventId: string;
  fields: RegistrationField[];
  /** When false the form renders closed and submissions are refused. */
  isOpen: boolean;
  intro: string;
  successMessage: string;
  updatedAt: string;
}

/** One answer as stored on a submission — the label is snapshotted. */
export interface RegistrationAnswer {
  key: string;
  label: string;
  value: string;
}

/** Admin shape of one submitted registration. */
export interface EventRegistrationItem {
  id: string;
  eventId: string;
  answers: RegistrationAnswer[];
  name: string;
  /** Empty when the form has no email field. */
  email: string;
  isReviewed: boolean;
  createdAt: string;
}

/** The slice of an event the registration page renders in its header. */
export interface RegistrationEventSummary {
  id: string;
  slug: string;
  title: string;
  date: string;
  time: string;
  venue: string;
  city: string;
  category: string;
}

/** Everything the public registration page loads, in one payload. */
export interface EventRegistrationPage {
  event: RegistrationEventSummary;
  form: EventRegistrationForm;
}

/** Payload the admin builder saves — the whole form in one atomic write. */
export interface UpdateEventFormInput {
  fields: RegistrationField[];
  isOpen?: boolean;
  intro?: string;
  successMessage?: string;
}

export interface RegistrationsPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface EventRegistrationsPage {
  items: EventRegistrationItem[];
  pagination: RegistrationsPagination;
}
