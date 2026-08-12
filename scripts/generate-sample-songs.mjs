/*
 * Generates marketing sample songs through Kunavo (Suno V5.5), the same
 * provider the production pipeline uses. Prints JSON results to stdout.
 *
 * Usage: KUNAVO_API_KEY=sk-... node scripts/generate-sample-songs.mjs
 */

const KUNAVO_JOBS_URL = "https://api.kunavo.com/v1/audio/music/jobs";
const API_KEY = process.env.KUNAVO_API_KEY;
if (!API_KEY) {
  console.error("KUNAVO_API_KEY is required");
  process.exit(1);
}

const SONGS = [
  {
    slug: "ya-nour-aini",
    title: "يا نور عيني",
    style: "arabic pop ballad, romantic mood, warm male vocal, sung in Arabic, oud and strings",
    lyrics: `[Verse 1]
من أول نظرة عرفت قلبي لقى بيته
في عيونك شفت العمر وكل حكايته
مشينا سوا في الفرح وليالي الشتا
وكل يوم معاك يزيد الحب وما يكتفي

[Chorus]
يا نور عيني يا حبيبتي
إنتِ الغنوة في حياتي
مهما تمر السنين علينا
حبك يبقى في ذاتي

[Verse 2]
اليوم لبستِ الأبيض والدنيا نوّرت
وقلبي رقص من الفرحة لما إيدك مسكت
وعدتك بالحب والأمان على طول
معاكِ العمر يحلى ويكمل الوصول

[Chorus]
يا نور عيني يا حبيبتي
إنتِ الغنوة في حياتي
مهما تمر السنين علينا
حبك يبقى في ذاتي`,
  },
  {
    slug: "everything-you-never-said",
    title: "Everything You Never Said",
    style: "soul, emotional mood, warm female vocal, gentle piano and strings",
    lyrics: `[Verse 1]
You never were the talking kind, you let your mornings speak
Coffee made before the dawn, lunches wrapped for me
Fixed the brakes, walked me in, stayed up when I was late
Love was never in your words — it was on my plate

[Chorus]
Everything you never said, I heard it all along
In every tire you ever changed, in every hummed-out song
You built a life around us, quiet as a prayer
Dad, for everything you never said — I know, I know it's there

[Verse 2]
You gave your Sundays up to teach me how to drive
You clapped the loudest in the crowd, the tears you tried to hide
Now it's me who's driving home just to see your face
No words could ever hold the love inside this place

[Chorus]
Everything you never said, I heard it all along
In every tire you ever changed, in every hummed-out song
You built a life around us, quiet as a prayer
Dad, for everything you never said — I know, I know it's there`,
  },
  {
    slug: "petite-etoile",
    title: "Petite Étoile",
    style: "gentle lullaby, acoustic classical, tender mood, soft female vocal, sung in French, music box and soft strings",
    lyrics: `[Couplet 1]
Ferme tes yeux, petite étoile
La lune veille sur ton sommeil
Dans mes bras le monde s'efface
Tu es mon plus beau soleil

[Refrain]
Dors, mon amour, dors sans souci
Maman est là, papa aussi
Les rêves t'attendent, doux et légers
Petite étoile, laisse-toi bercer

[Couplet 2]
Tes petits doigts serrent les miens
Comme une promesse pour demain
Je te chante tout mon amour
Pour que tu grandisses sans détour

[Refrain]
Dors, mon amour, dors sans souci
Maman est là, papa aussi
Les rêves t'attendent, doux et légers
Petite étoile, laisse-toi bercer`,
  },
  {
    slug: "tassel-to-the-left",
    title: "Tassel to the Left",
    style: "hip-hop, uplifting mood, confident male vocal, triumphant brass and 808s",
    lyrics: `[Verse 1]
Four years of late nights, coffee in my veins
Deadlines and doubts dancing in the rain
Mama kept believing when I couldn't see the end
Now I'm walking cross this stage, diploma in my hand

[Chorus]
Tassel to the left, head up to the sky
This is just the start, watch me learn to fly
Every single lesson, every "almost quit"
Turned into the fire — I earned every bit

[Verse 2]
First one in the family with a cap and gown
Carrying their dreams, never let 'em down
Photos in the hallway of how far we came
Future's calling my name — I'ma answer with the flame

[Chorus]
Tassel to the left, head up to the sky
This is just the start, watch me learn to fly
Every single lesson, every "almost quit"
Turned into the fire — I earned every bit`,
  },
  {
    slug: "still-with-me",
    title: "Still With Me",
    style: "gospel, spiritual mood, choir blend vocals, organ, warm claps, uplifting swell",
    lyrics: `[Verse 1]
I still hear your voice in the morning
Soft as the light through the door
The kitchen still hums with your Sunday hymns
Your love lives in these walls forevermore

[Chorus]
You're still with me, in every sunrise
Still with me, when the church bells ring
Heaven holds you now but I feel you near
You're the harmony in everything

[Verse 2]
All the wisdom that you planted
Grows in gardens you won't see
But I promise I will water every seed you gave
Till we sing again in eternity

[Chorus]
You're still with me, in every sunrise
Still with me, when the church bells ring
Heaven holds you now but I feel you near
You're the harmony in everything`,
  },
];

async function submit(song) {
  const res = await fetch(KUNAVO_JOBS_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${API_KEY}`,
      "Idempotency-Key": `sample-${song.slug}-v1`,
    },
    body: JSON.stringify({
      model: "suno-v5-5",
      customMode: true,
      prompt: song.lyrics,
      style: song.style,
      title: song.title,
      instrumental: false,
    }),
  });
  if (!res.ok) {
    throw new Error(`submit ${song.slug} failed (${res.status}): ${(await res.text()).slice(0, 300)}`);
  }
  const job = await res.json();
  console.error(`submitted ${song.slug} -> job ${job.id} (${job.status})`);
  return { song, jobId: job.id };
}

async function poll(jobId) {
  const res = await fetch(`${KUNAVO_JOBS_URL}/${jobId}`, {
    headers: { Authorization: `Bearer ${API_KEY}` },
  });
  if (!res.ok) return null;
  return res.json();
}

const submitted = [];
for (const song of SONGS) {
  submitted.push(await submit(song));
}

const deadline = Date.now() + 12 * 60 * 1000;
const results = {};
while (Object.keys(results).length < submitted.length && Date.now() < deadline) {
  await new Promise((r) => setTimeout(r, 15000));
  for (const { song, jobId } of submitted) {
    if (results[song.slug]) continue;
    const job = await poll(jobId);
    if (!job) continue;
    if (job.status === "completed") {
      const track = job.output?.tracks?.[0];
      results[song.slug] = {
        title: song.title,
        audioUrl: track?.url ?? track?.stream_url,
        coverUrl: track?.image_url,
        durationSeconds: track?.duration ? Math.round(track.duration) : null,
        jobId,
      };
      console.error(`completed ${song.slug}`);
    } else if (job.status === "failed") {
      results[song.slug] = { error: job.error?.message ?? "failed", jobId };
      console.error(`FAILED ${song.slug}: ${job.error?.message}`);
    } else {
      console.error(`waiting ${song.slug}: ${job.status}`);
    }
  }
}

console.log(JSON.stringify(results, null, 2));
