# Tasks: Implement Core Features

## Phase 1: Foundation & Onboarding
- [ ] Define Drizzle schema for `profile`, `pfe_book`, `pfe_topic`, `application`. <!-- id: schema-setup -->
- [ ] Run database migrations. <!-- id: db-migrate -->
- [ ] Implement `features/onboarding` UI (Upload CV, LinkedIn input). <!-- id: onboarding-ui -->
- [ ] Implement AI action to parse CV and generate `profile.md`. <!-- id: profile-gen -->
- [ ] Implement manual profile editing UI (to correct AI parsing). <!-- id: profile-edit -->
- [ ] Save profile to database and redirect to dashboard. <!-- id: save-profile -->

## Phase 2: Dashboard & Resume Management
- [ ] Create `features/dashboard` UI (Control Center). <!-- id: dashboard-ui -->
- [ ] Display current resume/profile in dashboard. <!-- id: display-profile -->
- [ ] Implement `features/resume` editor UI. <!-- id: resume-editor -->
- [ ] Set up `@react-pdf/renderer` and create "Harvard" template component. <!-- id: react-pdf-setup -->
- [ ] Implement AI action to tweak/update resume. <!-- id: resume-update -->
- [ ] Implement ATS optimization action. <!-- id: ats-optimize -->

## Phase 3: PFE Automation
- [ ] Implement `features/pfe` UI for uploading PFE books. <!-- id: pfe-upload -->
- [ ] Implement AI action to parse PDF and extract topics (with chunking for large files). <!-- id: pfe-parse -->
- [ ] Handle PDF parsing errors (empty text/scanned files). <!-- id: pfe-error-handling -->
- [ ] Display extracted topics as cards. <!-- id: topic-display -->
- [ ] Implement matching logic (Profile vs Topic) and display scores. <!-- id: topic-match -->
- [ ] Implement "Apply" flow: Generate tailored CV, Cover Letter, Email. <!-- id: generate-app -->
- [ ] UI for reviewing and confirming generated application materials (Manual Edit mode). <!-- id: review-app -->
- [ ] Implement Gmail API integration for automatic sending. <!-- id: gmail-send -->
- [ ] Handle Gmail token expiry and rate limits. <!-- id: gmail-error-handling -->
