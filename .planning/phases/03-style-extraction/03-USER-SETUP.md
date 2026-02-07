# Phase 3: User Setup Required

**Generated:** 2026-02-07
**Phase:** 03-style-extraction
**Status:** Incomplete

## Environment Variables

| Status | Variable | Source | Add to |
|--------|----------|--------|--------|
| [ ] | `BLOB_READ_WRITE_TOKEN` | Vercel Dashboard -> Storage -> Create Blob Store -> Token | `.env.local` |

## Account Setup

1. **Create Vercel Blob Store**
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Select your project (or create one if deploying)
   - Navigate to **Storage** tab
   - Click **Create Database** -> **Blob**
   - Name it (e.g., "dobra-blob")
   - Copy the **BLOB_READ_WRITE_TOKEN**

2. **Add to Local Environment**
   ```bash
   # Add to .env.local
   BLOB_READ_WRITE_TOKEN=vercel_blob_rw_...
   ```

## Local Development

For local development, you need the Vercel Blob token to upload files:

```bash
# Check if token is set
echo $BLOB_READ_WRITE_TOKEN

# If empty, add to .env.local and restart dev server
```

**Note:** Without the token, image uploads will fail with a 500 error. The rest of the app will function normally.

## Verification

After setting up, verify the token works:

```bash
# Start dev server
npm run dev

# In the app:
# 1. Click Paperclip icon
# 2. Select an image
# 3. Click Send
# 4. Check Network tab - /api/upload should return 200 with url
```

If upload fails:
- Check `.env.local` has `BLOB_READ_WRITE_TOKEN`
- Verify the token is not expired
- Ensure the Blob store is created in Vercel

---
**Once all items complete:** Mark status as "Complete"
