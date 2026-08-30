# Memories to Melody — Public Marketing Assets

Files in this directory are served by the Next.js app as public static assets.

## First live n8n/Postiz test

Place the generated vertical MP4 here as:

```text
public/marketing/mtm-test.mp4
```

After the production deployment completes, the expected public URL is:

```text
https://www.memoriestomelody.com/marketing/mtm-test.mp4
```

Verify before using it in n8n:

```bash
curl -I https://www.memoriestomelody.com/marketing/mtm-test.mp4
```

Expected: HTTP 200 and a video MIME type such as `video/mp4`.

## Recommended production naming

Use unique filenames instead of overwriting the same asset so social schedulers and CDNs do not reuse stale cached media.

Examples:

```text
anniversary-ugc-01.mp4
anniversary-reaction-02.mp4
birthday-gift-01.mp4
wedding-story-01.mp4
song-for-mom-01.mp4
```

These become URLs such as:

```text
https://www.memoriestomelody.com/marketing/anniversary-ugc-01.mp4
```

## Video recommendations

- MP4 container
- H.264 video is the safest general-purpose export
- AAC audio
- 9:16 vertical
- 1080x1920 preferred
- Keep the first 2–3 seconds focused on the emotional hook
- Avoid embedding customer media/testimonials without explicit permission

Do not place private customer songs, stories, names, photos, or listening assets in this public directory.
