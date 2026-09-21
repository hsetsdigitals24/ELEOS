import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";

/**
 * BroadcastSetting — a SINGLETON document holding the site's live
 * broadcast configuration. The admin sets the audio medium (where the
 * audio broadcast is carried) and the live video link (YouTube); the
 * frontend renders a player when a broadcast is configured and a branded
 * placeholder when it isn't.
 *
 * `singletonId` is pinned to "global" with a unique index so exactly one
 * document can ever exist — the service upserts onto it.
 */
const broadcastSettingSchema = new Schema(
  {
    singletonId: {
      type: String,
      enum: ["global"],
      default: "global",
      required: true,
      unique: true,
      immutable: true,
    },
    audio: {
      medium: {
        type: String,
        enum: ["none", "youtube", "mixlr", "facebook", "external"],
        default: "none",
      },
      url: { type: String, trim: true, maxlength: 2048, default: "" },
      title: { type: String, trim: true, maxlength: 160, default: "" },
      description: { type: String, trim: true, maxlength: 20000, default: "" },
      isLive: { type: Boolean, default: false },
    },
    video: {
      url: { type: String, trim: true, maxlength: 2048, default: "" },
      title: { type: String, trim: true, maxlength: 160, default: "" },
      description: { type: String, trim: true, maxlength: 20000, default: "" },
      isLive: { type: Boolean, default: false },
    },
  },
  {
    timestamps: true, // createdAt / updatedAt
  }
);

export type BroadcastSettingDocument = InferSchemaType<typeof broadcastSettingSchema>;

interface BroadcastSettingModel extends Model<BroadcastSettingDocument> {
  // Placeholder for future statics.
}

export const BroadcastSetting: BroadcastSettingModel = (mongoose.models.BroadcastSetting ??
  mongoose.model<BroadcastSettingDocument, BroadcastSettingModel>(
    "BroadcastSetting",
    broadcastSettingSchema
  )) as BroadcastSettingModel;
