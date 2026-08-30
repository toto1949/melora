"use client";

import { useEffect, useMemo, useState } from "react";
import { CampaignForm } from "@/components/marketing/CampaignForm";
import { VideoPreviewCard } from "@/components/marketing/VideoPreviewCard";
import { ReviewActions } from "@/components/marketing/ReviewActions";
import { CampaignHistoryTable } from "@/components/marketing/CampaignHistoryTable";
import type {
  MarketingGenerationRequest,
  MarketingGenerationResult,
  MarketingHistoryItem,
  MarketingPlatform,
  MarketingReviewAction,
  MarketingReviewResult,
} from "@/types/marketing";

const HISTORY_KEY = "mtm_marketing_campaign_history_v1";

function initialCampaign(): MarketingGenerationRequest {
  const date = new Date().toISOString().slice(0, 10);
  return {
    angle: "anniversary gift",
    campaign: `anniversary-${date}`,
    hook: "I had no idea what to get my wife for our anniversary, so I turned our story into a song.",
    strictVideoPrompt:
      "A husband struggles to find a meaningful anniversary gift, opens an old photo box, and remembers their first coffee date, a beach trip, their wedding, and quiet everyday moments together. Those memories visually transform into music. At an intimate anniversary dinner, he gives his wife headphones. She recognizes their shared story in the song, becomes genuinely emotional, and embraces him. Keep the same husband and wife throughout the entire film. Warm premium cinematic lighting, natural expressions, realistic hands, shallow depth of field, seamless timeline transitions, no additional romantic partners, no fake website UI, no scene substitutions, and no excessive on-screen text.",
    instagramCaption:
      "What if your favorite memories could become a song? Turn your story into something they can hear forever. #MemoriesToMelody #PersonalizedSong #AnniversaryGift",
    facebookPost:
      "Some memories deserve more than another ordinary gift. Turn the moments that define your relationship into a personalized song with Memories to Melody.",
    tiktokCaption:
      "POV: you turned your relationship into a song. #MemoriesToMelody #PersonalizedSong #GiftIdea",
    platforms: ["instagram", "facebook", "tiktok"],
    durationSeconds: 30,
  };
}

function errorMessage(payload: unknown, fallback: string) {
  if (!payload || typeof payload !== "object") return fallback;

  const data = payload as {
    error?: unknown;
    message?: unknown;
    details?: unknown;
  };

  const detail = data.details;
  if (detail && typeof detail === "object") {
    const detailObject = detail as { message?: unknown; error?: unknown; raw?: unknown };
    if (typeof detailObject.message === "string" && detailObject.message) {
      return detailObject.message;
    }
    if (typeof detailObject.error === "string" && detailObject.error) {
      return detailObject.error;
    }
    if (typeof detailObject.raw === "string" && detailObject.raw) {
      return detailObject.raw;
    }
  }

  if (typeof data.message === "string" && data.message) return data.message;
  if (typeof data.error === "string" && data.error) return data.error;
  return fallback;
}

function isPlatform(value: unknown): value is MarketingPlatform {
  return value === "instagram" || value === "facebook" || value === "tiktok";
}

export function MarketingControlCenter() {
  const [campaign, setCampaign] = useState<MarketingGenerationRequest>(() => initialCampaign());
  const [result, setResult] = useState<MarketingGenerationResult | null>(null);
  const [history, setHistory] = useState<MarketingHistoryItem[]>([]);
  const [generating, setGenerating] = useState(false);
  const [busyAction, setBusyAction] = useState<MarketingReviewAction | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(HISTORY_KEY);
      if (stored) setHistory(JSON.parse(stored) as MarketingHistoryItem[]);
    } catch {
      localStorage.removeItem(HISTORY_KEY);
    }
  }, []);

  const selectedPlatforms = useMemo(() => {
    const raw = result?.publishPayload?.platforms;
    if (Array.isArray(raw)) {
      const filtered = raw.filter(isPlatform);
      if (filtered.length) return filtered;
    }
    return campaign.platforms;
  }, [campaign.platforms, result]);

  function saveHistory(item: MarketingHistoryItem) {
    setHistory((current) => {
      const next = [item, ...current.filter((existing) => existing.id !== item.id)].slice(0, 30);
      localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
      return next;
    });
  }

  function updateLatestStatus(status: string, mediaUrl?: string) {
    setHistory((current) => {
      if (!current.length) return current;
      const next = current.map((item, index) =>
        index === 0 ? { ...item, status, mediaUrl: mediaUrl ?? item.mediaUrl } : item,
      );
      localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
      return next;
    });
  }

  async function generate() {
    if (!campaign.platforms.length) {
      setError("Select at least one publishing platform.");
      return;
    }

    setGenerating(true);
    setError(null);
    setNotice(null);
    try {
      const response = await fetch("/api/marketing/generate", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(campaign),
      });
      const payload = (await response.json()) as MarketingGenerationResult & { error?: string; details?: unknown };
      if (!response.ok) throw new Error(errorMessage(payload, "Video generation failed."));

      setResult(payload);
      saveHistory({
        id: payload.requestId || `${campaign.campaign}-${Date.now()}`,
        campaign: payload.campaign || campaign.campaign,
        angle: payload.angle || campaign.angle,
        status: payload.status,
        mediaUrl: payload.mediaUrl,
        platforms: campaign.platforms,
        durationSeconds: payload.durationSeconds || campaign.durationSeconds,
        createdAt: new Date().toISOString(),
        generationPayload: payload.generationPayload || {},
        publishPayload: payload.publishPayload || {},
      });
      setNotice(`${payload.durationSeconds || campaign.durationSeconds}s storyline generated and stored. Review it before publishing.`);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Video generation failed.");
    } finally {
      setGenerating(false);
    }
  }

  async function review(action: MarketingReviewAction) {
    if (!result) return;
    setBusyAction(action);
    setError(null);
    setNotice(null);

    try {
      const publishPayload = {
        ...result.publishPayload,
        platforms: selectedPlatforms,
      };
      const generationPayload = {
        ...result.generationPayload,
        platforms: selectedPlatforms,
        durationSeconds: result.durationSeconds || campaign.durationSeconds,
      };

      const response = await fetch("/api/marketing/review", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          action,
          publishPayload,
          generationPayload,
          strictVideoPrompt: action === "regenerate" ? campaign.strictVideoPrompt : undefined,
        }),
      });
      const payload = (await response.json()) as MarketingReviewResult & { error?: string; details?: unknown };
      if (!response.ok) throw new Error(errorMessage(payload, "Review action failed."));

      if (action === "regenerate" && payload.generationResult) {
        const regenerated = payload.generationResult;
        setResult(regenerated);
        saveHistory({
          id: regenerated.requestId || `${campaign.campaign}-${Date.now()}`,
          campaign: regenerated.campaign || campaign.campaign,
          angle: regenerated.angle || campaign.angle,
          status: regenerated.status,
          mediaUrl: regenerated.mediaUrl,
          platforms: selectedPlatforms,
          durationSeconds: regenerated.durationSeconds || campaign.durationSeconds,
          createdAt: new Date().toISOString(),
          generationPayload: regenerated.generationPayload || generationPayload,
          publishPayload: regenerated.publishPayload || publishPayload,
        });
        setNotice("A new storyline video was generated. Review the replacement before approving it.");
        return;
      }

      if (action === "approve") {
        updateLatestStatus(payload.status || "APPROVED_AND_PUBLISHED");
        setResult((current) => (current ? { ...current, status: payload.status || "APPROVED_AND_PUBLISHED" } : current));
        setNotice(`Approved and sent to ${selectedPlatforms.join(", ")}.`);
      } else {
        updateLatestStatus(payload.status || "REJECTED");
        setResult((current) => (current ? { ...current, status: payload.status || "REJECTED" } : current));
        setNotice("Video rejected. Nothing was published.");
      }
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Review action failed.");
    } finally {
      setBusyAction(null);
    }
  }

  const reviewEnabled = Boolean(result?.mediaUrl && result.status === "VIDEO_REVIEW_REQUIRED");

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted">Internal marketing operations</p>
          <h1 className="mt-1 font-display text-4xl md:text-5xl">Marketing Control Center</h1>
          <p className="mt-2 max-w-3xl text-sm text-muted">
            Build 10–40 second continuous Gemini storylines, control the creative brief, preview generated media, and approve publishing to Instagram, Facebook, and TikTok without exposing n8n secrets in the browser.
          </p>
        </div>
        <div className="rounded-2xl border border-border bg-white px-4 py-3 text-sm">
          <span className="text-muted">Publishing:</span>{" "}
          <strong>human approval required</strong>
        </div>
      </div>

      {error ? <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">{error}</div> : null}
      {notice ? <div className="rounded-2xl border border-green-200 bg-green-50 p-4 text-sm text-green-900">{notice}</div> : null}

      <div className="grid gap-6 xl:grid-cols-[1.12fr_0.88fr]">
        <CampaignForm value={campaign} onChange={setCampaign} onSubmit={generate} loading={generating} />
        <div className="space-y-6">
          <VideoPreviewCard result={result} />
          <ReviewActions
            disabled={!reviewEnabled}
            busyAction={busyAction}
            onApprove={() => review("approve")}
            onRegenerate={() => review("regenerate")}
            onReject={() => review("reject")}
          />
        </div>
      </div>

      <CampaignHistoryTable items={history} />
    </div>
  );
}
