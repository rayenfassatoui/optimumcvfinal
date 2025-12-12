# Spec: User Onboarding

## ADDED Requirements

### User must complete onboarding after signup
#### Scenario: New user logs in
- Given a new user signs up via Google
- When they are redirected to the app
- Then they should see the Onboarding screen
- And they cannot access the Dashboard until onboarding is complete

### User can upload CV and provide details
#### Scenario: Uploading CV
- Given the user is on the Onboarding screen
- When they upload a PDF resume
- Then the system should parse it using AI
- And populate the profile data automatically

#### Scenario: Invalid CV Upload
- Given the user uploads a corrupt or image-only PDF
- Then the system should detect the failure
- And display an error message "Could not read text from PDF"
- And allow the user to manually enter their details

#### Scenario: Providing LinkedIn
- Given the user is on the Onboarding screen
- When they paste their LinkedIn URL
- Then it should be saved with their profile

### System generates a Profile Markdown
#### Scenario: Profile Generation
- Given the user has provided CV and details
- When they click "Confirm"
- Then a `profile.md` file should be generated and stored in the database
- And the user should be redirected to the Control Center
