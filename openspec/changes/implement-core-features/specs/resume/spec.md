# Spec: Resume Management

## ADDED Requirements

### User can update their profile/resume with AI
#### Scenario: AI Tweak
- Given the user is viewing their resume
- When they ask AI to "Make it more professional"
- Then the system should update the `profile.md` content
- And regenerate the rendered resume view

### User can optimize for ATS
#### Scenario: ATS Optimization
- Given the user has a resume
- When they click "Optimize for ATS"
- Then the system should adjust keywords and formatting to be ATS-friendly
- And provide a score or feedback

### System handles rendering constraints
#### Scenario: Content Overflow
- Given the generated resume exceeds one page
- Then the system should display a warning
- And offer an "Auto-Condense" option to shorten descriptions
