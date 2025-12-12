# Spec: PFE Automation

## ADDED Requirements

### User can upload PFE Book
#### Scenario: Upload PDF
- Given the user is on the PFE section
- When they upload a "PFE Book" PDF
- Then the system should parse the PDF
- And extract individual internship topics

#### Scenario: Parsing Failure
- Given the uploaded PDF is scanned or unreadable
- Then the system should notify the user
- And provide an option to upload a different file

### System matches topics to profile
#### Scenario: Topic Matching
- Given topics have been extracted
- When the system processes them
- Then it should compare each topic against the user's `profile.md`
- And assign a "Fit Score" to each topic
- And display the topics sorted by score

### User can apply to a topic
#### Scenario: Generating Application
- Given the user selects a topic
- When they click "Apply"
- Then the system should generate a tailored CV for that topic
- And generate a specific Cover Letter
- And generate an email body
- And show a confirmation screen

#### Scenario: Manual Edit
- Given the application materials are generated
- When the user reviews them
- Then they should be able to edit the CV content, Cover Letter, and Email Body manually
- And save the changes before sending

#### Scenario: Sending Application
- Given the application materials are generated
- When the user confirms
- Then the system should automatically send the email via Gmail API
- And mark the application as "SENT"
