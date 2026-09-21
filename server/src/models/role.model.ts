import mongoose, {
  Schema,
  type HydratedDocument,
  type InferSchemaType,
  type Model,
} from "mongoose";

/**
 * Role — a named bundle of permissions assigned to admin users. The
 * `super-admin` system role carries the "*" wildcard and can neither be
 * edited nor deleted.
 */
export const PERMISSIONS = [
  "broadcasts:manage",
  "products:manage",
  "messages:manage",
  "content:manage",
  "events:manage",
  "users:manage",
  "roles:manage",
] as const;

export type Permission = (typeof PERMISSIONS)[number];

/** Every permission the wildcard expands to. */
export const ALL_PERMISSIONS: string[] = [...PERMISSIONS];

export const SUPER_ADMIN_ROLE = "super-admin";

const roleSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "name is required"],
      trim: true,
      minlength: 2,
      maxlength: 60,
    },
    slug: {
      type: String,
      required: [true, "slug is required"],
      trim: true,
      lowercase: true,
      maxlength: 80,
      unique: true,
      index: true,
    },
    /** Permission strings from PERMISSIONS, or "*" for the super admin. */
    permissions: {
      type: [String],
      default: [],
      validate: {
        validator: (values: string[]) =>
          values.every((value) => value === "*" || ALL_PERMISSIONS.includes(value)),
        message: "permissions contains an unknown value",
      },
    },
    /** System roles are seeded by the app and cannot be edited or deleted. */
    isSystem: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true, // createdAt / updatedAt
  }
);

export type RoleDocument = InferSchemaType<typeof roleSchema>;

/** Document shape with `_id` and instance methods (what queries return). */
export type RoleHydratedDocument = HydratedDocument<RoleDocument>;

interface RoleModel extends Model<RoleDocument> {
  // Placeholder for future statics.
}

export const Role: RoleModel = (mongoose.models.Role ??
  mongoose.model<RoleDocument, RoleModel>("Role", roleSchema)) as RoleModel;
