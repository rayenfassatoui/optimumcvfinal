# Change Proposal: Implement Core Features

## Summary
Implement the core functionality of Optimum CV, enabling users to create profiles, manage resumes with AI, and automate PFE (internship) applications by parsing PFE books.

## Problem
The process of finding and applying for internships (PFE) and jobs is manual, repetitive, and time-consuming. Students struggle to tailor their resumes for each application and identify relevant topics from lengthy PFE books.

## Solution
Build a comprehensive platform that:
1.  **Onboards users** efficiently, collecting their CV and LinkedIn data to create a structured `profile.md`.
2.  **Provides a Control Center** to view current status and resumes.
3.  **Offers AI Resume Management** to generate Harvard-style, ATS-friendly resumes.
4.  **Automates PFE Applications** by parsing company PFE books, matching topics to the user's profile, and generating tailored application materials (CV, Cover Letter, Email).

## Scope
### In Scope
- **User Auth & Onboarding**: Google Login, File Upload (CV), LinkedIn Link, Profile Generation.
- **Dashboard**: "Control Center" UI.
- **Resume Builder**: AI-powered resume tweaking and ATS optimization.
- **PFE Automation**: PDF upload, Topic Extraction, Matching Logic, Application Generation (CV, CL, Email).
- **Email Automation**: Automatic email sending via Gmail integration.

### Out of Scope
- Job scraping (focus is on uploaded PFE books).
