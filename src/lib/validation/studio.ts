import { z } from "zod";

export const occasionSchema = z.object({
  occasion: z.string().min(2),
});

export const recipientSchema = z.object({
  name: z.string().min(1, "Recipient name is required").max(80),
  pronunciation: z.string().max(120).optional().nullable(),
  relationship: z.string().max(80).optional().nullable(),
  pronouns: z.string().max(40).optional().nullable(),
  nickname: z.string().max(80).optional().nullable(),
  fromName: z.string().max(80).optional().nullable(),
});

export const storySchema = z.object({
  howTheyMet: z.string().max(2000).optional().nullable(),
  favoriteMemory: z.string().min(10, "Share at least one favorite memory").max(2000),
  importantDates: z.string().max(1000).optional().nullable(),
  meaningfulPlaces: z.string().max(1000).optional().nullable(),
  insideJokes: z.string().max(1000).optional().nullable(),
  challengesOvercome: z.string().max(2000).optional().nullable(),
  whatMakesSpecial: z.string().min(10).max(2000),
  personalMessage: z.string().max(1000).optional().nullable(),
});

export const styleSchema = z.object({
  genre: z.string().min(1),
  customStyle: z.string().max(200).optional().nullable(),
  mood: z.string().min(1),
  energy: z.string().optional().nullable(),
  tempo: z.string().optional().nullable(),
  vocalType: z.string().min(1),
  duetPreference: z.string().optional().nullable(),
  language: z.string().min(2),
  explicitContent: z.boolean(),
  instruments: z.array(z.string()).default([]),
});

export const lyricsDirectionSchema = z.object({
  lyricTone: z.string().min(1),
  mustInclude: z.array(z.string()).default([]),
  mustExclude: z.array(z.string()).default([]),
  chorusMessage: z.string().max(280).optional().nullable(),
  desiredLength: z.string().optional().nullable(),
});

export const mediaSchema = z.object({
  videoStyle: z.string().optional().nullable(),
  consentConfirmed: z.literal(true),
});

export const reviewConfirmSchema = z.object({
  accuracyConfirmed: z.literal(true),
  rightsConfirmed: z.literal(true),
});

export const checkoutSchema = z.object({
  packageId: z.string().min(1),
  addOnIds: z.array(z.string()).default([]),
  deliverySpeed: z.enum(["standard", "rush"]).default("standard"),
  couponCode: z.string().optional().nullable(),
  email: z.string().email(),
  phone: z.string().optional().nullable(),
  createAccount: z.boolean().default(true),
  password: z.string().min(8).optional().nullable(),
  termsAccepted: z.literal(true),
  idempotencyKey: z.string().min(8),
});

export const revisionSchema = z.object({
  categories: z.array(z.string()).min(1),
  notes: z.string().min(10).max(4000),
  timestamps: z.array(z.string()).default([]),
});

export const trackOrderSchema = z.object({
  orderNumber: z.string().min(3),
  email: z.string().email(),
});
