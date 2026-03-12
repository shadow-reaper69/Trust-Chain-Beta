# TrustChain v2.0 Architecture & Documentation

## Overview
TrustChain v2.0 is a highly advanced Universal Credential Verification Platform simulating real-world cryptographic ledger integration. It utilizes cryptographic hashing techniques, a simulated blockchain (via Postgres/Supabase), and Google Gemini Flash 2.0 AI for visual document anomaly detection.

## The Problem You Faced (Random Predefined Data)
When verifying a document on the `/verify` page, you likely noticed the system showing "Local Heuristic Engine" and generating predefined bounding boxes. 

**Why did this happen?**
Because you have not added a **Gemini API Key** to your environment! My code defaults to a random mathematical fallback (the Local Heuristic Engine) when it cannot reach Google Gemini.

### Fix 1: Add the Gemini AI Key
1. Go to [Google AI Studio (Gemini)](https://aistudio.google.com/app/apikey) and generate a free API key.
2. In your `<project-folder>/.env.local` file (and in Vercel environment variables), add the following line:
   ```env
   GEMINI_API_KEY=AIzaSy...your-key-here...
   ```
3. Restart your local server (`npm run dev`). The `/verify` page will instantly stop giving random predefined data, and will begin using literal AI OCR (Optical Character Recognition) to extract the name, title, signature offsets, and analyze the document for visual forgeries!

## Fix 2: Supabase Architecture 
My code simulates the Blockchain using your Supabase Postgres Database. 
You must ensure the following Table exists in your Supabase SQL Editor so that the hashes can be securely persisted.

**Run this exact SQL command in your Supabase SQL Editor:**
```sql
CREATE TABLE IF NOT EXISTS certificates_v2 (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  holder_name TEXT NOT NULL,
  title TEXT NOT NULL,
  issuer_name TEXT NOT NULL,
  issued_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  document_hash TEXT UNIQUE NOT NULL,
  blockchain_hash TEXT,
  status TEXT DEFAULT 'active',
  revoked BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Fix 3: Pinata (IPFS) Integration
TrustChain now supports decentralized storage via Pinata IPFS. When a certificate is issued, it is automatically pinned to the IPFS network.

1. Create a [Pinata account](https://pinata.cloud/).
2. Generate an API Key (with Admin permissions) and copy the **JWT Token**.
3. In your `.env.local`, add:
   ```env
   PINATA_JWT=your_jwt_here
   PINATA_API_KEY=your_key
   PINATA_SECRET_API_KEY=your_secret
   NEXT_PUBLIC_PINATA_GATEWAY=https://gateway.pinata.cloud
   ```

## How the Hashing & Verification Pipeline Works

1. **Auto-Generation & QR Embedding**
   When an admin goes to `/issue` and clicks **Issue Credential**, the system compiles a beautiful graphical PDF locally via `jsPDF`. We embed a secure cryptographic Hash QR Code dynamically in the lower-left corner. 
   
2. **Ledger & IPFS Storage**
   The system extracts the `SHA-256 Document Hash`. 
   - **Blockchain:** It anchors the hash to the Polygon network (simulated or real).
   - **IPFS:** It pins the actual document bytes to Pinata IPFS, returning a CID (Content Identifier).
   - **Registry:** (Optional) Stores metadata in Supabase.

3. **Multi-Mode Verification**
   Users can verify credentials in two ways:
    - **Document Upload:** Drop the PDF/Image to compare its local hash against the ledger.
    - **CID Verification:** Paste an IPFS CID. The system fetches the file from the gateway, hashes it, and verifies it against the blockchain state!

### System Roles
* **Admin Panel (`/admin`):** Monitor registered certificates and IPFS CIDs.
* **Issue Panel (`/issue`):** Generate and issue certificates to Polygon and IPFS.
* **Verify Panel (`/verify`):** Public verify panel supports both file upload and IPFS CID verification.
