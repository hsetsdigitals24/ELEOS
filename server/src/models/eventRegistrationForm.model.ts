import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

/**
 * EventRegistrationForm — the registration form for exactly one event.
 *
 * One is created automatically the moment an admin adds an event (see
 * registration.service.ts), and the admin then owns it completely: any
 * field can be added, renamed, reordered or deleted, name and email
 * included. Because nothing is locked, dedupe and contactability are
 * *derived* from the form rather than assumed — the service keys off
 * whichever field happens to have type "email", and allows repeat
 * submissions when the form has none.
 *
 * `fields` is an ordered array: the array order is the display order.
 */

/** Everything a field can be. Kept in step with RegistrationFieldType. */
export const REGISTRATION_FIELD_TYPES = [
  "text",
  "textarea",
  "email",
  "tel",
  "number",
  "date",
  "select",
  "radio",
  "checkbox",
] as const;

const fieldSchema = new Schema(
  {
    /**
     * Stable identifier minted when the field is created; renaming the
     * label leaves this alone. Every stored answer references it.
     */
    key: {
      type: String,
      required: [true, "field key is required"],
      trim: true,
      maxlength: 40,
    },
    label: {
      type: String,
      required: [true, "field label is required"],
      trim: true,
      maxlength: 120,
    },
    type: {
      type: String,
      enum: REGISTRATION_FIELD_TYPES,
      default: "text",
    },
    placeholder: {
      type: String,
      trim: true,
      maxlength: 160,
      default: "",
    },
    /** Small hint rendered under the input. */
    helpText: {
      type: String,
      trim: true,
      maxlength: 400,
      default: "",
    },
    required: {
      type: Boolean,
      default: false,
    },
    /** Choices for `select` / `radio`; always empty for every other type. */
    options: {
      type: [String],
      default: [],
    },
  },
  { _id: false } // the `key` is the identity — no extra ObjectId needed
);

const eventRegistrationFormSchema = new Schema(
  {
    /** One form per event. */
    event: {
      type: Schema.Types.ObjectId,
      ref: "Event",
      required: [true, "event is required"],
      unique: true,
      index: true,
    },
    fields: {
      type: [fieldSchema],
      default: [],
    },
    /** The admin closes registration without losing what's collected. */
    isOpen: {
      type: Boolean,
      default: true,
    },
    /** Short blurb above the form, e.g. who the event is for. */
    intro: {
      type: String,
      trim: true,
      maxlength: 800,
      default: "",
    },
    successMessage: {
      type: String,
      trim: true,
      maxlength: 400,
      default: "",
    },
  },
  {
    timestamps: true, // createdAt / updatedAt
  }
);

export type EventRegistrationFormDocument = InferSchemaType<
  typeof eventRegistrationFormSchema
>;

interface EventRegistrationFormModel extends Model<EventRegistrationFormDocument> {
  // Placeholder for future statics.
}

export const EventRegistrationForm: EventRegistrationFormModel =
  (mongoose.models.EventRegistrationForm ??
    mongoose.model<EventRegistrationFormDocument, EventRegistrationFormModel>(
      "EventRegistrationForm",
      eventRegistrationFormSchema
    )) as EventRegistrationFormModel;
