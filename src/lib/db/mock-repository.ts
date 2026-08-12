import { nanoid } from "nanoid";
import type {
  AnalyticsEvent,
  GenerationJob,
  JobType,
  Order,
  OrderStatus,
  Package,
  PrivacyMode,
  Profile,
  Project,
  Recipient,
  RevisionRequest,
  SongPreferences,
  SongVersion,
  StoryAnswers,
  SupportTicket,
  UserRole,
} from "@/types";
import { orderNumber } from "@/lib/utils";
import { getStore, id, mutateStore, nowIso, saveStore } from "./store";

function attachProject(store: Awaited<ReturnType<typeof getStore>>, project: Project): Project {
  return {
    ...project,
    recipient: store.recipients.find((r) => r.projectId === project.id) ?? null,
    story: store.stories.find((s) => s.projectId === project.id) ?? null,
    preferences: store.preferences.find((p) => p.projectId === project.id) ?? null,
    media: store.media.filter((m) => m.projectId === project.id),
    package: store.packages.find((p) => p.id === project.packageId) ?? null,
  };
}

function attachOrder(store: Awaited<ReturnType<typeof getStore>>, order: Order): Order {
  const project = store.projects.find((p) => p.id === order.projectId);
  const jobs = store.jobs.filter((j) => j.orderId === order.id);
  const progress =
    jobs.length === 0
      ? order.status === "ready" || order.status === "completed"
        ? 100
        : 0
      : Math.round(jobs.reduce((sum, j) => sum + j.progress, 0) / jobs.length);

  return {
    ...order,
    progress,
    project: project ? attachProject(store, project) : undefined,
    package: store.packages.find((p) => p.id === order.packageId),
    currentVersion:
      store.versions.find((v) => v.orderId === order.id && v.isCurrent) ?? null,
  };
}

export async function getSettings() {
  const store = await getStore();
  return store.settings;
}

export async function updateSettings(partial: Partial<Awaited<ReturnType<typeof getSettings>>>) {
  return mutateStore((store) => {
    store.settings = { ...store.settings, ...partial };
    return store.settings;
  });
}

export async function listPackages() {
  const store = await getStore();
  return store.packages.filter((p) => p.isActive).sort((a, b) => a.sortOrder - b.sortOrder);
}

export async function getPackage(idOrSlug: string) {
  const store = await getStore();
  return store.packages.find((p) => p.id === idOrSlug || p.slug === idOrSlug) ?? null;
}

export async function updatePackage(packageId: string, patch: Partial<Package>) {
  return mutateStore((store) => {
    const idx = store.packages.findIndex((p) => p.id === packageId);
    if (idx < 0) return null;
    store.packages[idx] = { ...store.packages[idx], ...patch };
    return store.packages[idx];
  });
}

export async function listAddOns() {
  const store = await getStore();
  return store.addOns.filter((a) => a.isActive).sort((a, b) => a.sortOrder - b.sortOrder);
}

export async function listSamples() {
  const store = await getStore();
  return store.samples;
}

export async function listReactions() {
  const store = await getStore();
  return store.reactions.filter((r) => r.isDemo || true);
}

export async function listReviews(limit = 10, offset = 0) {
  const store = await getStore();
  const published = store.reviews.filter((r) => r.isPublished);
  return {
    items: published.slice(offset, offset + limit),
    total: published.length,
  };
}

export async function listFaqs() {
  const store = await getStore();
  return store.faqs.sort((a, b) => a.sortOrder - b.sortOrder);
}

export async function findCoupon(code: string) {
  const store = await getStore();
  const coupon = store.coupons.find(
    (c) => c.code.toLowerCase() === code.toLowerCase() && c.isActive,
  );
  if (!coupon) return null;
  if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) return null;
  if (coupon.maxRedemptions != null && coupon.redemptionCount >= coupon.maxRedemptions) {
    return null;
  }
  return coupon;
}

export async function createGuestProject(locale = "en") {
  return mutateStore((store) => {
    const project: Project = {
      id: id(),
      userId: null,
      guestToken: nanoid(32),
      status: "draft",
      currentStep: 1,
      occasion: null,
      packageId: "pkg-essential",
      locale,
      estimatedMinutes: 5,
      lastSavedAt: nowIso(),
      claimedAt: null,
      createdAt: nowIso(),
      updatedAt: nowIso(),
    };
    store.projects.push(project);
    return attachProject(store, project);
  });
}

export async function getProject(projectId: string, guestToken?: string | null) {
  const store = await getStore();
  const project = store.projects.find((p) => p.id === projectId);
  if (!project) return null;
  if (guestToken && project.guestToken && project.guestToken !== guestToken && !project.userId) {
    return null;
  }
  return attachProject(store, project);
}

export async function getProjectByGuestToken(guestToken: string) {
  const store = await getStore();
  const project = store.projects.find((p) => p.guestToken === guestToken);
  return project ? attachProject(store, project) : null;
}

export async function listUserProjects(userId: string) {
  const store = await getStore();
  return store.projects
    .filter((p) => p.userId === userId)
    .map((p) => attachProject(store, p))
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export async function updateProjectStep(
  projectId: string,
  step: number,
  patch: Partial<Project> = {},
) {
  return mutateStore((store) => {
    const project = store.projects.find((p) => p.id === projectId);
    if (!project) return null;
    Object.assign(project, patch, {
      currentStep: Math.max(project.currentStep, step),
      lastSavedAt: nowIso(),
      updatedAt: nowIso(),
    });
    return attachProject(store, project);
  });
}

export async function upsertRecipient(
  projectId: string,
  data: Omit<Recipient, "id" | "projectId">,
) {
  return mutateStore((store) => {
    const existing = store.recipients.find((r) => r.projectId === projectId);
    if (existing) {
      Object.assign(existing, data);
      return existing;
    }
    const recipient: Recipient = { id: id(), projectId, ...data };
    store.recipients.push(recipient);
    return recipient;
  });
}

export async function upsertStory(
  projectId: string,
  data: Omit<StoryAnswers, "id" | "projectId">,
) {
  return mutateStore((store) => {
    const existing = store.stories.find((s) => s.projectId === projectId);
    if (existing) {
      Object.assign(existing, data);
      return existing;
    }
    const story: StoryAnswers = { id: id(), projectId, ...data };
    store.stories.push(story);
    return story;
  });
}

export async function upsertPreferences(
  projectId: string,
  data: Omit<SongPreferences, "id" | "projectId">,
) {
  return mutateStore((store) => {
    const existing = store.preferences.find((p) => p.projectId === projectId);
    if (existing) {
      Object.assign(existing, data);
      return existing;
    }
    const prefs: SongPreferences = { id: id(), projectId, ...data };
    store.preferences.push(prefs);
    return prefs;
  });
}

export async function addMedia(
  projectId: string,
  media: Omit<import("@/types").MediaUpload, "id" | "projectId">,
) {
  return mutateStore((store) => {
    const item = { id: id(), projectId, ...media };
    store.media.push(item);
    return item;
  });
}

export async function reorderMedia(projectId: string, orderedIds: string[]) {
  return mutateStore((store) => {
    orderedIds.forEach((mediaId, index) => {
      const item = store.media.find((m) => m.id === mediaId && m.projectId === projectId);
      if (item) item.sortOrder = index;
    });
    return store.media.filter((m) => m.projectId === projectId);
  });
}

export async function claimProject(projectId: string, userId: string) {
  return mutateStore((store) => {
    const project = store.projects.find((p) => p.id === projectId);
    if (!project) return null;
    project.userId = userId;
    project.claimedAt = nowIso();
    project.updatedAt = nowIso();
    return attachProject(store, project);
  });
}

export async function createOrGetProfile(input: {
  id?: string;
  email: string;
  fullName?: string | null;
  role?: UserRole;
}) {
  return mutateStore((store) => {
    const existing = store.profiles.find(
      (p) => p.email.toLowerCase() === input.email.toLowerCase(),
    );
    if (existing) return existing;
    const profile: Profile = {
      id: input.id ?? id(),
      email: input.email.toLowerCase(),
      fullName: input.fullName ?? null,
      phone: null,
      avatarUrl: null,
      role: input.role ?? "customer",
      locale: "en",
      currency: "usd",
      country: null,
      marketingOptIn: false,
      trainingOptIn: false,
      suspendedAt: null,
      createdAt: nowIso(),
      updatedAt: nowIso(),
      deletedAt: null,
    };
    store.profiles.push(profile);
    return profile;
  });
}

export async function getProfile(userId: string) {
  const store = await getStore();
  return store.profiles.find((p) => p.id === userId) ?? null;
}

export async function getProfileByEmail(email: string) {
  const store = await getStore();
  return store.profiles.find((p) => p.email.toLowerCase() === email.toLowerCase()) ?? null;
}

export async function createSession(userId: string) {
  return mutateStore((store) => {
    const token = nanoid(48);
    store.sessions.push({ token, userId, createdAt: nowIso() });
    return token;
  });
}

export async function getSessionUser(token: string | undefined | null) {
  if (!token) return null;
  const store = await getStore();
  const session = store.sessions.find((s) => s.token === token);
  if (!session) return null;
  return store.profiles.find((p) => p.id === session.userId) ?? null;
}

export async function destroySession(token: string) {
  return mutateStore((store) => {
    store.sessions = store.sessions.filter((s) => s.token !== token);
  });
}

export async function createOrder(input: {
  projectId: string;
  packageId: string;
  email: string;
  phone?: string | null;
  userId?: string | null;
  couponCode?: string | null;
  addOnIds?: string[];
  deliverySpeed?: string;
  idempotencyKey: string;
}) {
  return mutateStore((store) => {
    const existing = store.orders.find((o) => o.idempotencyKey === input.idempotencyKey);
    if (existing) return attachOrder(store, existing);

    const pkg = store.packages.find((p) => p.id === input.packageId);
    if (!pkg) throw new Error("Package not found");

    const addOns = store.addOns.filter((a) => input.addOnIds?.includes(a.id));
    const subtotal = pkg.priceCents + addOns.reduce((sum, a) => sum + a.priceCents, 0);

    let discount = 0;
    let couponId: string | null = null;
    if (input.couponCode) {
      const coupon = store.coupons.find(
        (c) => c.code.toLowerCase() === input.couponCode!.toLowerCase() && c.isActive,
      );
      if (coupon) {
        couponId = coupon.id;
        if (coupon.percentOff) discount = Math.round((subtotal * coupon.percentOff) / 100);
        if (coupon.amountOffCents) discount = Math.min(subtotal, coupon.amountOffCents);
        coupon.redemptionCount += 1;
      }
    }

    const tax = Math.round((subtotal - discount) * 0.08);
    const total = subtotal - discount + tax;
    const deliveryHours =
      input.deliverySpeed === "rush" ? Math.max(6, Math.floor(pkg.deliveryHours / 2)) : pkg.deliveryHours;

    const order: Order = {
      id: id(),
      orderNumber: orderNumber(),
      userId: input.userId ?? null,
      projectId: input.projectId,
      packageId: input.packageId,
      couponId,
      status: "awaiting_payment",
      subtotalCents: subtotal,
      discountCents: discount,
      taxCents: tax,
      totalCents: total,
      currency: pkg.currency,
      deliverySpeed: input.deliverySpeed ?? "standard",
      estimatedDeliveryAt: new Date(Date.now() + deliveryHours * 3600 * 1000).toISOString(),
      email: input.email,
      phone: input.phone ?? null,
      revisionCreditsRemaining: pkg.revisionCredits,
      shareToken: nanoid(32),
      privacyMode: "unlisted",
      giftRevealEnabled: true,
      giftRevealMessage: "Someone created something special for you.",
      creativeBrief: null,
      stripeCheckoutSessionId: null,
      readyAt: null,
      completedAt: null,
      createdAt: nowIso(),
      updatedAt: nowIso(),
      idempotencyKey: input.idempotencyKey,
      failedReason: null,
    };

    store.orders.push(order);

    const project = store.projects.find((p) => p.id === input.projectId);
    if (project) {
      project.status = "awaiting_payment";
      project.packageId = input.packageId;
      project.updatedAt = nowIso();
    }

    return attachOrder(store, order);
  });
}

export async function getOrder(orderId: string) {
  const store = await getStore();
  const order = store.orders.find((o) => o.id === orderId);
  return order ? attachOrder(store, order) : null;
}

export async function getOrderByNumber(orderNumberValue: string, email: string) {
  const store = await getStore();
  const order = store.orders.find(
    (o) =>
      o.orderNumber.toLowerCase() === orderNumberValue.toLowerCase() &&
      o.email.toLowerCase() === email.toLowerCase(),
  );
  return order ? attachOrder(store, order) : null;
}

export async function getOrderByShareToken(token: string) {
  const store = await getStore();
  const order = store.orders.find((o) => o.shareToken === token);
  return order ? attachOrder(store, order) : null;
}

export async function listUserOrders(userId: string) {
  const store = await getStore();
  return store.orders
    .filter((o) => o.userId === userId)
    .map((o) => attachOrder(store, o))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function listAllOrders() {
  const store = await getStore();
  return store.orders.map((o) => attachOrder(store, o)).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function updateOrderStatus(orderId: string, status: OrderStatus, patch: Partial<Order> = {}) {
  return mutateStore((store) => {
    const order = store.orders.find((o) => o.id === orderId);
    if (!order) return null;
    order.status = status;
    Object.assign(order, patch, { updatedAt: nowIso() });
    if (status === "ready") order.readyAt = nowIso();
    if (status === "completed") order.completedAt = nowIso();
    return attachOrder(store, order);
  });
}

const orderPasswordHashes = new Map<string, string>();

export async function updateOrderPrivacy(
  orderId: string,
  privacyMode: PrivacyMode,
  giftRevealEnabled?: boolean,
  passwordHash?: string | null,
) {
  return mutateStore((store) => {
    const order = store.orders.find((o) => o.id === orderId);
    if (!order) return null;
    order.privacyMode = privacyMode;
    if (typeof giftRevealEnabled === "boolean") order.giftRevealEnabled = giftRevealEnabled;
    if (passwordHash !== undefined) {
      if (passwordHash) orderPasswordHashes.set(orderId, passwordHash);
      else orderPasswordHashes.delete(orderId);
    }
    order.updatedAt = nowIso();
    return attachOrder(store, order);
  });
}

export async function verifyOrderSharePassword(orderId: string, password: string) {
  const { verifyPassword } = await import("@/lib/security/password");
  const hash = orderPasswordHashes.get(orderId);
  if (!hash) return false;
  return verifyPassword(password, hash);
}

export async function enqueueJob(orderId: string, jobType: JobType, input: Record<string, unknown> = {}) {
  return mutateStore((store) => {
    const idempotencyKey = `${orderId}:${jobType}`;
    const existing = store.jobs.find((j) => j.idempotencyKey === idempotencyKey);
    if (existing && existing.status !== "dead_letter" && existing.status !== "failed") {
      return existing;
    }
    const job: GenerationJob = {
      id: id(),
      orderId,
      jobType,
      status: "queued",
      progress: 0,
      attempt: 0,
      maxAttempts: 5,
      idempotencyKey: existing ? `${idempotencyKey}:${Date.now()}` : idempotencyKey,
      provider: null,
      error: null,
      createdAt: nowIso(),
      updatedAt: nowIso(),
    };
    store.jobs.push(job);
    return job;
  });
}

export async function getJob(jobId: string) {
  const store = await getStore();
  return store.jobs.find((j) => j.id === jobId) ?? null;
}

export async function listJobs(status?: GenerationJob["status"]) {
  const store = await getStore();
  return store.jobs
    .filter((j) => (status ? j.status === status : true))
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

export async function listOrderJobs(orderId: string) {
  const store = await getStore();
  return store.jobs.filter((j) => j.orderId === orderId);
}

export async function updateJob(jobId: string, patch: Partial<GenerationJob>) {
  return mutateStore((store) => {
    const job = store.jobs.find((j) => j.id === jobId);
    if (!job) return null;
    Object.assign(job, patch, { updatedAt: nowIso() });
    return job;
  });
}

export async function saveSongVersion(version: Omit<SongVersion, "id" | "createdAt"> & { id?: string }) {
  return mutateStore((store) => {
    const existing = store.versions.find(
      (v) => v.orderId === version.orderId && v.versionNumber === version.versionNumber,
    );
    store.versions.forEach((v) => {
      if (v.orderId === version.orderId) v.isCurrent = false;
    });
    if (existing) {
      Object.assign(existing, version, { isCurrent: true });
      return existing;
    }
    const saved: SongVersion = {
      ...version,
      id: version.id ?? id(),
      createdAt: nowIso(),
      isCurrent: true,
    };
    store.versions.push(saved);
    return saved;
  });
}

export async function listSongVersions(orderId: string) {
  const store = await getStore();
  return store.versions
    .filter((v) => v.orderId === orderId)
    .sort((a, b) => b.versionNumber - a.versionNumber);
}

export async function createRevision(input: Omit<RevisionRequest, "id" | "createdAt" | "status">) {
  return mutateStore((store) => {
    const order = store.orders.find((o) => o.id === input.orderId);
    if (!order) throw new Error("Order not found");
    if (order.revisionCreditsRemaining <= 0) throw new Error("No revision credits remaining");
    order.revisionCreditsRemaining -= 1;
    order.status = "revision_requested";
    order.updatedAt = nowIso();
    const revision: RevisionRequest = {
      id: id(),
      status: "requested",
      createdAt: nowIso(),
      ...input,
    };
    store.revisions.push(revision);
    return revision;
  });
}

export async function listRevisions(orderId?: string) {
  const store = await getStore();
  return store.revisions.filter((r) => (orderId ? r.orderId === orderId : true));
}

export async function createNotification(
  input: Omit<import("@/types").Notification, "id" | "createdAt" | "readAt">,
) {
  return mutateStore((store) => {
    const notification = {
      id: id(),
      createdAt: nowIso(),
      readAt: null,
      ...input,
    };
    store.notifications.push(notification);
    return notification;
  });
}

export async function listNotifications(userId: string) {
  const store = await getStore();
  return store.notifications
    .filter((n) => n.userId === userId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function createTicket(input: Omit<SupportTicket, "id" | "createdAt" | "status">) {
  return mutateStore((store) => {
    const ticket: SupportTicket = {
      id: id(),
      status: "open",
      createdAt: nowIso(),
      ...input,
    };
    store.tickets.push(ticket);
    return ticket;
  });
}

export async function listTickets() {
  const store = await getStore();
  return store.tickets.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function trackEvent(
  eventName: string,
  properties: Record<string, unknown> = {},
  ids: Partial<Pick<AnalyticsEvent, "sessionId" | "userId" | "projectId" | "orderId">> = {},
) {
  return mutateStore((store) => {
    const event: AnalyticsEvent = {
      id: id(),
      eventName,
      sessionId: ids.sessionId ?? null,
      userId: ids.userId ?? null,
      projectId: ids.projectId ?? null,
      orderId: ids.orderId ?? null,
      properties,
      createdAt: nowIso(),
    };
    store.events.push(event);
    return event;
  });
}

export async function getAnalyticsSummary() {
  const store = await getStore();
  const revenue = store.orders
    .filter((o) => !["awaiting_payment", "draft", "refunded", "failed"].includes(o.status))
    .reduce((sum, o) => sum + o.totalCents, 0);

  const counts = store.events.reduce<Record<string, number>>((acc, e) => {
    acc[e.eventName] = (acc[e.eventName] ?? 0) + 1;
    return acc;
  }, {});

  return {
    revenueCents: revenue,
    orderCount: store.orders.length,
    activeJobs: store.jobs.filter((j) => j.status === "queued" || j.status === "running").length,
    failedJobs: store.jobs.filter((j) => j.status === "failed" || j.status === "dead_letter").length,
    openTickets: store.tickets.filter((t) => t.status === "open").length,
    revisionQueue: store.revisions.filter((r) => r.status === "requested").length,
    funnel: {
      heroCta: counts["hero_cta_clicked"] ?? 0,
      studioStarted: counts["studio_started"] ?? 0,
      checkoutStarted: counts["checkout_started"] ?? 0,
      purchaseCompleted: counts["purchase_completed"] ?? 0,
    },
    popularOccasions: Object.entries(
      store.projects.reduce<Record<string, number>>((acc, p) => {
        if (p.occasion) acc[p.occasion] = (acc[p.occasion] ?? 0) + 1;
        return acc;
      }, {}),
    )
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5),
    popularGenres: Object.entries(
      store.preferences.reduce<Record<string, number>>((acc, p) => {
        if (p.genre) acc[p.genre] = (acc[p.genre] ?? 0) + 1;
        return acc;
      }, {}),
    )
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5),
  };
}

export async function ensureDemoAdmin() {
  const existing = await getProfileByEmail("admin@melora.app");
  if (existing) return existing;
  return createOrGetProfile({
    email: "admin@melora.app",
    fullName: "Melora Admin",
    role: "super_admin",
  });
}

export async function exportUserData(userId: string) {
  const [profile, projects, orders] = await Promise.all([
    getProfile(userId),
    listUserProjects(userId),
    listUserOrders(userId),
  ]);
  return { profile, projects, orders, exportedAt: new Date().toISOString() };
}

export async function softDeleteUser(userId: string) {
  return mutateStore((store) => {
    const profile = store.profiles.find((p) => p.id === userId);
    if (!profile) return null;
    profile.deletedAt = nowIso();
    return profile;
  });
}

export { saveStore };
