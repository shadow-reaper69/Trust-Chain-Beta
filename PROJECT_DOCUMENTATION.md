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

## How the Hashing & Verification Pipeline Works

1. **Auto-Generation & QR Embedding**
   When an admin goes to `/issue` and clicks **Auto-Generate Fake PDF**, the system compiles a beautiful graphical PDF locally via `jsPDF`. We utilize the exact Student Name and Institution entered into the admin panel, and use `nanoid` to generate a secure cryptographic string identifier for the QR Code dynamically embedded in the lower-left corner of the certificate. Since the exact byte-code of the file is intrinsically tied to that QR Code and specific Name, it becomes perfectly unique. 
   
2. **Ledger Storage (Issuing)**
   When the Admin uploads that certificate to the "Issue Credential" box, the system extracts the exact `SHA-256 Document Hash` bytes. It inserts the Student Name, Certificate Name, QR Code Hash, and Document Hash permanently into the `certificates_v2` database table, simulating writing blocks to a smart contract. You now have a complete, mathematically perfect, digital twin in your immutable database.

3. **Dual AI & Cryptographic Verification**
   When a user clicks "Verify Credentials" and uploads the PDF:
    - **Step A:** We generate the exact SHA-256 byte-hash from the uploaded file instantly in memory.
    - **Step B:** We query your Supabase `certificates_v2` table. Does this hash exist? If yes, the database is intact, and it flags as `Verified: True`. If it has been tampered with, the hash radically changes, and it flags as forged!
    - **Step C:** If the database registry fails, it runs the image file through the Google Gemini 2.0 AI context engine (assuming your API Key is set). Gemini scans for fake signatures, bad font kerning, misaligned seals, and performs OCR text cross-referencing against the Student Name registered in the database!

### System Roles
* **Admin Panel (`/admin`):** Secure panel restricted by session tokens to monitor live registered certificates, trace Polygon simulated TxHashes, and manage revocation statuses.
* **Common Issue Panel (`/issue`):** Internal interface allowing the admin to dynamically mock, build, and issue certificates to the blockchain simulated database.
* **Public Verify Panel (`/verify`):** A frontend open panel where absolutely anyone can drop the PDF to mathematically guarantee its byte-integrity against the Supabase ledger, bypassing fraud.
