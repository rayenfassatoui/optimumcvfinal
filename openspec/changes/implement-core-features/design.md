# Design: Core Features Architecture

## Architecture
We will follow the Feature-Driven Architecture.

### Features
1.  **`features/onboarding`**:
    - Handles the initial user flow after signup.
    - Components: `OnboardingForm`, `CVUpload`, `LinkedInInput`.
    - Actions: `generateProfileFromCV`, `saveProfile`.
2.  **`features/dashboard`**:
    - Displays the Control Center.
    - Components: `DashboardLayout`, `ResumePreview`, `ApplicationStats`.
3.  **`features/resume`**:
    - AI-powered resume editor.
    - Components: `ResumeEditor`, `ATSOptimizer`.
    - Actions: `updateResume`, `optimizeForATS`.
4.  **`features/pfe`**:
    - PFE Book management and application generation.
    - Components: `PFEBookUpload`, `TopicList`, `TopicCard`, `ApplicationPreview`.
    - Components: `PFEBookUpload`, `TopicList`, `TopicCard`, `ApplicationPreview`.
    - Actions: `parsePFEBook`, `matchTopics`, `generateApplication`, `sendApplicationEmail`.

## External Integrations

### Gmail Integration
- Use Google OAuth 2.0 (via Better-auth or separate setup) to request `https://www.googleapis.com/auth/gmail.send` scope.
- Use `googleapis` library to send emails on behalf of the user.
- Store refresh tokens securely (handled by Better-auth account linking usually, but need to ensure scope is present).

## Data Model (Drizzle/Postgres)

### `user` (Existing)
- Extended with `onboardingCompleted` (boolean).

### `profile`
- `userId` (FK)
- `content` (Text - Markdown representation)
- `originalCvUrl` (Text)
- `linkedinUrl` (Text)

### `pfe_book`
- `id`
- `userId` (FK)
- `fileUrl` (Text)
- `companyName` (Text)
- `uploadedAt`

### `pfe_topic`
- `id`
- `bookId` (FK)
- `title` (Text)
- `description` (Text)
- `referenceNumber` (Text)
- `techStack` (JSON)

### `application`
- `id`
- `userId` (FK)
- `topicId` (FK)
- `status` (Enum: DRAFT, GENERATED, SENT)
- `generatedCvUrl` (Text)
- `coverLetterContent` (Text)
- `emailBody` (Text)

## AI Integration Strategy
- **Provider**: OpenRouter (access to multiple models like Gemini, Claude, GPT).
- **Profile Generation**: CV (PDF/Text) -> LLM -> Structured Markdown Profile.
- **PFE Parsing**: PFE Book (PDF) -> LLM -> List of JSON Topics.
- **Matching**: Profile + Topic -> LLM -> Score (0-100) + Reasoning.
- **Generation**:
    - **Content**: Profile + Topic -> LLM -> Tailored JSON Data.
    - **Rendering**: JSON Data -> `@react-pdf/renderer` (Harvard Template) -> PDF File.
    - **Cover Letter/Email**: LLM -> Text.

## Error Handling & Edge Cases

### PDF Parsing
- **Scanned PDFs**: If text extraction fails (empty string), notify user that OCR is required or file is invalid.
- **Large Files**: Enforce file size limit (e.g., 10MB) to prevent timeouts.

### AI Processing
- **Token Limits**: Chunk large PFE books before sending to LLM.
- **Hallucinations**: Provide a "Manual Edit" mode for Profile and Generated Content so users can correct AI mistakes before saving/sending.
- **Rate Limits**: Handle OpenRouter 429 errors with exponential backoff.

### Email Integration
- **Token Expiry**: Handle `invalid_grant` errors from Gmail API by prompting user to re-authenticate.
- **Daily Limits**: Track email sending to avoid hitting Gmail's daily quotas.

### Resume Rendering
- **Overflow**: Detect if content exceeds 1 page (common Harvard style constraint) and warn user or attempt to condense via AI.
