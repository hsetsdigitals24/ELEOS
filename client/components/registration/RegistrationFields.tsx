"use client";

// components/registration/RegistrationFields.tsx — turns a registration
// form's field definitions into inputs.
//
// This is the single renderer for the whole feature: the PUBLIC form page
// and the admin builder's live preview both go through it, so the admin is
// always looking at exactly what a visitor will get. Field styling follows
// the contact form's idiom (ContactIndex.tsx) — cream field, brand-red
// border on error.

import type { RegistrationField } from "@/types/registration";
import { FIELD_MAX_LENGTH, inputTypeFor } from "@/lib/registration";

export const registrationInputClasses =
  "w-full bg-cream-50 border border-ink-900/20 rounded-sm px-4 py-3 font-sans text-sm text-ink-900 placeholder:text-ink-500/60 outline-none transition-colors duration-300 focus:border-brand-primary";

const labelClasses =
  "block font-sans text-xs uppercase tracking-[0.12em] font-semibold text-ink-700";

interface RegistrationFieldsProps {
  fields: RegistrationField[];
  values: Record<string, string>;
  /** Field key → message. Rendered under the matching control. */
  errors?: Record<string, string>;
  onChange: (key: string, value: string) => void;
  /**
   * Disambiguates input ids when the same form is on screen twice — the
   * builder renders a preview beside the editor.
   */
  idPrefix?: string;
  disabled?: boolean;
}

/** The question, its required marker and any help text. */
function FieldLabel({ field, htmlFor }: { field: RegistrationField; htmlFor: string }) {
  return (
    <div className="mb-2">
      <label htmlFor={htmlFor} className={labelClasses}>
        {field.label}{" "}
        {field.required ? (
          <span className="text-brand-primary">*</span>
        ) : (
          <span className="text-ink-500 font-normal">(optional)</span>
        )}
      </label>
      {field.helpText && (
        <p className="mt-1 font-sans text-xs text-ink-500">{field.helpText}</p>
      )}
    </div>
  );
}

function ErrorText({ message }: { message: string }) {
  return <p className="mt-1.5 font-sans text-xs text-brand-primary">{message}</p>;
}

export default function RegistrationFields({
  fields,
  values,
  errors = {},
  onChange,
  idPrefix = "reg",
  disabled = false,
}: RegistrationFieldsProps) {
  return (
    <div className="space-y-5">
      {fields.map((field) => {
        const id = `${idPrefix}-${field.key}`;
        const value = values[field.key] ?? "";
        const error = errors[field.key];
        const classes = `${registrationInputClasses} ${error ? "border-brand-primary" : ""}`;

        // A single checkbox carries its own label beside the box, so it
        // breaks out of the label-above-control shape used by everything else.
        if (field.type === "checkbox") {
          return (
            <div key={field.key}>
              <label className="flex items-start gap-2.5 font-sans text-sm text-ink-700 cursor-pointer">
                <input
                  id={id}
                  type="checkbox"
                  checked={value === "true"}
                  disabled={disabled}
                  onChange={(e) => onChange(field.key, e.target.checked ? "true" : "false")}
                  aria-invalid={Boolean(error)}
                  className="mt-0.5 w-4 h-4 shrink-0 accent-[#e3221c]"
                />
                <span>
                  {field.label}
                  {field.required && <span className="text-brand-primary"> *</span>}
                  {field.helpText && (
                    <span className="block mt-0.5 font-sans text-xs text-ink-500">
                      {field.helpText}
                    </span>
                  )}
                </span>
              </label>
              {error && <ErrorText message={error} />}
            </div>
          );
        }

        return (
          <div key={field.key}>
            <FieldLabel field={field} htmlFor={id} />

            {field.type === "textarea" && (
              <textarea
                id={id}
                rows={5}
                value={value}
                disabled={disabled}
                placeholder={field.placeholder}
                maxLength={FIELD_MAX_LENGTH.textarea}
                onChange={(e) => onChange(field.key, e.target.value)}
                aria-invalid={Boolean(error)}
                className={`${classes} resize-y`}
              />
            )}

            {field.type === "select" && (
              <select
                id={id}
                value={value}
                disabled={disabled}
                onChange={(e) => onChange(field.key, e.target.value)}
                aria-invalid={Boolean(error)}
                className={classes}
              >
                <option value="">{field.placeholder || "Choose an option…"}</option>
                {field.options.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            )}

            {field.type === "radio" && (
              <div className="space-y-2.5" role="radiogroup" aria-labelledby={id}>
                {field.options.map((option) => (
                  <label
                    key={option}
                    className="flex items-center gap-2.5 font-sans text-sm text-ink-700 cursor-pointer"
                  >
                    <input
                      type="radio"
                      name={id}
                      value={option}
                      checked={value === option}
                      disabled={disabled}
                      onChange={() => onChange(field.key, option)}
                      className="w-4 h-4 shrink-0 accent-[#e3221c]"
                    />
                    {option}
                  </label>
                ))}
              </div>
            )}

            {field.type !== "textarea" && field.type !== "select" && field.type !== "radio" && (
              <input
                id={id}
                type={inputTypeFor(field.type)}
                value={value}
                disabled={disabled}
                placeholder={field.placeholder}
                maxLength={FIELD_MAX_LENGTH[field.type]}
                onChange={(e) => onChange(field.key, e.target.value)}
                aria-invalid={Boolean(error)}
                className={classes}
              />
            )}

            {error && <ErrorText message={error} />}
          </div>
        );
      })}
    </div>
  );
}
