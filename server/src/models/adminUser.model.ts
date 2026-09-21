import mongoose, {
  Schema,
  type HydratedDocument,
  type InferSchemaType,
  type Model,
} from "mongoose";

/**
 * AdminUser — an identity that can sign in to the admin console. Passwords
 * are stored as bcrypt hashes only; the field is excluded from every query
 * by default (`select: false`) so a hash can never leak into a response.
 */
const adminUserSchema = new Schema(
  {
    email: {
      type: String,
      required: [true, "email is required"],
      trim: true,
      lowercase: true,
      unique: true,
      index: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "email must be a valid email address"],
    },
    name: {
      type: String,
      required: [true, "name is required"],
      trim: true,
      minlength: 2,
      maxlength: 80,
    },
    /**
     * bcrypt hash — never selected by default, never serialized. Optional at
     * the schema level: users created via invite have no password until they
     * follow the set-password link emailed to them.
     */
    passwordHash: {
      type: String,
      default: null,
      select: false,
    },
    role: {
      type: Schema.Types.ObjectId,
      ref: "Role",
      required: [true, "role is required"],
      index: true,
    },
    /** Deactivated users cannot sign in; existing sessions are rejected. */
    isActive: {
      type: Boolean,
      default: true,
    },
    /** Brute-force lockout: consecutive failed logins since last success. */
    failedAttempts: {
      type: Number,
      default: 0,
      min: 0,
    },
    /** When set in the future, login is rejected until this moment. */
    lockUntil: {
      type: Date,
      default: null,
    },
    /** sha256 hash of the active password-reset token (never the token). */
    resetTokenHash: {
      type: String,
      default: null,
      select: false,
    },
    resetTokenExpiresAt: {
      type: Date,
      default: null,
      select: false,
    },
  },
  {
    timestamps: true, // createdAt / updatedAt
  }
);

export type AdminUserDocument = InferSchemaType<typeof adminUserSchema>;

/** Document shape with `_id` and instance methods (what queries return).
 *  `passwordHash` is `select: false` at runtime — queries must explicitly
 *  `.select("+passwordHash")` when they need it. */
export type AdminUserHydratedDocument = HydratedDocument<AdminUserDocument>;

interface AdminUserModel extends Model<AdminUserDocument> {
  // Placeholder for future statics.
}

export const AdminUser: AdminUserModel = (mongoose.models.AdminUser ??
  mongoose.model<AdminUserDocument, AdminUserModel>(
    "AdminUser",
    adminUserSchema
  )) as AdminUserModel;
