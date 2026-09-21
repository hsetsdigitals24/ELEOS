"use client";

// components/admin/UsersTab.tsx — admin-user management. Create (with an
// optional password — omit it and the person is emailed a set-password
// link), rename, re-role, activate/deactivate, delete, and send password
// reset emails. The server enforces the self/last-super-admin guards.

import { useCallback, useEffect, useState } from "react";
import {
  KeyRound,
  Loader2,
  Mail,
  Plus,
  RefreshCw,
  ShieldCheck,
  Trash2,
  UserRound,
  X,
} from "lucide-react";
import { createUser, deleteUser, fetchUsers, sendUserPasswordReset, updateUser } from "@/lib/api/users";
import { fetchRoles } from "@/lib/api/roles";
import type { AdminUserItem, RoleItem } from "@/types/admin";
import {
  ErrorLine,
  ErrorSummary,
  FieldError,
  fieldClasses,
  fieldErrors,
  labelClasses,
  StatusLine,
} from "./consoleShared";

interface UserFormState {
  name: string;
  email: string;
  password: string;
  roleId: string;
}

export default function UsersTab({ currentUserId }: { currentUserId: string }) {
  const [users, setUsers] = useState<AdminUserItem[]>([]);
  const [roles, setRoles] = useState<RoleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<unknown>(null);
  const [form, setForm] = useState<UserFormState | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<unknown>(null);
  const [actionError, setActionError] = useState<unknown>(null);
  const [notice, setNotice] = useState("");

  const load = useCallback(() => {
    Promise.all([fetchUsers(), fetchRoles()])
      .then(([userList, roleList]) => {
        setUsers(userList);
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
    setNotice("");
    setActionError(null);
    setForm({ name: "", email: "", password: "", roleId: roles[0]?.id ?? "" });
    setSaveError(null);
  };

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!form) return;
    setSaving(true);
    setSaveError(null);
    try {
      await createUser({
        name: form.name.trim(),
        email: form.email.trim(),
        roleId: form.roleId,
        // Blank password → the new admin is emailed a set-password link.
        ...(form.password ? { password: form.password } : {}),
      });
      setForm(null);
      setNotice(
        form.password
          ? "Admin created."
          : "Admin created — a set-password link has been emailed to them."
      );
      load();
    } catch (err) {
      setSaveError(err);
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (user: AdminUserItem) => {
    setNotice("");
    setActionError(null);
    try {
      await updateUser(user.id, { isActive: !user.isActive });
      load();
    } catch (err) {
      setActionError(err);
    }
  };

  const changeRole = async (user: AdminUserItem, roleId: string) => {
    if (!roleId || roleId === user.role.id) return;
    setNotice("");
    setActionError(null);
    try {
      await updateUser(user.id, { roleId });
      load();
    } catch (err) {
      setActionError(err);
    }
  };

  const remove = async (user: AdminUserItem) => {
    if (!window.confirm(`Delete the admin account for ${user.name}?`)) return;
    setNotice("");
    setActionError(null);
    try {
      await deleteUser(user.id);
      load();
    } catch (err) {
      setActionError(err);
    }
  };

  const sendReset = async (user: AdminUserItem) => {
    setNotice("");
    setActionError(null);
    try {
      await sendUserPasswordReset(user.id);
      setNotice(`A password-reset link has been emailed to ${user.email}.`);
    } catch (err) {
      setActionError(err);
    }
  };

  // Field-keyed messages from the last rejected create, so each input can
  // show its own.
  const fieldIssues = fieldErrors(saveError);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between gap-4">
        <h3 className="font-display text-xl text-ink-900">
          Admin users{" "}
          <span className="font-sans text-sm text-ink-500">({users.length})</span>
        </h3>
        <button
          type="button"
          onClick={startCreate}
          className="inline-flex items-center gap-2 bg-brand-primary text-cream-50 px-5 py-2.5 text-[0.72rem] uppercase tracking-[0.15em] font-sans font-semibold rounded-sm hover:bg-brand-hover transition-colors duration-300"
        >
          <Plus size={13} aria-hidden="true" />
          Add admin
        </button>
      </div>

      {notice && <StatusLine kind="ok">{notice}</StatusLine>}
      {actionError !== null && <ErrorLine error={actionError} />}

      {/* Create form */}
      {form !== null && (
        <form
          onSubmit={submit}
          className="border-2 border-brand-primary/40 bg-white rounded-md p-6 space-y-5"
        >
          <div className="flex items-center justify-between">
            <h4 className="font-display text-lg text-ink-900">New admin</h4>
            <button
              type="button"
              onClick={() => setForm(null)}
              aria-label="Close form"
              className="w-8 h-8 flex items-center justify-center rounded-sm text-ink-500 hover:text-brand-primary hover:bg-cream-100 transition-colors"
            >
              <X size={16} aria-hidden="true" />
            </button>
          </div>

          {saveError !== null && (
            <ErrorSummary error={saveError} what="create this admin" />
          )}

          <div className="grid sm:grid-cols-2 gap-5">
            <div>
              <label htmlFor="u-name" className={labelClasses}>
                Name <span className="text-brand-primary">*</span>
              </label>
              <input
                id="u-name"
                type="text"
                required
                minLength={2}
                maxLength={80}
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className={fieldClasses}
              />
              <FieldError errors={fieldIssues} field="name" />
            </div>
            <div>
              <label htmlFor="u-email" className={labelClasses}>
                Email <span className="text-brand-primary">*</span>
              </label>
              <input
                id="u-email"
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className={fieldClasses}
              />
              <FieldError errors={fieldIssues} field="email" />
            </div>
            <div>
              <label htmlFor="u-role" className={labelClasses}>
                Role <span className="text-brand-primary">*</span>
              </label>
              <select
                id="u-role"
                required
                value={form.roleId}
                onChange={(e) => setForm({ ...form, roleId: e.target.value })}
                className={fieldClasses}
              >
                {roles.map((role) => (
                  <option key={role.id} value={role.id}>
                    {role.name}
                  </option>
                ))}
              </select>
              <FieldError errors={fieldIssues} field="roleId" />
            </div>
            <div>
              <label htmlFor="u-password" className={labelClasses}>
                Password <span className="text-ink-500 normal-case tracking-normal">(optional)</span>
              </label>
              <input
                id="u-password"
                type="password"
                minLength={8}
                autoComplete="new-password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="Leave blank to email a set-password link"
                className={fieldClasses}
              />
              <FieldError errors={fieldIssues} field="password" />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 bg-brand-primary text-cream-50 px-6 py-2.5 text-[0.75rem] uppercase tracking-[0.15em] font-sans font-semibold rounded-sm hover:bg-brand-hover transition-colors duration-300 disabled:opacity-60"
            >
              {saving && <Loader2 size={13} className="animate-spin" aria-hidden="true" />}
              Create admin
            </button>
            <button
              type="button"
              onClick={() => setForm(null)}
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
          <span className="font-sans text-sm">Loading admins…</span>
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
          {users.map((user) => {
            const isSelf = user.id === currentUserId;
            return (
              <li key={user.id} className="py-4 flex flex-wrap items-center gap-4">
                <span className="w-10 h-10 rounded-sm bg-cream-200 shrink-0 flex items-center justify-center text-ink-700">
                  <UserRound size={18} strokeWidth={1.5} aria-hidden="true" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-sans text-sm font-semibold text-ink-900 truncate">
                    {user.name}
                    {isSelf && (
                      <span className="ml-2 text-xs text-ink-500 font-normal">(you)</span>
                    )}
                    {!user.isActive && (
                      <span className="ml-2 text-xs text-brand-primary font-semibold">
                        Inactive
                      </span>
                    )}
                  </p>
                  <p className="font-sans text-xs text-ink-500 truncate">{user.email}</p>
                </div>

                {/* Role — inline select */}
                <label className="sr-only" htmlFor={`role-${user.id}`}>
                  Role for {user.name}
                </label>
                <select
                  id={`role-${user.id}`}
                  value={user.role.id}
                  disabled={isSelf}
                  onChange={(e) => void changeRole(user, e.target.value)}
                  title={isSelf ? "You can't change your own role" : undefined}
                  className="bg-cream-50 border border-ink-900/20 rounded-sm px-2.5 py-1.5 font-sans text-xs text-ink-900 outline-none focus:border-brand-primary disabled:opacity-50"
                >
                  {roles.map((role) => (
                    <option key={role.id} value={role.id}>
                      {role.name}
                    </option>
                  ))}
                </select>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => void toggleActive(user)}
                    disabled={isSelf}
                    title={
                      isSelf
                        ? "You can't deactivate your own account"
                        : user.isActive
                          ? "Deactivate"
                          : "Activate"
                    }
                    aria-label={user.isActive ? `Deactivate ${user.name}` : `Activate ${user.name}`}
                    className="w-9 h-9 flex items-center justify-center rounded-sm border border-ink-900/15 text-ink-700 hover:border-brand-primary hover:text-brand-primary transition-colors disabled:opacity-40 disabled:hover:border-ink-900/15 disabled:hover:text-ink-700"
                  >
                    <ShieldCheck size={14} aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    onClick={() => void sendReset(user)}
                    aria-label={`Send password reset email to ${user.name}`}
                    title="Send password reset email"
                    className="w-9 h-9 flex items-center justify-center rounded-sm border border-ink-900/15 text-ink-700 hover:border-brand-primary hover:text-brand-primary transition-colors"
                  >
                    <Mail size={14} aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    onClick={() => void remove(user)}
                    disabled={isSelf}
                    title={isSelf ? "You can't delete your own account" : "Delete"}
                    aria-label={`Delete ${user.name}`}
                    className="w-9 h-9 flex items-center justify-center rounded-sm border border-ink-900/15 text-ink-700 hover:border-brand-primary hover:text-brand-primary transition-colors disabled:opacity-40 disabled:hover:border-ink-900/15 disabled:hover:text-ink-700"
                  >
                    <Trash2 size={14} aria-hidden="true" />
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <p className="flex items-center gap-2 font-sans text-xs text-ink-500">
        <KeyRound size={13} aria-hidden="true" />
        Leave the password blank when adding an admin and they&rsquo;ll receive an email
        link to choose their own.
      </p>
    </div>
  );
}
