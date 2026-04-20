# MeshShrink – Setup Guide

## Prerequisites

- Node.js ≥ 18
- npm ≥ 9

---

## 1. Clone & Install

```bash
git clone <repo-url>
cd <repo>
npm install
```

---

## 2. Environment Variables

Copy the example file and fill in values:

```bash
cp .env.example .env.local
```

### Minimum (local dev)

```env
NODE_ENV=development
MAX_UPLOAD_BYTES=10485760   # 10 MB
LOCAL_UPLOAD_DIR=./uploads
STORAGE_PROVIDER=local
RATE_LIMIT_MAX=10
RATE_LIMIT_WINDOW=60
```

### S3 / Cloudflare R2 (production)

```env
STORAGE_PROVIDER=s3
S3_BUCKET=your-bucket
S3_REGION=auto
S3_ACCESS_KEY_ID=...
S3_SECRET_ACCESS_KEY=...
S3_ENDPOINT=https://<account>.r2.cloudflarestorage.com  # R2 only
```

---

## 3. Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## 4. Key Routes

| Route | Description |
|---|---|
| `/` | Landing page |
| `/dashboard` | Upload + compress UI |
| `/pricing` | Pricing tiers (stub) |
| `POST /api/compress` | Upload & compress a file |
| `GET /api/download/[id]` | Download a compressed file |
| `GET /api/history` | Session compression history |

---

## 5. API Usage (developer mode)

```bash
curl -X POST http://localhost:3000/api/compress \
  -F "file=@model.glb" \
  -F 'options={"methods":["draco"],"dracoLevel":7,"textureResize":1024,"prune":true,"dedup":true}'
```

Response:

```json
{
  "job": {
    "id": "uuid",
    "originalName": "model.glb",
    "originalSize": 2048000,
    "compressedSize": 512000,
    "reductionPct": 75.0,
    "status": "done",
    "downloadUrl": "/api/download/uuid-compressed.glb",
    "options": { ... },
    "createdAt": 1700000000000
  }
}
```

---

## 6. Compression Options Reference

| Field | Type | Default | Description |
|---|---|---|---|
| `methods` | `("draco"\|"meshopt"\|"ktx2")[]` | `["draco"]` | Compression methods to apply |
| `dracoLevel` | `1–10` | `7` | Draco quantization level (higher = smaller) |
| `textureResize` | `number` | `0` | Max texture dimension in px (0 = no resize) |
| `prune` | `boolean` | `true` | Remove unused nodes/materials |
| `dedup` | `boolean` | `true` | Deduplicate identical accessors/textures |

---

## 7. Project Structure

```
/app
  /api
    /compress/route.ts      ← Upload + compression endpoint
    /download/[id]/route.ts ← File download endpoint
    /history/route.ts       ← Session history endpoint
  /dashboard/page.tsx       ← Main UI
  /pricing/page.tsx         ← Pricing page
  layout.tsx                ← Root layout
  page.tsx                  ← Landing page
/components
  DropZone.tsx              ← Drag-and-drop upload
  CompressionSettings.tsx   ← Options panel
  ResultCard.tsx            ← Compression result display
  HistoryList.tsx           ← Recent jobs list
  Header.tsx / Footer.tsx
/lib
  /compression/pipeline.ts  ← glTF-Transform pipeline
  /storage/
    index.ts                ← Provider factory
    local.ts                ← Local disk storage
    s3.ts                   ← S3-compatible storage
  ratelimit.ts              ← Rate limiter
  session.ts                ← In-memory session history
/types/index.ts             ← Shared TypeScript types
```

---

## 8. Scaling to Production

1. **Storage**: Set `STORAGE_PROVIDER=s3` and configure S3/R2 credentials.
2. **Rate limiting**: Replace `RateLimiterMemory` in `lib/ratelimit.ts` with `RateLimiterRedis` pointing at a Redis instance.
3. **Queue**: Wrap `compressGltf` in a BullMQ job for large-file async processing.
4. **Auth**: Add NextAuth or a magic-link library; thread `userId` through session history.
5. **Stripe**: Wire `STRIPE_SECRET_KEY` and create checkout sessions for Pro/Team plans.
6. **KTX2**: Install `basis_universal` package and enable the `ktx2` method.

---

## 9. Test File

Any `.glb` file works. For a quick test, download the official glTF sample:

```bash
curl -L https://github.com/KhronosGroup/glTF-Sample-Models/raw/master/2.0/Box/glTF-Binary/Box.glb -o test-box.glb
```

Then upload `test-box.glb` via the dashboard or the curl command above.
