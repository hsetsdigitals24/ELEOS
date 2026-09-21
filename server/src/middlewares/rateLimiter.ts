import rateLimit from "express-rate-limit";
import { config } from "../config/env.ts";

/**
 * Rate limiters are skipped under `NODE_ENV=test` so suites can exercise
 * the endpoints freely; every other environment keeps them active.
 */
const skipInTests = () => config.isTest;

/**
 * General API limiter — generous ceiling for read traffic.
 * 300 requests / 15 minutes / IP.
 */
export const generalApiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 300,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many requests from this IP. Please try again later.",
  },
});

/**
 * Comment write limiter — comments are anonymous writes, so they get a
 * tight ceiling to blunt spam. 10 comments / 15 minutes / IP.
 */
export const commentWriteLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many comments submitted from this IP. Please try again later.",
  },
});

/**
 * Contact form write limiter — same spam-blunting role as the comment
 * limiter, sized for a longer form. 5 messages / 15 minutes / IP.
 */
export const contactWriteLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many messages submitted from this IP. Please try again later.",
  },
});

/**
 * Event registration limiter — a registration is a longer form than a
 * comment and a legitimate one takes a minute to fill, so the ceiling sits
 * between the comment and contact limits. 10 registrations / 15 min / IP.
 */
export const registrationWriteLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  skip: skipInTests,
  message: {
    success: false,
    message: "Too many registrations submitted from this IP. Please try again later.",
  },
});

/**
 * Admin write limiter — admin traffic is low-volume by nature, so anything
 * sustained looks like a brute-force attempt on the admin key.
 * 60 requests / 15 minutes / IP.
 */
export const adminLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 60,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  skip: skipInTests,
  message: {
    success: false,
    message: "Too many admin requests from this IP. Please try again later.",
  },
});

/**
 * Auth credential limiter — login / refresh / forgot / reset attempts.
 * Tight enough to blunt brute-force and email-flooding, loose enough for a
 * human correcting typos. 10 requests / 15 minutes / IP.
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  skip: skipInTests,
  message: {
    success: false,
    message: "Too many attempts. Please wait a few minutes and try again.",
  },
});
