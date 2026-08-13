import { randomUUID } from "crypto";

// Dynamic import compiled via next is hard; exercise store JSON directly after
// calling the TypeScript modules through vitest-like runtime.
// Use tsx register
await import("tsx/esm/api").catch(() => null);

const repo = await import("../src/lib/db/repository.ts");
const pipeline = await import("../src/lib/jobs/pipeline.ts");

const project = await repo.createGuestProject("en");
await repo.updateProjectStep(project.id, 2, { occasion: "birthday" });
await repo.upsertRecipient(project.id, {
  name: "Avery",
  pronunciation: "AY-vree",
  relationship: "Partner",
  pronouns: "they/them",
  nickname: null,
  fromName: "Jordan",
});
await repo.upsertStory(project.id, {
  howTheyMet: "At a rainy bookstore",
  favoriteMemory: "Sunday markets and shared playlists under string lights.",
  importantDates: "June 12",
  meaningfulPlaces: "The pier",
  insideJokes: "Pineapple on everything",
  challengesOvercome: "Long distance for a year",
  whatMakesSpecial: "Your patience, humor, and the way you notice small joys.",
  personalMessage: "I choose you every day",
});
await repo.upsertPreferences(project.id, {
  genre: "acoustic",
  customStyle: null,
  mood: "Romantic",
  energy: "Soft",
  tempo: "Moderate",
  vocalType: "Soft female",
  duetPreference: "Solo",
  language: "en",
  explicitContent: false,
  instruments: ["piano", "guitar"],
  lyricTone: "Romantic",
  mustInclude: ["Avery"],
  mustExclude: [],
  chorusMessage: "For Avery, through every season",
  desiredLength: "Standard (~3 min)",
  videoStyle: "Cinematic",
});
await repo.updateProjectStep(project.id, 8, { packageId: "pkg-essential" });

const order = await repo.createOrder({
  projectId: project.id,
  packageId: "pkg-essential",
  email: "demo@melora.app",
  userId: null,
  couponCode: "WELCOME10",
  addOnIds: [],
  deliverySpeed: "standard",
  idempotencyKey: randomUUID(),
});

await repo.updateOrderStatus(order.id, "payment_confirmed");
await pipeline.startGenerationPipeline(order.id);
const ready = await repo.getOrder(order.id);

console.log(
  JSON.stringify(
    {
      projectId: project.id,
      orderNumber: ready?.orderNumber,
      status: ready?.status,
      totalCents: ready?.totalCents,
      title: ready?.currentVersion?.title,
      shareToken: ready?.shareToken,
      progress: ready?.progress,
    },
    null,
    2,
  ),
);
