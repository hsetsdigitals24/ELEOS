"use client";

// components/admin/AdminConsole.tsx — the internal admin console at /admin.
// A real signed-in session (httpOnly cookie) gates the console; the tabs the
// signed-in admin sees are filtered by their role's permissions, and the
// server enforces the same permissions on every endpoint regardless.

import { useCallback, useEffect, useRef, useState } from "react";
import {
  AlertCircle,
  CalendarDays,
  Check,
  Clapperboard,
  Inbox,
  KeyRound,
  Loader2,
  LogOut,
  Pencil,
  Plus,
  Radio,
  RefreshCw,
  Shield,
  ShoppingBag,
  Trash2,
  Users,
  X,
} from "lucide-react";
import {
  createProduct,
  deleteContactMessage,
  deleteProduct,
  fetchContactMessages,
  markContactMessageRead,
  updateBroadcastSettings,
  updateProduct,
} from "@/lib/api/admin";
import { fetchProducts } from "@/lib/api/products";
import { fetchBroadcastSettings } from "@/lib/api/broadcasts";
import { changePassword, fetchSession, logout } from "@/lib/api/auth";
import { onSessionExpired } from "@/lib/api/client";
import { formatMoney } from "@/lib/formatMoney";
import { formatLongDate } from "@/lib/formatDate";
import type {
  AudioBroadcastMedium,
  AudioBroadcastSettings,
  BroadcastSettings,
  VideoBroadcastSettings,
} from "@/types/broadcast";
import type { ContactMessageItem } from "@/types/contact";
import type { ProductItem } from "@/types/product";
import type { AuthSession } from "@/types/admin";
import SignInForm from "./SignInForm";
import UsersTab from "./UsersTab";
import RolesTab from "./RolesTab";
import MediaTab from "./MediaTab";
import EventsTab from "./EventsTab";
import RichTextEditor from "./RichTextEditor";
import {
  ErrorLine,
  ErrorSummary,
  FieldError,
  fieldClasses,
  fieldErrors,
  labelClasses,
  StatusLine,
} from "./consoleShared";

type Tab = "broadcasts" | "products" | "media" | "events" | "messages" | "users" | "roles";

/* ------------------------------------------------------------------ */
/* Broadcasts tab                                                      */
/* ------------------------------------------------------------------ */

const AUDIO_MEDIUMS: Array<{ value: AudioBroadcastMedium; label: string }> = [
  { value: "none", label: "None (off air)" },
  { value: "youtube", label: "YouTube (embedded player)" },
  { value: "mixlr", label: "Mixlr (embedded player)" },
  { value: "facebook", label: "Facebook (external link)" },
  { value: "external", label: "Other platform (external link)" },
];

function BroadcastsTab() {
  const [audio, setAudio] = useState<AudioBroadcastSettings | null>(null);
  const [video, setVideo] = useState<VideoBroadcastSettings | null>(null);
  const [loadError, setLoadError] = useState<unknown>(null);
  const [saving, setSaving] = useState<"audio" | "video" | null>(null);
  const [saved, setSaved] = useState<"audio" | "video" | null>(null);
  const [saveError, setSaveError] = useState<unknown>(null);

  const load = useCallback(() => {
    fetchBroadcastSettings()
      .then((settings: BroadcastSettings) => {
        setAudio(settings.audio);
        setVideo(settings.video);
        setLoadError(null);
      })
      .catch((err: unknown) => setLoadError(err));
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const save = (side: "audio" | "video") => {
    if (!audio || !video) return;
    setSaving(side);
    setSaved(null);
    setSaveError(null);
    updateBroadcastSettings(side === "audio" ? { audio } : { video })
      .then((settings: BroadcastSettings) => {
        setAudio(settings.audio);
        setVideo(settings.video);
        setSaved(side);
      })
      .catch((err: unknown) => setSaveError(err))
      .finally(() => setSaving(null));
  };

  if (loadError) {
    return (
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
    );
  }

  if (!audio || !video) {
    return (
      <div className="flex items-center gap-3 text-ink-500">
        <Loader2 size={18} className="animate-spin text-brand-primary" aria-hidden="true" />
        <span className="font-sans text-sm">Loading broadcast settings…</span>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {/* Audio */}
      <section className="border border-ink-900/12 bg-white rounded-md p-6 space-y-5">
        <h3 className="font-display text-xl text-ink-900">Live Audio Broadcast</h3>
        <div className="grid sm:grid-cols-2 gap-5">
          <div>
            <label htmlFor="audio-medium" className={labelClasses}>
              Broadcast medium
            </label>
            <select
              id="audio-medium"
              value={audio.medium}
              onChange={(e) =>
                setAudio({ ...audio, medium: e.target.value as AudioBroadcastMedium })
              }
              className={fieldClasses}
            >
              {AUDIO_MEDIUMS.map((medium) => (
                <option key={medium.value} value={medium.value}>
                  {medium.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="audio-url" className={labelClasses}>
              Broadcast URL
            </label>
            <input
              id="audio-url"
              type="url"
              value={audio.url}
              onChange={(e) => setAudio({ ...audio, url: e.target.value })}
              placeholder="https://…"
              className={fieldClasses}
            />
          </div>
          <div>
            <label htmlFor="audio-title" className={labelClasses}>
              Title
            </label>
            <input
              id="audio-title"
              type="text"
              value={audio.title}
              onChange={(e) => setAudio({ ...audio, title: e.target.value })}
              maxLength={160}
              className={fieldClasses}
            />
          </div>
          <div className="flex items-end pb-1">
            <label className="inline-flex items-center gap-2.5 font-sans text-sm text-ink-700 cursor-pointer">
              <input
                type="checkbox"
                checked={audio.isLive}
                onChange={(e) => setAudio({ ...audio, isLive: e.target.checked })}
                className="w-4 h-4 accent-[#e3221c]"
              />
              Mark as live now (shows the &ldquo;On air&rdquo; badge)
            </label>
          </div>
          <div className="sm:col-span-2">
            <RichTextEditor
              label="Description"
              value={audio.description}
              onChange={(html) => setAudio({ ...audio, description: html })}
              placeholder="What's on air…"
              minHeight="10rem"
            />
          </div>
        </div>
        {saved === "audio" && <StatusLine kind="ok">Audio broadcast updated.</StatusLine>}
        {saveError !== null && <ErrorLine error={saveError} />}
        <button
          type="button"
          onClick={() => save("audio")}
          disabled={saving !== null}
          className="inline-flex items-center gap-2 bg-brand-primary text-cream-50 px-6 py-2.5 text-[0.75rem] uppercase tracking-[0.15em] font-sans font-semibold rounded-sm hover:bg-brand-hover transition-colors duration-300 disabled:opacity-60"
        >
          {saving === "audio" && <Loader2 size={13} className="animate-spin" aria-hidden="true" />}
          Save audio settings
        </button>
      </section>

      {/* Video */}
      <section className="border border-ink-900/12 bg-white rounded-md p-6 space-y-5">
        <h3 className="font-display text-xl text-ink-900">Live Video Broadcast</h3>
        <p className="font-sans text-sm text-ink-500">
          Paste the YouTube link (watch, share, live or channel URL) — the site normalises it
          into the embedded player.
        </p>
        <div className="grid sm:grid-cols-2 gap-5">
          <div>
            <label htmlFor="video-url" className={labelClasses}>
              YouTube URL
            </label>
            <input
              id="video-url"
              type="url"
              value={video.url}
              onChange={(e) => setVideo({ ...video, url: e.target.value })}
              placeholder="https://youtube.com/watch?v=…"
              className={fieldClasses}
            />
          </div>
          <div>
            <label htmlFor="video-title" className={labelClasses}>
              Title
            </label>
            <input
              id="video-title"
              type="text"
              value={video.title}
              onChange={(e) => setVideo({ ...video, title: e.target.value })}
              maxLength={160}
              className={fieldClasses}
            />
          </div>
          <div className="flex items-end pb-1">
            <label className="inline-flex items-center gap-2.5 font-sans text-sm text-ink-700 cursor-pointer">
              <input
                type="checkbox"
                checked={video.isLive}
                onChange={(e) => setVideo({ ...video, isLive: e.target.checked })}
                className="w-4 h-4 accent-[#e3221c]"
              />
              Mark as live now (shows the &ldquo;Streaming now&rdquo; badge)
            </label>
          </div>
          <div className="sm:col-span-2">
            <RichTextEditor
              label="Description"
              value={video.description}
              onChange={(html) => setVideo({ ...video, description: html })}
              placeholder="What's streaming…"
              minHeight="10rem"
            />
          </div>
        </div>
        {saved === "video" && <StatusLine kind="ok">Video broadcast updated.</StatusLine>}
        {saveError !== null && <ErrorLine error={saveError} />}
        <button
          type="button"
          onClick={() => save("video")}
          disabled={saving !== null}
          className="inline-flex items-center gap-2 bg-brand-primary text-cream-50 px-6 py-2.5 text-[0.75rem] uppercase tracking-[0.15em] font-sans font-semibold rounded-sm hover:bg-brand-hover transition-colors duration-300 disabled:opacity-60"
        >
          {saving === "video" && <Loader2 size={13} className="animate-spin" aria-hidden="true" />}
          Save video settings
        </button>
      </section>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Products tab                                                        */
/* ------------------------------------------------------------------ */

interface ProductFormState {
  name: string;
  category: string;
  price: string;
  currency: string;
  selarUrl: string;
  imageUrl: string;
  imageAlt: string;
  description: string;
  inStock: boolean;
}

const emptyProductForm: ProductFormState = {
  name: "",
  category: "",
  price: "",
  currency: "NGN",
  selarUrl: "",
  imageUrl: "",
  imageAlt: "",
  description: "",
  inStock: true,
};

function productToForm(product: ProductItem): ProductFormState {
  return {
    name: product.name,
    category: product.category,
    price: String(product.price),
    currency: product.currency,
    selarUrl: product.selarUrl,
    imageUrl: product.imageUrl,
    imageAlt: product.imageAlt,
    description: product.description,
    inStock: product.inStock,
  };
}

function ProductsTab() {
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<unknown>(null);
  const [editing, setEditing] = useState<ProductItem | "new" | null>(null);
  const [form, setForm] = useState<ProductFormState>(emptyProductForm);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<unknown>(null);
  const [actionError, setActionError] = useState<unknown>(null);

  const load = useCallback(() => {
    fetchProducts({ limit: 50 })
      .then((result) => {
        setProducts(result.items);
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
    setForm(emptyProductForm);
    setSaveError(null);
  };

  const startEdit = (product: ProductItem) => {
    setEditing(product);
    setForm(productToForm(product));
    setSaveError(null);
  };

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setSaveError(null);

    const payload = {
      name: form.name.trim(),
      category: form.category.trim(),
      price: Number(form.price),
      currency: form.currency.trim() || undefined,
      selarUrl: form.selarUrl.trim(),
      imageUrl: form.imageUrl.trim() || undefined,
      imageAlt: form.imageAlt.trim() || undefined,
      description: form.description.trim() || undefined,
      inStock: form.inStock,
    };

    try {
      if (editing === "new") {
        await createProduct(payload);
      } else if (editing) {
        await updateProduct(editing.id, payload);
      }
      setEditing(null);
      load();
    } catch (err) {
      setSaveError(err);
    } finally {
      setSaving(false);
    }
  };

  const remove = async (product: ProductItem) => {
    if (!window.confirm(`Remove “${product.name}” from the shop?`)) return;
    setActionError(null);
    try {
      await deleteProduct(product.id);
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
          Shop products{" "}
          <span className="font-sans text-sm text-ink-500">({products.length})</span>
        </h3>
        <button
          type="button"
          onClick={startCreate}
          className="inline-flex items-center gap-2 bg-brand-primary text-cream-50 px-5 py-2.5 text-[0.72rem] uppercase tracking-[0.15em] font-sans font-semibold rounded-sm hover:bg-brand-hover transition-colors duration-300"
        >
          <Plus size={13} aria-hidden="true" />
          Add product
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
              {editing === "new" ? "New product" : `Editing — ${editing.name}`}
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
            <ErrorSummary error={saveError} what="save this product" />
          )}

          <div className="grid sm:grid-cols-2 gap-5">
            <div>
              <label htmlFor="p-name" className={labelClasses}>
                Name <span className="text-brand-primary">*</span>
              </label>
              <input
                id="p-name"
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                maxLength={120}
                className={fieldClasses}
              />
              <FieldError errors={fieldIssues} field="name" />
            </div>
            <div>
              <label htmlFor="p-category" className={labelClasses}>
                Category <span className="text-brand-primary">*</span>
              </label>
              <input
                id="p-category"
                type="text"
                required
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                placeholder="e.g. Natural & Herbal Products"
                maxLength={60}
                className={fieldClasses}
              />
              <FieldError errors={fieldIssues} field="category" />
            </div>
            <div>
              <label htmlFor="p-price" className={labelClasses}>
                Price <span className="text-brand-primary">*</span>
              </label>
              <input
                id="p-price"
                type="number"
                required
                min={0}
                step="any"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                className={fieldClasses}
              />
              <FieldError errors={fieldIssues} field="price" />
            </div>
            <div>
              <label htmlFor="p-currency" className={labelClasses}>
                Currency
              </label>
              <input
                id="p-currency"
                type="text"
                value={form.currency}
                onChange={(e) => setForm({ ...form, currency: e.target.value })}
                placeholder="NGN"
                maxLength={8}
                className={fieldClasses}
              />
              <FieldError errors={fieldIssues} field="currency" />
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="p-selar" className={labelClasses}>
                Selar product URL <span className="text-brand-primary">*</span>
              </label>
              <input
                id="p-selar"
                type="url"
                required
                value={form.selarUrl}
                onChange={(e) => setForm({ ...form, selarUrl: e.target.value })}
                placeholder="https://selar.co/…"
                className={fieldClasses}
              />
              <FieldError errors={fieldIssues} field="selarUrl" />
            </div>
            <div>
              <label htmlFor="p-image" className={labelClasses}>
                Image URL
              </label>
              <input
                id="p-image"
                type="url"
                value={form.imageUrl}
                onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                placeholder="https://…"
                className={fieldClasses}
              />
              <FieldError errors={fieldIssues} field="imageUrl" />
            </div>
            <div>
              <label htmlFor="p-alt" className={labelClasses}>
                Image alt text
              </label>
              <input
                id="p-alt"
                type="text"
                value={form.imageAlt}
                onChange={(e) => setForm({ ...form, imageAlt: e.target.value })}
                maxLength={200}
                className={fieldClasses}
              />
              <FieldError errors={fieldIssues} field="imageAlt" />
            </div>
            <div className="sm:col-span-2">
              <RichTextEditor
                label="Description"
                value={form.description}
                onChange={(html) => setForm({ ...form, description: html })}
                placeholder="Describe the product…"
                minHeight="10rem"
              />
              <FieldError errors={fieldIssues} field="description" />
            </div>
            <div className="sm:col-span-2">
              <label className="inline-flex items-center gap-2.5 font-sans text-sm text-ink-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.inStock}
                  onChange={(e) => setForm({ ...form, inStock: e.target.checked })}
                  className="w-4 h-4 accent-[#e3221c]"
                />
                In stock
              </label>
              <FieldError errors={fieldIssues} field="inStock" />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 bg-brand-primary text-cream-50 px-6 py-2.5 text-[0.75rem] uppercase tracking-[0.15em] font-sans font-semibold rounded-sm hover:bg-brand-hover transition-colors duration-300 disabled:opacity-60"
            >
              {saving && <Loader2 size={13} className="animate-spin" aria-hidden="true" />}
              {editing === "new" ? "Create product" : "Save changes"}
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
          <span className="font-sans text-sm">Loading products…</span>
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
      ) : products.length === 0 ? (
        <p className="font-sans text-sm text-ink-500 py-6">
          No products yet — add the first one to stock the shop shelf.
        </p>
      ) : (
        <ul className="divide-y divide-ink-900/10 border-y border-ink-900/10">
          {products.map((product) => (
            <li key={product.id} className="py-4 flex items-center gap-4">
              <div className="w-14 h-14 rounded-sm overflow-hidden bg-cream-200 shrink-0">
                {product.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element -- admin-supplied URL
                  <img
                    src={product.imageUrl}
                    alt={product.imageAlt || product.name}
                    loading="lazy"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-brand-primary/40">
                    <ShoppingBag size={18} strokeWidth={1.5} aria-hidden="true" />
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-sans text-sm font-semibold text-ink-900 truncate">
                  {product.name}
                </p>
                <p className="font-sans text-xs text-ink-500">
                  {product.category} · {formatMoney(product.price, product.currency)}
                  {!product.inStock && (
                    <span className="ml-2 text-brand-primary font-semibold">Out of stock</span>
                  )}
                </p>
              </div>
              <button
                type="button"
                onClick={() => startEdit(product)}
                aria-label={`Edit ${product.name}`}
                className="w-9 h-9 flex items-center justify-center rounded-sm border border-ink-900/15 text-ink-700 hover:border-brand-primary hover:text-brand-primary transition-colors"
              >
                <Pencil size={14} aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={() => void remove(product)}
                aria-label={`Delete ${product.name}`}
                className="w-9 h-9 flex items-center justify-center rounded-sm border border-ink-900/15 text-ink-700 hover:border-brand-primary hover:text-brand-primary transition-colors"
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

/* ------------------------------------------------------------------ */
/* Messages tab                                                        */
/* ------------------------------------------------------------------ */

function MessagesTab() {
  const [messages, setMessages] = useState<ContactMessageItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [openId, setOpenId] = useState<string | null>(null);

  const load = useCallback(() => {
    fetchContactMessages({ unread: unreadOnly, limit: 50 })
      .then((result) => {
        setMessages(result.items);
        setError(null);
        setLoading(false);
      })
      .catch((err: unknown) => {
        setError(err);
        setLoading(false);
      });
  }, [unreadOnly]);

  useEffect(() => {
    void load();
  }, [load]);

  const toggleRead = async (message: ContactMessageItem) => {
    try {
      await markContactMessageRead(message.id, !message.isRead);
      load();
    } catch (err) {
      setError(err);
    }
  };

  const remove = async (message: ContactMessageItem) => {
    if (!window.confirm(`Delete the message from ${message.name}?`)) return;
    try {
      await deleteContactMessage(message.id);
      load();
    } catch (err) {
      setError(err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <h3 className="font-display text-xl text-ink-900">
          Contact-form inbox{" "}
          <span className="font-sans text-sm text-ink-500">({messages.length})</span>
        </h3>
        <label className="inline-flex items-center gap-2.5 font-sans text-sm text-ink-700 cursor-pointer">
          <input
            type="checkbox"
            checked={unreadOnly}
            onChange={(e) => setUnreadOnly(e.target.checked)}
            className="w-4 h-4 accent-[#e3221c]"
          />
          Unread only
        </label>
      </div>

      {error !== null && <ErrorLine error={error} />}

      {loading ? (
        <div className="flex items-center gap-3 text-ink-500">
          <Loader2 size={18} className="animate-spin text-brand-primary" aria-hidden="true" />
          <span className="font-sans text-sm">Loading messages…</span>
        </div>
      ) : messages.length === 0 ? (
        <p className="font-sans text-sm text-ink-500 py-6">
          {unreadOnly ? "No unread messages — inbox zero." : "No messages yet."}
        </p>
      ) : (
        <ul className="space-y-4">
          {messages.map((message) => {
            const open = openId === message.id;
            return (
              <li
                key={message.id}
                className={`border rounded-md bg-white ${
                  message.isRead ? "border-ink-900/12" : "border-brand-primary/40"
                }`}
              >
                <div className="flex items-start gap-4 p-5">
                  {!message.isRead && (
                    <span
                      className="mt-1.5 w-2 h-2 rounded-full bg-brand-primary shrink-0"
                      aria-label="Unread"
                    />
                  )}
                  <button
                    type="button"
                    onClick={() => setOpenId(open ? null : message.id)}
                    className="text-left flex-1 min-w-0"
                    aria-expanded={open}
                  >
                    <p className="font-sans text-sm font-semibold text-ink-900">
                      {message.subject} — {message.name}
                    </p>
                    <p className="mt-0.5 font-sans text-xs text-ink-500 truncate">
                      {message.email}
                      {message.phone ? ` · ${message.phone}` : ""} ·{" "}
                      {formatLongDate(message.createdAt)}
                    </p>
                    {!open && (
                      <p className="mt-1.5 font-sans text-sm text-ink-700 truncate">
                        {message.message}
                      </p>
                    )}
                  </button>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => void toggleRead(message)}
                      aria-label={message.isRead ? "Mark as unread" : "Mark as read"}
                      title={message.isRead ? "Mark as unread" : "Mark as read"}
                      className="w-9 h-9 flex items-center justify-center rounded-sm border border-ink-900/15 text-ink-700 hover:border-brand-primary hover:text-brand-primary transition-colors"
                    >
                      {message.isRead ? <Inbox size={14} aria-hidden="true" /> : <Check size={14} aria-hidden="true" />}
                    </button>
                    <button
                      type="button"
                      onClick={() => void remove(message)}
                      aria-label={`Delete message from ${message.name}`}
                      className="w-9 h-9 flex items-center justify-center rounded-sm border border-ink-900/15 text-ink-700 hover:border-brand-primary hover:text-brand-primary transition-colors"
                    >
                      <X size={14} aria-hidden="true" />
                    </button>
                  </div>
                </div>
                {open && (
                  <div className="px-5 pb-5 pl-5 border-t border-ink-900/10 pt-4">
                    <p className="font-sans text-sm text-ink-700 leading-relaxed whitespace-pre-wrap">
                      {message.message}
                    </p>
                    <a
                      href={`mailto:${message.email}?subject=Re: ${encodeURIComponent(message.subject)}`}
                      className="mt-4 inline-flex items-center gap-2 text-brand-primary text-xs uppercase tracking-[0.15em] font-sans font-semibold hover:gap-3.5 transition-all duration-300"
                    >
                      Reply by email
                    </a>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Change-password dialog                                              */
/* ------------------------------------------------------------------ */

function ChangePasswordDialog({ onClose, onChanged }: { onClose: () => void; onChanged: () => void }) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (newPassword !== confirm) {
      setError("The new passwords don't match.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      await changePassword({ currentPassword, newPassword });
      onChanged();
    } catch (err) {
      const message = err instanceof Error ? err.message : "";
      setError(
        message || "Something went wrong. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-ink-900/60">
      <div className="w-full max-w-md bg-white rounded-md p-8 space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-xl text-ink-900">Change password</h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="w-8 h-8 flex items-center justify-center rounded-sm text-ink-500 hover:text-brand-primary hover:bg-cream-100 transition-colors"
          >
            <X size={16} aria-hidden="true" />
          </button>
        </div>
        <p className="font-sans text-sm text-ink-500">
          Changing your password signs you out everywhere else.
        </p>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label htmlFor="cp-current" className={labelClasses}>
              Current password
            </label>
            <input
              id="cp-current"
              type="password"
              required
              autoComplete="current-password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className={fieldClasses}
            />
          </div>
          <div>
            <label htmlFor="cp-new" className={labelClasses}>
              New password
            </label>
            <input
              id="cp-new"
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className={fieldClasses}
            />
          </div>
          <div>
            <label htmlFor="cp-confirm" className={labelClasses}>
              Confirm new password
            </label>
            <input
              id="cp-confirm"
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className={fieldClasses}
            />
          </div>
          {error && <StatusLine kind="error">{error}</StatusLine>}
          <button
            type="submit"
            disabled={saving}
            className="w-full inline-flex items-center justify-center gap-2 bg-brand-primary text-cream-50 px-6 py-3 text-[0.78rem] uppercase tracking-[0.15em] font-sans font-semibold rounded-sm hover:bg-brand-hover transition-colors duration-300 disabled:opacity-60"
          >
            {saving && <Loader2 size={14} className="animate-spin" aria-hidden="true" />}
            Update password
          </button>
        </form>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* The console                                                         */
/* ------------------------------------------------------------------ */

const TABS: Array<{ id: Tab; label: string; icon: typeof Radio; permission: string }> = [
  { id: "broadcasts", label: "Broadcasts", icon: Radio, permission: "broadcasts:manage" },
  { id: "products", label: "Products", icon: ShoppingBag, permission: "products:manage" },
  { id: "media", label: "Media", icon: Clapperboard, permission: "content:manage" },
  { id: "events", label: "Events", icon: CalendarDays, permission: "events:manage" },
  { id: "messages", label: "Messages", icon: Inbox, permission: "messages:manage" },
  { id: "users", label: "Users", icon: Users, permission: "users:manage" },
  { id: "roles", label: "Roles", icon: Shield, permission: "roles:manage" },
];

export default function AdminConsole() {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [checking, setChecking] = useState(true);
  const [tab, setTab] = useState<Tab>("broadcasts");
  const [showChangePassword, setShowChangePassword] = useState(false);
  /** The session died mid-use; the banner is up and the redirect is pending. */
  const [sessionExpired, setSessionExpired] = useState(false);
  /** Carried onto the sign-in form so the reason outlives the banner. */
  const [notice, setNotice] = useState<string | undefined>(undefined);
  /**
   * Several in-flight requests can each fail with a 401 the moment the
   * session dies. Only the first one gets to announce it.
   */
  const expiryHandled = useRef(false);

  // Restore the session from the httpOnly cookie on mount.
  useEffect(() => {
    fetchSession()
      .then(setSession)
      .catch(() => setSession(null))
      .finally(() => setChecking(false));
  }, []);

  // Every admin call funnels through the API client, so that is where a dead
  // session is spotted — whichever tab the admin happened to be on.
  useEffect(() => {
    return onSessionExpired(() => {
      if (expiryHandled.current) return;
      expiryHandled.current = true;
      setSessionExpired(true);
    });
  }, []);

  // Let the banner be read, then hand over to the sign-in form. Deliberately
  // no `logout()` call — the session is already gone and the request would
  // only 401 again.
  useEffect(() => {
    if (!sessionExpired) return;
    const timer = window.setTimeout(() => {
      setSessionExpired(false);
      setNotice("Your session expired. Please sign in again.");
      setSession(null);
      setTab("broadcasts");
    }, 2000);
    return () => window.clearTimeout(timer);
  }, [sessionExpired]);

  const handleSignedIn = (next: AuthSession) => {
    // Arm the listener again for the next time the session lapses.
    expiryHandled.current = false;
    setNotice(undefined);
    setSession(next);
  };

  const signOut = async () => {
    try {
      await logout();
    } catch {
      // Even if the call fails, drop the local state and show sign-in.
    }
    setSession(null);
    setTab("broadcasts");
  };

  const hasPermission = (permission: string) =>
    session?.permissions.includes("*") || session?.permissions.includes(permission);

  if (checking) {
    return (
      <div className="py-24 flex items-center justify-center gap-3 text-ink-500">
        <Loader2 size={18} className="animate-spin text-brand-primary" aria-hidden="true" />
        <span className="font-sans text-sm">Checking your session…</span>
      </div>
    );
  }

  if (!session) {
    return <SignInForm onSignedIn={handleSignedIn} notice={notice} />;
  }

  const visibleTabs = TABS.filter(({ permission }) => hasPermission(permission));
  const activeTab = visibleTabs.some(({ id }) => id === tab) ? tab : (visibleTabs[0]?.id ?? null);

  return (
    <div className="py-10 md:py-14 space-y-8">
      {sessionExpired && (
        <div
          role="status"
          className="border border-brand-primary/40 bg-brand-50 rounded-md px-4 py-3.5"
        >
          <p className="flex items-start gap-2 font-sans text-sm text-brand-primary font-semibold">
            <AlertCircle size={16} className="shrink-0 mt-0.5" aria-hidden="true" />
            Your session expired. Taking you back to sign in…
          </p>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="font-sans text-xs uppercase tracking-[0.25em] text-brand-primary font-semibold mb-1.5">
            Internal
          </p>
          <h1 className="font-display text-3xl text-ink-900">Admin Console</h1>
          <p className="mt-1.5 font-sans text-sm text-ink-500">
            Signed in as <span className="text-ink-900 font-semibold">{session.user.name}</span>
            {" · "}
            {session.role.name}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setShowChangePassword(true)}
            className="inline-flex items-center gap-2 border border-ink-900/20 text-ink-700 px-5 py-2.5 text-[0.72rem] uppercase tracking-[0.15em] font-sans font-semibold rounded-sm hover:border-brand-primary hover:text-brand-primary transition-colors duration-300"
          >
            <KeyRound size={13} aria-hidden="true" />
            Change password
          </button>
          <button
            type="button"
            onClick={() => void signOut()}
            className="inline-flex items-center gap-2 border border-ink-900/20 text-ink-700 px-5 py-2.5 text-[0.72rem] uppercase tracking-[0.15em] font-sans font-semibold rounded-sm hover:border-brand-primary hover:text-brand-primary transition-colors duration-300"
          >
            <LogOut size={13} aria-hidden="true" />
            Sign out
          </button>
        </div>
      </div>

      {/* Tabs — filtered by the role's permissions (server enforces too) */}
      {visibleTabs.length > 0 && (
        <div className="flex flex-wrap gap-2 border-b border-ink-900/15 pb-4" role="tablist">
          {visibleTabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={activeTab === id}
              onClick={() => setTab(id)}
              className={`inline-flex items-center gap-2 font-sans text-xs uppercase tracking-[0.12em] font-semibold px-4 py-2.5 rounded-sm border transition-colors duration-300 ${
                activeTab === id
                  ? "bg-brand-primary text-cream-50 border-brand-primary"
                  : "border-ink-900/20 text-ink-700 hover:border-brand-primary hover:text-brand-primary"
              }`}
            >
              <Icon size={14} aria-hidden="true" />
              {label}
            </button>
          ))}
        </div>
      )}

      {/* Active tab */}
      {activeTab === "broadcasts" && <BroadcastsTab />}
      {activeTab === "products" && <ProductsTab />}
      {activeTab === "media" && <MediaTab />}
      {activeTab === "events" && <EventsTab />}
      {activeTab === "messages" && <MessagesTab />}
      {activeTab === "users" && <UsersTab currentUserId={session.user.id} />}
      {activeTab === "roles" && <RolesTab />}

      {activeTab === null && (
        <p className="font-sans text-sm text-ink-500 py-6">
          Your role doesn&rsquo;t include any management permissions yet. Ask a super admin
          to grant them.
        </p>
      )}

      {/* Change-password dialog — on success it signs the session out
          everywhere, so drop back to the sign-in form. */}
      {showChangePassword && (
        <ChangePasswordDialog
          onClose={() => setShowChangePassword(false)}
          onChanged={() => {
            setShowChangePassword(false);
            setSession(null);
          }}
        />
      )}
    </div>
  );
}
