import mongoose, {
  Schema,
  type HydratedDocument,
  type InferSchemaType,
  type Model,
} from "mongoose";

/**
 * RefreshToken — an opaque session token. Only the sha256 hash of the token
 * is stored; the raw value exists solely inside the user's httpOnly cookie.
 * Tokens are rotated on every refresh, and MongoDB's TTL index removes
 * expired rows automatically.
 */
const refreshTokenSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "AdminUser",
      required: [true, "user is required"],
      index: true,
    },
    /** sha256 hex digest of the raw token — unique. */
    tokenHash: {
      type: String,
      required: [true, "tokenHash is required"],
      unique: true,
      index: true,
    },
    expiresAt: {
      type: Date,
      required: [true, "expiresAt is required"],
    },
    /** Set when the token was rotated away from or explicitly revoked. */
    revokedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true, // createdAt / updatedAt
  }
);

// MongoDB removes the document once expiresAt passes (or revokedAt, after a
// grace period that keeps reuse-detection evidence around).
refreshTokenSchema.index(
  { expiresAt: 1 },
  { expireAfterSeconds: 0 }
);
refreshTokenSchema.index(
  { revokedAt: 1 },
  { expireAfterSeconds: 60 * 60 * 24 } // keep revoked tokens 24h for reuse detection
);

export type RefreshTokenDocument = InferSchemaType<typeof refreshTokenSchema>;

/** Document shape with `_id` and instance methods (what queries return). */
export type RefreshTokenHydratedDocument = HydratedDocument<RefreshTokenDocument>;

interface RefreshTokenModel extends Model<RefreshTokenDocument> {
  // Placeholder for future statics.
}

export const RefreshToken: RefreshTokenModel = (mongoose.models.RefreshToken ??
  mongoose.model<RefreshTokenDocument, RefreshTokenModel>(
    "RefreshToken",
    refreshTokenSchema
  )) as RefreshTokenModel;
