"use client";

// components/admin/EventFormBuilder.tsx — the registration-form builder.
//
// Fully controlled: it takes a field list and reports every edit back, so
// the caller owns saving and this stays reusable. Fields are collapsed to a
// one-line summary by default — a form can carry 40 of them, and an admin
// managing several events needs to find one without scrolling past the rest.

import { useState } from "react";
import {
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import {
  ErrorSummary,
  FieldError,
  fieldClasses,
  fieldErrors,
  labelClasses,
} from "./consoleShared";
import { FIELD_TYPE_LABELS, FIELD_TYPES, blankField, hasOptions } from "@/lib/registration";
import type { RegistrationField, RegistrationFieldType } from "@/types/registration";
import RegistrationFields from "@/components/registration/RegistrationFields";

interface EventFormBuilderProps {
  fields: RegistrationField[];
  onChange: (fields: RegistrationField[]) => void;
  /** Field-key → message, from a failed save. */
  errors?: unknown;
}

export default function EventFormBuilder({
  fields,
  onChange,
  errors,
}: EventFormBuilderProps) {
  // Tracks collapsed cards rather than expanded ones, so a field the admin
  // just added opens ready to edit.
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
  const [previewOpen, setPreviewOpen] = useState(false);
  // Preview answers are scratch — they mirror what a visitor would type and
  // never leave this component.
  const [previewValues, setPreviewValues] = useState<Record<string, string>>({});

  const toggle = (key: string) => {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const replace = (index: number, patch: Partial<RegistrationField>) => {
    onChange(fields.map((field, i) => (i === index ? { ...field, ...patch } : field)));
  };

  const move = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= fields.length) return;
    const next = [...fields];
    const [moved] = next.splice(index, 1);
    next.splice(target, 0, moved);
    onChange(next);
  };

  const remove = (index: number) => {
    onChange(fields.filter((_, i) => i !== index));
  };

  const add = (type: RegistrationFieldType) => {
    onChange([...fields, blankField(type)]);
  };

  const changeType = (index: number, type: RegistrationFieldType) => {
    // Choices only mean something for select/radio — the server clears them
    // for every other type, so the editor clears them here too rather than
    // showing choices that are about to be dropped.
    replace(index, {
      type,
      options: hasOptions(type) ? (fields[index].options.length > 0 ? fields[index].options : [""]) : [],
    });
  };

  const hasEmailField = fields.some((field) => field.type === "email");

  // Field-keyed messages from the last rejected save. The server reports these
  // against the request body, so a problem with the third field's label comes
  // back as `fields.2.label` — matching the index we render from.
  const fieldIssues = fieldErrors(errors);

  return (
    <div className="space-y-5">
      {errors !== undefined && errors !== null && (
        <ErrorSummary error={errors} what="save this form" />
      )}

      {fields.length === 0 ? (
        <p className="font-sans text-sm text-ink-500 py-4">
          This form has no fields yet — add the first one below, or the form will
          render empty on the site.
        </p>
      ) : (
        <ul className="space-y-3">
          {fields.map((field, index) => {
            const isCollapsed = collapsed.has(field.key);
            const optionsBroken = hasOptions(field.type) && field.options.every((o) => !o.trim());

            return (
              <li
                key={field.key}
                className={`border rounded-md bg-white ${
                  optionsBroken ? "border-brand-primary/50" : "border-ink-900/12"
                }`}
              >
                {/* Summary row */}
                <div className="flex items-center gap-3 p-4">
                  <button
                    type="button"
                    onClick={() => toggle(field.key)}
                    aria-expanded={!isCollapsed}
                    className="min-w-0 flex-1 text-left flex items-center gap-3"
                  >
                    {isCollapsed ? (
                      <ChevronDown size={15} className="text-ink-500 shrink-0" aria-hidden="true" />
                    ) : (
                      <ChevronUp size={15} className="text-ink-500 shrink-0" aria-hidden="true" />
                    )}
                    <span className="min-w-0">
                      <span className="block font-sans text-sm font-semibold text-ink-900 truncate">
                        {field.label || "Untitled field"}
                        {field.required && <span className="text-brand-primary"> *</span>}
                      </span>
                      <span className="block font-sans text-xs text-ink-500">
                        {FIELD_TYPE_LABELS[field.type]}
                        {hasOptions(field.type) &&
                          ` · ${field.options.filter((o) => o.trim()).length} choices`}
                      </span>
                    </span>
                  </button>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => move(index, -1)}
                      disabled={index === 0}
                      aria-label={`Move ${field.label || "field"} up`}
                      className="w-8 h-8 flex items-center justify-center rounded-sm border border-ink-900/15 text-ink-700 hover:border-brand-primary hover:text-brand-primary transition-colors disabled:opacity-30 disabled:hover:border-ink-900/15 disabled:hover:text-ink-700"
                    >
                      <ChevronUp size={13} aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      onClick={() => move(index, 1)}
                      disabled={index === fields.length - 1}
                      aria-label={`Move ${field.label || "field"} down`}
                      className="w-8 h-8 flex items-center justify-center rounded-sm border border-ink-900/15 text-ink-700 hover:border-brand-primary hover:text-brand-primary transition-colors disabled:opacity-30 disabled:hover:border-ink-900/15 disabled:hover:text-ink-700"
                    >
                      <ChevronDown size={13} aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      onClick={() => remove(index)}
                      aria-label={`Delete ${field.label || "field"}`}
                      className="w-8 h-8 flex items-center justify-center rounded-sm border border-ink-900/15 text-ink-700 hover:border-brand-primary hover:text-brand-primary transition-colors"
                    >
                      <Trash2 size={13} aria-hidden="true" />
                    </button>
                  </div>
                </div>

                {/* Editor */}
                {!isCollapsed && (
                  <div className="px-4 pb-4 pt-1 border-t border-ink-900/10 space-y-4">
                    <div className="grid sm:grid-cols-2 gap-4 pt-3">
                      <div>
                        <label htmlFor={`f-label-${field.key}`} className={labelClasses}>
                          Label <span className="text-brand-primary">*</span>
                        </label>
                        <input
                          id={`f-label-${field.key}`}
                          type="text"
                          value={field.label}
                          onChange={(e) => replace(index, { label: e.target.value })}
                          placeholder="e.g. Organisation"
                          maxLength={120}
                          className={fieldClasses}
                        />
                        <FieldError errors={fieldIssues} field={`fields.${index}.label`} />
                      </div>
                      <div>
                        <label htmlFor={`f-type-${field.key}`} className={labelClasses}>
                          Type
                        </label>
                        <select
                          id={`f-type-${field.key}`}
                          value={field.type}
                          onChange={(e) => changeType(index, e.target.value as RegistrationFieldType)}
                          className={fieldClasses}
                        >
                          {FIELD_TYPES.map((type) => (
                            <option key={type} value={type}>
                              {FIELD_TYPE_LABELS[type]}
                            </option>
                          ))}
                        </select>
                        <FieldError errors={fieldIssues} field={`fields.${index}.type`} />
                      </div>
                      <div>
                        <label htmlFor={`f-placeholder-${field.key}`} className={labelClasses}>
                          Placeholder
                        </label>
                        <input
                          id={`f-placeholder-${field.key}`}
                          type="text"
                          value={field.placeholder}
                          onChange={(e) => replace(index, { placeholder: e.target.value })}
                          maxLength={160}
                          className={fieldClasses}
                        />
                        <FieldError errors={fieldIssues} field={`fields.${index}.placeholder`} />
                      </div>
                      <div>
                        <label htmlFor={`f-help-${field.key}`} className={labelClasses}>
                          Help text
                        </label>
                        <input
                          id={`f-help-${field.key}`}
                          type="text"
                          value={field.helpText}
                          onChange={(e) => replace(index, { helpText: e.target.value })}
                          maxLength={400}
                          className={fieldClasses}
                        />
                        <FieldError errors={fieldIssues} field={`fields.${index}.helpText`} />
                      </div>
                    </div>

                    {hasOptions(field.type) && (
                      <div>
                        <span className={labelClasses}>Choices</span>
                        <div className="space-y-2">
                          {field.options.map((option, optionIndex) => (
                            <div key={optionIndex} className="flex items-center gap-2">
                              <input
                                type="text"
                                value={option}
                                onChange={(e) =>
                                  replace(index, {
                                    options: field.options.map((o, i) =>
                                      i === optionIndex ? e.target.value : o
                                    ),
                                  })
                                }
                                placeholder={`Choice ${optionIndex + 1}`}
                                maxLength={120}
                                aria-label={`Choice ${optionIndex + 1} for ${field.label || "field"}`}
                                className={fieldClasses}
                              />
                              <button
                                type="button"
                                onClick={() =>
                                  replace(index, {
                                    options: field.options.filter((_, i) => i !== optionIndex),
                                  })
                                }
                                aria-label={`Remove choice ${optionIndex + 1}`}
                                className="w-9 h-9 shrink-0 flex items-center justify-center rounded-sm border border-ink-900/15 text-ink-700 hover:border-brand-primary hover:text-brand-primary transition-colors"
                              >
                                <X size={13} aria-hidden="true" />
                              </button>
                            </div>
                          ))}
                        </div>
                        <button
                          type="button"
                          onClick={() => replace(index, { options: [...field.options, ""] })}
                          className="mt-2.5 inline-flex items-center gap-1.5 text-brand-primary text-xs uppercase tracking-[0.12em] font-sans font-semibold"
                        >
                          <Plus size={12} aria-hidden="true" /> Add choice
                        </button>
                        <FieldError errors={fieldIssues} field={`fields.${index}.options`} />
                      </div>
                    )}

                    <div>
                      <label className="inline-flex items-center gap-2.5 font-sans text-sm text-ink-700 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={field.required}
                          onChange={(e) => replace(index, { required: e.target.checked })}
                          className="w-4 h-4 accent-[#e3221c]"
                        />
                        Required — the visitor can&rsquo;t submit without it
                      </label>
                      <FieldError errors={fieldIssues} field={`fields.${index}.required`} />
                    </div>

                    {optionsBroken && (
                      <p className="font-sans text-xs text-brand-primary">
                        Add at least one choice — a {FIELD_TYPE_LABELS[field.type].toLowerCase()}{" "}
                        field with no options can&rsquo;t be saved.
                      </p>
                    )}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}

      {/* Palette */}
      <div className="border border-dashed border-ink-900/20 rounded-md p-4">
        <p className={labelClasses}>Add a field</p>
        <div className="flex flex-wrap gap-2">
          {FIELD_TYPES.map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => add(type)}
              className="inline-flex items-center gap-1.5 border border-ink-900/20 text-ink-700 px-3.5 py-2 text-[0.7rem] uppercase tracking-[0.12em] font-sans font-semibold rounded-sm hover:border-brand-primary hover:text-brand-primary transition-colors duration-300"
            >
              <Plus size={12} aria-hidden="true" />
              {FIELD_TYPE_LABELS[type]}
            </button>
          ))}
        </div>
      </div>

      {!hasEmailField && fields.length > 0 && (
        <p className="flex items-start gap-2 font-sans text-sm text-ink-700">
          <AlertTriangle size={15} className="shrink-0 mt-0.5 text-brand-primary" aria-hidden="true" />
          <span>
            This form has no <span className="font-semibold">Email</span> field. Duplicate
            registrations can&rsquo;t be detected without one, and there&rsquo;s no address to
            reply to.
          </span>
        </p>
      )}

      {/* Live preview — the same renderer the public page uses, so what the
          admin sees here is literally what a visitor gets. */}
      {fields.length > 0 && (
        <div className="border border-ink-900/12 rounded-md bg-cream-100">
          <button
            type="button"
            onClick={() => setPreviewOpen((open) => !open)}
            aria-expanded={previewOpen}
            className="w-full flex items-center justify-between gap-3 p-4 text-left"
          >
            <span className="flex items-center gap-2.5">
              {previewOpen ? (
                <EyeOff size={15} className="text-ink-500" aria-hidden="true" />
              ) : (
                <Eye size={15} className="text-ink-500" aria-hidden="true" />
              )}
              <span className="font-sans text-xs uppercase tracking-[0.12em] font-semibold text-ink-700">
                {previewOpen ? "Hide preview" : "Preview as a visitor"}
              </span>
            </span>
            <span className="font-sans text-xs text-ink-500">
              {fields.length} {fields.length === 1 ? "field" : "fields"}
            </span>
          </button>

          {previewOpen && (
            <div className="px-4 pb-4">
              <div className="bg-white border border-ink-900/12 rounded-md p-5">
                <RegistrationFields
                  fields={fields}
                  values={previewValues}
                  onChange={(key, value) =>
                    setPreviewValues((prev) => ({ ...prev, [key]: value }))
                  }
                  idPrefix="preview"
                />
              </div>
              <p className="mt-2.5 font-sans text-xs text-ink-500">
                Nothing typed here is saved — it&rsquo;s just a rehearsal.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
