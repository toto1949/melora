import { randomUUID } from "crypto";
import { promises as fs } from "fs";
import path from "path";
import type {
  AddOn,
  AnalyticsEvent,
  Coupon,
  FaqItem,
  GenerationJob,
  MediaUpload,
  Notification,
  Order,
  Package,
  Profile,
  Project,
  ReactionVideo,
  Recipient,
  Review,
  RevisionRequest,
  SampleSong,
  SiteSettings,
  SongPreferences,
  SongVersion,
  StoryAnswers,
  SupportTicket,
} from "@/types";
import {
  defaultSettings,
  seedAddOns,
  seedCoupons,
  seedFaqs,
  seedPackages,
  seedReactions,
  seedReviews,
  seedSamples,
} from "./seed-data";

export interface MeloraStore {
  profiles: Profile[];
  packages: Package[];
  addOns: AddOn[];
  projects: Project[];
  recipients: Recipient[];
  stories: StoryAnswers[];
  preferences: SongPreferences[];
  media: MediaUpload[];
  orders: Order[];
  versions: SongVersion[];
  jobs: GenerationJob[];
  reviews: Review[];
  samples: SampleSong[];
  reactions: ReactionVideo[];
  faqs: FaqItem[];
  coupons: Coupon[];
  notifications: Notification[];
  tickets: SupportTicket[];
  revisions: RevisionRequest[];
  events: AnalyticsEvent[];
  settings: SiteSettings;
  sessions: Array<{ token: string; userId: string; createdAt: string }>;
}

const STORE_PATH = path.join(process.cwd(), ".data", "melora-store.json");

function emptyStore(): MeloraStore {
  return {
    profiles: [],
    packages: structuredClone(seedPackages),
    addOns: structuredClone(seedAddOns),
    projects: [],
    recipients: [],
    stories: [],
    preferences: [],
    media: [],
    orders: [],
    versions: [],
    jobs: [],
    reviews: structuredClone(seedReviews),
    samples: structuredClone(seedSamples),
    reactions: structuredClone(seedReactions),
    faqs: structuredClone(seedFaqs),
    coupons: structuredClone(seedCoupons),
    notifications: [],
    tickets: [],
    revisions: [],
    events: [],
    settings: structuredClone(defaultSettings),
    sessions: [],
  };
}

declare global {
  var __meloraStore: MeloraStore | undefined;
  var __meloraStoreReady: Promise<MeloraStore> | undefined;
}

async function ensureDir() {
  await fs.mkdir(path.dirname(STORE_PATH), { recursive: true });
}

async function readFromDisk(): Promise<MeloraStore | null> {
  try {
    const raw = await fs.readFile(STORE_PATH, "utf8");
    return JSON.parse(raw) as MeloraStore;
  } catch {
    return null;
  }
}

async function writeToDisk(store: MeloraStore) {
  try {
    await ensureDir();
    await fs.writeFile(STORE_PATH, JSON.stringify(store, null, 2), "utf8");
  } catch {
    // Disk persistence is best-effort in constrained environments.
  }
}

export async function getStore(): Promise<MeloraStore> {
  if (global.__meloraStore) return global.__meloraStore;
  if (!global.__meloraStoreReady) {
    global.__meloraStoreReady = (async () => {
      const disk = await readFromDisk();
      const store = disk ?? emptyStore();
      global.__meloraStore = store;
      if (!disk) await writeToDisk(store);
      return store;
    })();
  }
  return global.__meloraStoreReady;
}

export async function saveStore() {
  const store = await getStore();
  await writeToDisk(store);
}

export function nowIso() {
  return new Date().toISOString();
}

export function id() {
  return randomUUID();
}

export async function mutateStore<T>(fn: (store: MeloraStore) => T | Promise<T>) {
  const store = await getStore();
  const result = await fn(store);
  await writeToDisk(store);
  return result;
}

export async function resetStore() {
  const store = emptyStore();
  global.__meloraStore = store;
  await writeToDisk(store);
  return store;
}
