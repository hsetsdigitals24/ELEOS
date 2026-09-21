"use client";

// components/admin/RolesTab.tsx — role management with a permissions
// checkbox grid. System roles (the seeded super-admin) are immutable, and
// roles still assigned to users can't be deleted — the server enforces
// both; the UI just reflects it.

import { useCallback, useEffect, useState } from "react";
import { Loader2, Pencil, Plus, RefreshCw, Shield, Trash2, X } from "lucide-react";
import { createRole, deleteRole, fetchRoles, updateRole } from "@/lib/api/roles";
import type { Permission, RoleItem } from "@/types/admin";
import {
  ErrorLine,
  ErrorSummary,
  FieldError,
  fieldClasses,
  fieldErrors,
  labelClasses,
} from "./consoleShared";

/** Every granular permission a role can carry (the super-admin wildcard is
 *  server-side only — regular roles pick from this list). */
const PERMISSION_OPTIONS: Array<{ value: Permission; label: string; hint: string }> = [
  { value: "broadcasts:manage", label: "Broadcasts", hint: "Live audio & video settings" },
  { value: "products:manage", label: "Products", hint: "Shop catalogue" },
  { value: "content:manage", label: "Media", hint: "Blog posts & videos" },
  { value: "events:manage", label: "Events", hint: "Upcoming events page" },
  { value: "messages:manage", label: "Messages", hint: "Contact-form inbox" },
  { value: "users:manage", label: "Users", hint: "Admin accounts" },
  { value: "roles:manage", label: "Roles", hint: "Roles & permissions" },
];

interface RoleFormState {
  name: string;
  permissions: string[];
}

export default function RolesTab() {
  const [roles, setRoles] = useState<RoleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<unknown>(null);
  const [editing, setEditing] = useState<RoleItem | "new" | null>(null);
  const [form, setForm] = useState<RoleFormState>({ name: "", permissions: [] });
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<unknown>(null);
  const [actionError, setActionError] = useState<unknown>(null);

  const load = useCallback(() => {
    fetchRoles()
      .then((roleList) => {
        setRoles(roleList);
        setLoadError(null);
        setLoading(false);
      })
      .catch((err: unknown) => {
        setLoadError(err);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const startCreate = () => {
    setEditing("new");
    setForm({ name: "", permissions: [] });
    setSaveError(null);
  };

  const startEdit = (role: RoleItem) => {
    setEditing(role);
    setForm({ name: role.name, permissions: [...role.permissions] });
    setSaveError(null);
  };

  const togglePermission = (permission: string, checked: boolean) => {
    setForm((current) => ({
      ...current,
      permissions: checked
        ? [...current.permissions, permission]
        : current.permissions.filter((p) => p !== permission),
    }));
  };

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setSaveError(null);
    try {
      const payload = { name: form.name.trim(), permissions: form.permissions };
      if (editing === "new") {
        await createRole(payload);
      } else if (editing) {
        await updateRole(editing.id, payload);
      }
      setEditing(null);
      load();
    } catch (err) {
      setSaveError(err);
    } finally {
      setSaving(false);
    }
  };

  const remove = async (role: RoleItem) => {
    if (!window.confirm(`Delete the role “${role.name}”?`)) return;
    setActionError(null);
    try {
      await deleteRole(role.id);
      load();
    } catch (err) {
      setActionError(err);
    }
  };

  // Field-keyed messages from the last rejected save, so each input can show
  // its own.
  const fieldIssues = fieldErrors(saveError);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between gap-4">
        <h3 className="font-display text-xl text-ink-900">
          Roles <span className="font-sans text-sm text-ink-500">({roles.length})</span>
        </h3>
        <button
          type="button"
          onClick={startCreate}
          className="inline-flex items-center gap-2 bg-brand-primary text-cream-50 px-5 py-2.5 text-[0.72rem] uppercase tracking-[0.15em] font-sans font-semibold rounded-sm hover:bg-brand-hover transition-colors duration-300"
        >
          <Plus size={13} aria-hidden="true" />
          Add role
        </button>
      </div>

      {actionError !== null && <ErrorLine error={actionError} />}

      {/* Create / edit form */}
      {editing !== null && (
        <form
          onSubmit={submit}
          className="border-2 border-brand-primary/40 bg-white rounded-md p-6 space-y-5"
        >
          <div className="flex items-center justify-between">
            <h4 className="font-display text-lg text-ink-900">
              {editing === "new" ? "New role" : `Editing — ${editing.name}`}
            </h4>
            <button
              type="button"
              onClick={() => setEditing(null)}
              aria-label="Close form"
              className="w-8 h-8 flex items-center justify-center rounded-sm text-ink-500 hover:text-brand-primary hover:bg-cream-100 transition-colors"
            >
              <X size={16} aria-hidden="true" />
            </button>
          </div>

          {saveError !== null && (
            <ErrorSummary error={saveError} what="save this role" />
          )}

          <div>
            <label htmlFor="r-name" className={labelClasses}>
              Role name <span className="text-brand-primary">*</span>
            </label>
            <input
              id="r-name"
              type="text"
              required
              minLength={2}
              maxLength={60}
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className={fieldClasses}
            />
            <FieldError errors={fieldIssues} field="name" />
          </div>

          <fieldset>
            <legend className={labelClasses}>Permissions</legend>
            <div className="grid sm:grid-cols-2 gap-3">
              {PERMISSION_OPTIONS.map((option) => (
                <label
                  key={option.value}
                  className="flex items-start gap-2.5 border border-ink-900/12 rounded-sm p-3 cursor-pointer hover:border-brand-primary/50 transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={form.permissions.includes(option.value)}
                    onChange={(e) => togglePermission(option.value, e.target.checked)}
                    className="mt-0.5 w-4 h-4 accent-[#e3221c]"
                  />
                  <span>
                    <span className="block font-sans text-sm font-semibold text-ink-900">
                      {option.label}
                    </span>
                    <span className="block font-sans text-xs text-ink-500">{option.hint}</span>
                  </span>
                </label>
              ))}
            </div>
            <FieldError errors={fieldIssues} field="permissions" />
          </fieldset>

          <div className="flex items-center gap-4">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 bg-brand-primary text-cream-50 px-6 py-2.5 text-[0.75rem] uppercase tracking-[0.15em] font-sans font-semibold rounded-sm hover:bg-brand-hover transition-colors duration-300 disabled:opacity-60"
            >
              {saving && <Loader2 size={13} className="animate-spin" aria-hidden="true" />}
              {editing === "new" ? "Create role" : "Save changes"}
            </button>
            <button
              type="button"
              onClick={() => setEditing(null)}
              className="font-sans text-xs uppercase tracking-[0.15em] font-semibold text-ink-500 hover:text-brand-primary transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* The list */}
      {loading ? (
        <div className="flex items-center gap-3 text-ink-500">
          <Loader2 size={18} className="animate-spin text-brand-primary" aria-hidden="true" />
          <span className="font-sans text-sm">Loading roles…</span>
        </div>
      ) : loadError !== null ? (
        <div className="space-y-4">
          <ErrorLine error={loadError} />
          <button
            type="button"
            onClick={load}
            className="inline-flex items-center gap-2 text-brand-primary text-xs uppercase tracking-[0.15em] font-sans font-semibold"
          >
            <RefreshCw size={13} aria-hidden="true" /> Try again
          </button>
        </div>
      ) : (
        <ul className="divide-y divide-ink-900/10 border-y border-ink-900/10">
          {roles.map((role) => (
            <li key={role.id} className="py-4 flex items-center gap-4">
              <span className="w-10 h-10 rounded-sm bg-cream-200 shrink-0 flex items-center justify-center text-ink-700">
                <Shield size={18} strokeWidth={1.5} aria-hidden="true" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-sans text-sm font-semibold text-ink-900">
                  {role.name}
                  {role.isSystem && (
                    <span className="ml-2 text-xs text-ink-500 font-normal">
                      System role — full access
                    </span>
                  )}
                </p>
                <p className="font-sans text-xs text-ink-500 truncate">
                  {role.permissions.includes("*")
                    ? "All permissions"
                    : role.permissions.length === 0
                      ? "No permissions"
                      : role.permissions.join(" · ")}
                </p>
              </div>
              <button
                type="button"
                onClick={() => startEdit(role)}
                disabled={role.isSystem}
                title={role.isSystem ? "System roles can't be edited" : "Edit"}
                aria-label={`Edit ${role.name}`}
                className="w-9 h-9 flex items-center justify-center rounded-sm border border-ink-900/15 text-ink-700 hover:border-brand-primary hover:text-brand-primary transition-colors disabled:opacity-40 disabled:hover:border-ink-900/15 disabled:hover:text-ink-700"
              >
                <Pencil size={14} aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={() => void remove(role)}
                disabled={role.isSystem}
                title={role.isSystem ? "System roles can't be deleted" : "Delete"}
                aria-label={`Delete ${role.name}`}
                className="w-9 h-9 flex items-center justify-center rounded-sm border border-ink-900/15 text-ink-700 hover:border-brand-primary hover:text-brand-primary transition-colors disabled:opacity-40 disabled:hover:border-ink-900/15 disabled:hover:text-ink-700"
              >
                <Trash2 size={14} aria-hidden="true" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
