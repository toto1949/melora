import { hasSupabase } from "@/lib/env";
import {
  AUDIO_LAUNCH_DESCRIPTION,
  AUDIO_LAUNCH_NAME,
  AUDIO_LAUNCH_PRICE_CENTS,
  AUDIO_LAUNCH_SLUG,
  normalizeAudioLaunchPackage,
} from "@/lib/launch-catalog";
import * as mock from "./mock-repository";
import * as supabase from "./supabase-repository";

const db = hasSupabase() ? supabase : mock;

export const getSettings = db.getSettings;
export const updateSettings = db.updateSettings;

export async function listPackages() {
  const packages = await db.listPackages();
  return packages
    .filter((pkg) => pkg.slug === AUDIO_LAUNCH_SLUG)
    .map(normalizeAudioLaunchPackage);
}

export async function getPackage(idOrSlug: string) {
  const pkg = await db.getPackage(idOrSlug);
  if (!pkg || pkg.slug !== AUDIO_LAUNCH_SLUG) return null;
  return normalizeAudioLaunchPackage(pkg);
}

export const updatePackage = db.updatePackage;

// No paid add-ons during the introductory audio-only launch.
export async function listAddOns() {
  return [];
}

export const listSamples = db.listSamples;
export const listReactions = db.listReactions;
export const listReviews = db.listReviews;
export const getOrderReview = db.getOrderReview;
export const createReview = db.createReview;
export const listAllReviews = db.listAllReviews;
export const setReviewPublished = db.setReviewPublished;
export const deleteReview = db.deleteReview;
export const listCoupons = db.listCoupons;
export const setCouponActive = db.setCouponActive;
export const listAllProfiles = db.listAllProfiles;
export const updateTicketStatus = db.updateTicketStatus;
export const listRecentEvents = db.listRecentEvents;
export const listFaqs = db.listFaqs;
export const findCoupon = db.findCoupon;
export const createGuestProject = db.createGuestProject;
export const getProject = db.getProject;
export const getProjectByGuestToken = db.getProjectByGuestToken;
export const listUserProjects = db.listUserProjects;
export const updateProjectStep = db.updateProjectStep;
export const upsertRecipient = db.upsertRecipient;
export const upsertStory = db.upsertStory;
export const upsertPreferences = db.upsertPreferences;
export const addMedia = db.addMedia;
export const reorderMedia = db.reorderMedia;
export const claimProject = db.claimProject;
export const createOrGetProfile = db.createOrGetProfile;
export const getProfile = db.getProfile;
export const getProfileByEmail = db.getProfileByEmail;
export const updateProfile = db.updateProfile;
export const createSession = db.createSession;
export const getSessionUser = db.getSessionUser;
export const destroySession = db.destroySession;

export async function createOrder(input: Parameters<typeof supabase.createOrder>[0]) {
  const pkg = await db.getPackage(input.packageId);
  if (!pkg || pkg.slug !== AUDIO_LAUNCH_SLUG) {
    throw new Error("Only the Personalized Audio Song launch offer is currently available.");
  }

  await db.updatePackage(pkg.id, {
    priceCents: AUDIO_LAUNCH_PRICE_CENTS,
    name: AUDIO_LAUNCH_NAME,
    description: AUDIO_LAUNCH_DESCRIPTION,
  });

  return db.createOrder(input);
}

export const getOrder = db.getOrder;
export const getOrderByNumber = db.getOrderByNumber;
export const getOrderByShareToken = db.getOrderByShareToken;
export const listUserOrders = db.listUserOrders;
export const listAllOrders = db.listAllOrders;
export const updateOrderStatus = db.updateOrderStatus;
export const updateOrderPrivacy = db.updateOrderPrivacy;
export const enqueueJob = db.enqueueJob;
export const getJob = db.getJob;
export const listJobs = db.listJobs;
export const listRunnableJobs = db.listRunnableJobs;
export const listOrderJobs = db.listOrderJobs;
export const updateJob = db.updateJob;
export const claimJob = db.claimJob;
export const saveSongVersion = db.saveSongVersion;
export const listSongVersions = db.listSongVersions;
export const createRevision = db.createRevision;
export const listRevisions = db.listRevisions;
export const createNotification = db.createNotification;
export const listNotifications = db.listNotifications;
export const createTicket = db.createTicket;
export const listTickets = db.listTickets;
export const trackEvent = db.trackEvent;
export const getAnalyticsSummary = db.getAnalyticsSummary;
export const ensureDemoAdmin = db.ensureDemoAdmin;
export const exportUserData = db.exportUserData;
export const softDeleteUser = db.softDeleteUser;
export const verifyOrderSharePassword = db.verifyOrderSharePassword;
export const saveStore = db.saveStore;
