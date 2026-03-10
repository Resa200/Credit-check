# PRD — CreditCheck: Identity & Credit Verification App

**Version:** 2.0
**Stack:** React + Vite, Shadcn/ui, Tailwind CSS
**API:** Adjutor API v2 (`https://adjutor.lendsqr.com/v2/`)
**Auth:** `Authorization: Bearer {VITE_ADJUTOR_API_KEY}`
**Design:** Minimalist, Figma-inspired, mobile-first
**Color Scheme:** Option D — Slate & Violet

---

## 1. Overview

CreditCheck is a self-service financial verification portal that gives individuals instant access to their identity and credit information. Users land on the app, choose the verification service they need, provide the required details, and receive a clean, human-readable result — no bank visit, no phone calls.

The credit report is the centrepiece of the app and is formatted as a downloadable PDF.

---

## 2. Services

Three services are available, each mapped to a specific Adjutor API endpoint:

| # | Service | What It Does | Adjutor Endpoint | Key Input |
|---|---|---|---|---|
| 1 | **BVN Lookup** | Retrieve identity details tied to a BVN via OTP consent | `POST /verification/bvn/:bvn/accounts` → `PUT` with OTP | BVN + contact (email or phone) |
| 2 | **Account Verification** | Confirm a bank account exists and retrieve account name + linked BVN | `POST /verification/bankaccount/bvn` | Account number + bank |
| 3 | **Credit Report** | Pull a full bureau credit report from CRC or FirstCentral. Download as PDF. | `GET /creditbureaus/{bureau}/{bvn}` | BVN + bureau choice |

---

## 3. Color Scheme — Slate & Violet

```
Background:   #FAFAFA
Surface:      #FFFFFF
Primary:      #7C3AED   (violet)
Accent:       #F59E0B   (amber — used for score indicators and highlights)
Text:         #1E293B
Muted Text:   #94A3B8
Border:       #E2E8F0
Success:      #10B981
Error:        #F43F5E
```

Applied via Tailwind CSS custom tokens in `tailwind.config.ts`.

---

## 4. User Flow

```
Landing Page
    ↓
Service Selection Screen
    ↓ (user picks one of three services)
Service Input Form
    ↓
Verification / Loading State
    ↓
Result Summary Screen
    ↓ (for Credit Report only)
Download PDF
```

---

## 5. Screen-by-Screen Specification

---

### Screen 1 — Landing Page

**Purpose:** First impression. Communicate trust and speed.

**Elements:**
- App logo + name: **CreditCheck**
- Tagline: *"Know your financial standing. Instantly."*
- Sub-copy: *"Verify your BVN, confirm bank accounts, and check your credit report — all in one place."*
- Single CTA button: **"Get Started →"**
- Footer note: *"Powered by Adjutor"* + lock icon (*"Your data is secure"*)
- Subtle violet gradient or geometric background pattern

---

### Screen 2 — Service Selection

**Purpose:** Let the user choose what they want to verify. Every card is self-explanatory — no external guide needed.

**Layout:** Responsive card grid — 1 column on mobile, 3 columns on desktop.

**Each card contains:**
- Service icon
- Service name (bold)
- One-line plain-English description
- Supporting badge (e.g. *"Requires OTP"*, *"Instant result"*, *"Downloads as PDF"*)
- **"Select →"** button

**Service Cards:**

```
┌──────────────────────────────────┐
│  🪪  BVN Lookup                  │
│                                  │
│  Retrieve your name, date of     │
│  birth, phone, and photo linked  │
│  to your BVN.                    │
│                                  │
│  [Requires OTP consent]          │
│                   [Select →]     │
└──────────────────────────────────┘

┌──────────────────────────────────┐
│  🏦  Account Verification        │
│                                  │
│  Confirm that a bank account     │
│  belongs to you and get the      │
│  registered account name.        │
│                                  │
│  [Instant result]                │
│                   [Select →]     │
└──────────────────────────────────┘

┌──────────────────────────────────┐
│  📄  Credit Report               │
│                                  │
│  Pull your full credit bureau    │
│  report from CRC or FirstCentral │
│  and download it as a PDF.       │
│                                  │
│  [CRC | FirstCentral]            │
│                   [Select →]     │
└──────────────────────────────────┘
```

---

### Screen 3A — BVN Lookup

#### Step 1 — Input Form

| Field | Type | Validation | Tooltip Text |
|---|---|---|---|
| BVN | Text — 11 digits | Exactly 11 numeric characters | *"Your BVN is an 11-digit number. Dial \*565\*0# on your registered phone to find it."* |
| Contact (email or phone) | Text | Valid email OR Nigerian phone (`+234XXXXXXXXXX`) | *"An OTP will be sent to the phone number or email registered to this BVN."* |

**Submit triggers:** `POST /verification/bvn/:bvn/accounts` with body `{ contact }`

---

#### Step 2 — OTP Verification

- Display: *"A one-time code has been sent to [masked contact e.g. 080\*\*\*1234]"*
- 6-digit OTP input field
- Resend OTP link — disabled for 30 seconds after each send
- Submit triggers: `PUT /verification/bvn/:bvn/accounts` with body `{ otp }`

---

#### Step 3 — Result Screen

API response `data` fields mapped to readable labels:

```
┌──────────────────────────────────────────────────┐
│  ✅  BVN Verified                                 │
├──────────────────────────────────────────────────┤
│  Full Name         James Adewale Okoye           │
│  BVN               222*****789          [👁 Show] │
│  Date of Birth     15 March 1990                 │
│  Phone             080***1234           [👁 Show] │
│  Email             j***@gmail.com       [👁 Show] │
│  Gender            Male                          │
│  State             Lagos                         │
│  [Profile Photo — shown if image_url present]    │
├──────────────────────────────────────────────────┤
│  [Check Another]            [Back to Services]   │
└──────────────────────────────────────────────────┘
```

**Field mapping from API response:**

| API Field | Display Label |
|---|---|
| `first_name` + `middle_name` + `last_name` | Full Name |
| `bvn` | BVN (masked) |
| `dob` | Date of Birth (formatted) |
| `mobile` | Phone (masked) |
| `email` | Email (masked) |
| `gender` | Gender |
| `state_of_residence` | State |
| `image_url` | Profile Photo |

Sensitive fields (BVN, phone, email) are masked by default with a 👁 toggle to reveal.

---

### Screen 3B — Account Verification

#### Input Form

| Field | Type | Validation | Tooltip Text |
|---|---|---|---|
| Account Number | Text — 10 digits | Exactly 10 numeric characters | *"Your 10-digit NUBAN account number printed on your bank card or statement."* |
| Bank | Searchable dropdown | Required | *"Select the bank where this account is held."* |

Bank list is fetched from the Adjutor banks endpoint on page load and cached in state.

**Submit triggers:** `POST /verification/bankaccount/bvn` with body `{ account_number, bank_code }`

---

#### Result Screen

```
┌──────────────────────────────────────────────────┐
│  ✅  Account Verified                             │
├──────────────────────────────────────────────────┤
│  Account Name      JAMES ADEWALE OKOYE           │
│  Account Number    012***7890           [👁 Show] │
│  Bank Code         058                           │
│  Linked BVN        222*****789          [👁 Show] │
├──────────────────────────────────────────────────┤
│  [Check Another]            [Back to Services]   │
└──────────────────────────────────────────────────┘
```

**Field mapping from API response:**

| API Field | Display Label |
|---|---|
| `account_name` | Account Name |
| `account_number` | Account Number (masked) |
| `bank_code` | Bank Code |
| `bvn` | Linked BVN (masked) |

**Error state:** Red banner — *"We could not verify this account. Please check the account number and selected bank, then try again."* + Edit button to return to the form.

---

### Screen 3C — Credit Report

#### Input Form

| Field | Type | Validation | Tooltip Text |
|---|---|---|---|
| BVN | Text — 11 digits | Exactly 11 numeric characters | *"Your BVN is used to retrieve your credit history from the bureau."* |
| Bureau | Radio / Toggle | Required — one of `CRC` or `FirstCentral` | *"CRC and FirstCentral are Nigeria's two major credit bureaus. Your report may differ slightly between them."* |

**Submit triggers:** `GET /creditbureaus/{bureau}/{bvn}`
- `{bureau}`: `crc` or `firstcentral`
- `{bvn}`: the BVN value

---

#### Result Screen — On-Screen Report

```
┌─────────────────────────────────────────────────────────┐
│  📄  Credit Report — CRC Bureau                         │
│  James Adewale Okoye     |     Generated: 10 Mar 2026   │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  CREDIT SCORE                                           │
│  ┌───────────────────────────────────┐                 │
│  │  [Arc Gauge Visualisation]        │                 │
│  │  Score: 680 / 850                 │                 │
│  │  Rating: GOOD  ✅                 │                 │
│  └───────────────────────────────────┘                 │
│                                                         │
├─────────────────────────────────────────────────────────┤
│  PERSONAL INFORMATION                    [▼ Expand]    │
│  Name · DOB · Gender · Address · Phone                  │
├─────────────────────────────────────────────────────────┤
│  LOAN SUMMARY                            [▼ Expand]    │
│  Total Facilities     4                                 │
│  Active Loans         1                                 │
│  Settled Loans        3                                 │
│  Past Due             0                                 │
│  Total Outstanding    ₦120,000                         │
├─────────────────────────────────────────────────────────┤
│  LOAN HISTORY                            [▼ Expand]    │
│  ┌────────────┬──────────┬──────────┬──────────┐       │
│  │ Lender     │ Amount   │ Status   │ Date     │       │
│  ├────────────┼──────────┼──────────┼──────────┤       │
│  │ Bank A     │ ₦50,000  │ Settled  │ Jan 2023 │       │
│  │ Fintech B  │ ₦120,000 │ Active   │ Nov 2024 │       │
│  └────────────┴──────────┴──────────┴──────────┘       │
├─────────────────────────────────────────────────────────┤
│  ENQUIRY HISTORY                         [▼ Expand]    │
│  Times your report was checked in the last 12 months    │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  [⬇️  Download PDF Report]       [Back to Services]    │
└─────────────────────────────────────────────────────────┘
```

The bureau returns raw JSON. All fields from the `data` object are mapped to labelled, human-readable sections. Unknown or null fields are hidden gracefully — never shown as raw keys or `null`.

---

#### PDF Report Structure

Generated client-side using `jsPDF` + `html2canvas`.

| Page | Content |
|---|---|
| Cover | CreditCheck logo · Bureau name · Generated date · User full name |
| Page 2 | Credit score gauge · Personal information |
| Page 3 | Loan summary stats · Full loan history table |
| Page 4 | Enquiry history · Disclaimer |
| All pages | Footer: *"Generated via CreditCheck · Powered by Adjutor"* |

---

## 6. Error & Edge Case Handling

| Scenario | UI Response |
|---|---|
| API returns failure status | Red toast + inline error message + "Try Again" button |
| BVN not found | *"No record found for this BVN. Please double-check and retry."* |
| Invalid OTP | Inline field error + immediate resend option |
| Account number mismatch | Red banner + "Edit Details" button |
| Bureau returns empty data | *"No credit history found. This may mean your BVN has not been used for any loans."* |
| Network / connection error | *"Connection issue. Check your internet connection and try again."* |
| Rate limit or cost error | *"Request limit reached. Please try again shortly."* |

---

## 7. UX Rules

| Rule | Implementation |
|---|---|
| No technical jargon | *"Linked BVN"* not `bvn_reference`; *"Loan defaulted"* not `karma_type: credit` |
| Every field has a tooltip | `?` icon — tap or hover reveals a plain-English hint |
| Sensitive data masked by default | BVN, phone, email shown as `222*****789` with 👁 toggle to reveal |
| All async states are visible | Skeleton loader → spinner → result or error — no blank screens |
| Errors are specific and actionable | Each error state tells the user exactly what went wrong and what to do |
| No dead ends | Every result screen has **"Check Another"** and **"Back to Services"** |
| Consent acknowledged before data retrieval | Banner: *"By proceeding, you confirm you are checking your own details or have explicit permission from the individual."* |
| Mobile first | Designed at 375px minimum width; card grid collapses to single column |

---

## 8. Folder Structure — Atomic Design

```
src/
├── assets/
│   └── logo.svg
├── components/
│   ├── atoms/
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Label.tsx
│   │   ├── Badge.tsx
│   │   ├── Spinner.tsx
│   │   ├── Tooltip.tsx
│   │   └── MaskedText.tsx            ← shows/hides sensitive values
│   ├── molecules/
│   │   ├── FormField.tsx             ← Label + Input + Tooltip + Error
│   │   ├── BankSelector.tsx          ← Searchable bank dropdown
│   │   ├── OTPInput.tsx              ← 6-digit OTP with resend timer
│   │   ├── ServiceCard.tsx           ← Card for service selection grid
│   │   ├── StatusBadge.tsx           ← Verified / Not Found / Error
│   │   ├── DataRow.tsx               ← "Label: Value" row in result screens
│   │   ├── LoanHistoryTable.tsx      ← Tabular loan records
│   │   └── CreditScoreGauge.tsx      ← Arc/semicircle score visualisation
│   ├── organisms/
│   │   ├── ServiceGrid.tsx           ← Service selection screen layout
│   │   ├── BVNForm.tsx               ← BVN + contact input
│   │   ├── OTPForm.tsx               ← OTP step
│   │   ├── AccountForm.tsx           ← Account number + bank selector
│   │   ├── CreditReportForm.tsx      ← BVN + bureau toggle
│   │   ├── BVNResult.tsx             ← BVN lookup result card
│   │   ├── AccountResult.tsx         ← Account verification result card
│   │   └── CreditReportResult.tsx    ← Full credit report with PDF download
│   └── templates/
│       ├── AppShell.tsx              ← Header, footer, max-width wrapper
│       └── ServiceLayout.tsx         ← Back button + centred card layout
├── pages/
│   ├── Landing.tsx
│   ├── Services.tsx                  ← Service selection grid
│   └── Verify.tsx                    ← Renders correct form + result by service
├── hooks/
│   ├── useAdjutor.ts                 ← All API calls (BVN, account, credit)
│   ├── useBankList.ts                ← Fetch + cache bank list
│   └── useOTPTimer.ts                ← 30-second resend countdown
├── lib/
│   ├── adjutor.ts                    ← Fetch wrapper + Authorization header
│   ├── validators.ts                 ← BVN (11 digits), account (10), phone, email
│   ├── reportPDF.ts                  ← jsPDF credit report generator
│   └── utils.ts                      ← Masking, date formatting, field mapping
├── store/
│   └── appStore.ts                   ← Zustand: activeService, formData, result, step
├── types/
│   └── adjutor.types.ts              ← Typed interfaces for all API responses
└── main.tsx
```

---

## 9. Application State — Zustand

```ts
type Step = 'select' | 'input' | 'otp' | 'loading' | 'result' | 'error'
type Service = 'bvn' | 'account' | 'credit' | null

{
  activeService: Service,
  step: Step,
  formData: Record<string, string>,
  result: AdjutorResponse | null,
  error: string | null,

  // actions
  selectService: (service: Service) => void,
  setFormData: (data: Record<string, string>) => void,
  setResult: (data: AdjutorResponse) => void,
  setStep: (step: Step) => void,
  reset: () => void
}
```

---

## 10. API Reference

### Authentication
All requests include:
```
Authorization: Bearer {VITE_ADJUTOR_API_KEY}
Content-Type: application/json
```

### BVN Lookup — Step 1 (Initiate OTP)
```
POST /verification/bvn/:bvn/accounts
Body: { "contact": "email_or_phone" }

Response:
{
  "status": "otp",
  "message": "Please provide OTP sent to contact",
  "data": "masked_contact",
  "meta": { "cost": 0, "balance": number }
}
```

### BVN Lookup — Step 2 (Verify OTP)
```
PUT /verification/bvn/:bvn/accounts
Body: { "otp": "123456" }

Response:
{
  "status": "success",
  "data": {
    "reference": number,
    "bvn": "string",
    "first_name": "string",
    "middle_name": "string",
    "last_name": "string",
    "dob": "YYYY-MM-DD",
    "mobile": "string",
    "email": "string",
    "gender": "string",
    "state_of_residence": "string",
    "image_url": "string"
  },
  "meta": { "cost": 20, "balance": number }
}
```

### Account Verification
```
POST /verification/bankaccount/bvn
Body: { "account_number": "string", "bank_code": "string" }

Response:
{
  "status": "success",
  "data": {
    "bank_code": "string",
    "account_name": "string",
    "account_number": "string",
    "bvn": "string"
  },
  "meta": { "cost": 10, "balance": number }
}
```

### Credit Report
```
GET /creditbureaus/{bureau}/{bvn}
bureau: "crc" | "firstcentral"

Response:
{
  "status": "success",
  "data": { /* bureau-specific credit report object */ },
  "meta": { "cost": number, "balance": number }
}
```

---

## 11. Libraries

| Purpose | Library |
|---|---|
| UI components | `shadcn/ui` |
| Styling | `tailwindcss` |
| State management | `zustand` |
| Form handling | `react-hook-form` |
| Validation schema | `zod` |
| PDF generation | `jspdf` + `html2canvas` |
| Icons | `lucide-react` |
| Routing | `react-router-dom` v6 |
| Toast notifications | `sonner` |

---

## 12. Environment Configuration

```env
# .env
VITE_ADJUTOR_API_KEY=your_bearer_token_here
VITE_ADJUTOR_BASE_URL=https://adjutor.lendsqr.com/v2
```

The API key must never be hard-coded. All references in code use `import.meta.env.VITE_ADJUTOR_API_KEY`.

---

## 13. Compliance

- A **consent banner** is shown before any verification action: *"By proceeding, you confirm you are verifying your own details or have explicit permission from the individual."*
- The BVN OTP flow is Adjutor's built-in consent mechanism, satisfying NDPR data privacy requirements.
- No user data is stored, persisted, or logged client-side. All state is in-memory and cleared on reset or page refresh.
