// lib/registration.ts — runtime helpers for event registration forms: the
// field-type vocabulary, the per-type limits, and the client-side validator.
//
// validateRegistrationAnswers is a deliberate MIRROR of the server's
// validateAnswer (server/src/services/registration.service.ts) — same rules,
// same wording. The API stays the authority; this just catches a typo before
// the round-trip, exactly as ContactIndex.tsx mirrors the contact rules.

import type {
  EventRegistrationForm,
  RegistrationField,
  RegistrationFieldType,
} from "@/types/registration";

/** The label shown next to each type in the builder's palette. */
export const FIELD_TYPE_LABELS: Record<RegistrationFieldType, string> = {
  text: "Short text",
  textarea: "Long text",
  email: "Email",
  tel: "Phone",
  number: "Number",
  date: "Date",
  select: "Dropdown",
  radio: "Radio buttons",
  checkbox: "Checkbox",
};

/** Palette order — most-used first. */
export const FIELD_TYPES: ReadonlyArray<RegistrationFieldType> = [
  "text",
  "textarea",
  "email",
  "tel",
  "number",
  "date",
  "select",
  "radio",
  "checkbox",
];

/** The two types whose meaning depends on a list of choices. */
export const OPTION_FIELD_TYPES: ReadonlyArray<RegistrationFieldType> = ["select", "radio"];

/** True when the field needs a list of choices to mean anything. */
export function hasOptions(type: RegistrationFieldType): boolean {
  return OPTION_FIELD_TYPES.includes(type);
}

/** Per-type ceilings — mirrors the server's MAX_LENGTH map. */
export const FIELD_MAX_LENGTH: Record<RegistrationFieldType, number> = {
  text: 200,
  textarea: 2000,
  email: 254,
  tel: 40,
  number: 40,
  date: 40,
  select: 120,
  radio: 120,
  checkbox: 5,
};

/** The `<input type>` a simple field maps onto. */
export function inputTypeFor(type: RegistrationFieldType): string {
  switch (type) {
    case "email":
      return "email";
    case "tel":
      return "tel";
    case "number":
      return "number";
    case "date":
      return "date";
    default:
      return "text";
  }
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Checks one answer against its field. Returns a message, or null if fine. */
export function validateRegistrationAnswer(
  field: RegistrationField,
  raw: string
): string | null {
  const value = (raw ?? "").trim();

  if (value.length === 0) {
    return field.required ? `${field.label} is required` : null;
  }
  if (value.length > FIELD_MAX_LENGTH[field.type]) {
    return `${field.label} must be at most ${FIELD_MAX_LENGTH[field.type]} characters`;
  }

  switch (field.type) {
    case "email":
      return EMAIL_PATTERN.test(value) ? null : `${field.label} must be a valid email address`;
    case "number":
      return Number.isFinite(Number(value)) ? null : `${field.label} must be a number`;
    case "date":
      return Number.isNaN(Date.parse(value)) ? `${field.label} must be a date` : null;
    case "select":
    case "radio":
      return field.options.includes(value) ? null : `${field.label} has an unrecognised choice`;
    case "checkbox":
      return value === "true" || value === "false"
        ? null
        : `${field.label} must be answered yes or no`;
    default:
      return null;
  }
}

/** Runs every field. Empty map means the form is good to send. */
export function validateRegistrationAnswers(
  form: EventRegistrationForm,
  values: Record<string, string>
): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const field of form.fields) {
    const message = validateRegistrationAnswer(field, values[field.key] ?? "");
    if (message !== null) errors[field.key] = message;
  }
  return errors;
}

/** The form's email field, if the admin gave it one — the dedupe key. */
export function emailFieldOf(form: EventRegistrationForm): RegistrationField | undefined {
  return form.fields.find((field) => field.type === "email");
}

/**
 * The field the server reads a registrant's display name from. Mirrors
 * `submitRegistration` (server/src/services/registration.service.ts), which
 * takes the first short-text field. The responses table uses this to avoid
 * printing the same answer twice — once as the row's "who", once as a column.
 */
export function nameFieldOf(form: EventRegistrationForm): RegistrationField | undefined {
  return form.fields.find((field) => field.type === "text");
}

/**
 * Mints a stable key for a new field. Deliberately random rather than
 * derived from the label: renaming a field later must not change the key,
 * since stored answers reference it.
 */
export function newFieldKey(): string {
  const random = Math.random().toString(36).slice(2, 10);
  return `f_${random}`;
}

/** A blank field of the given type, ready for the builder to edit. */
export function blankField(type: RegistrationFieldType): RegistrationField {
  return {
    key: newFieldKey(),
    label: "",
    type,
    placeholder: "",
    helpText: "",
    required: false,
    options: hasOptions(type) ? [""] : [],
  };
}
