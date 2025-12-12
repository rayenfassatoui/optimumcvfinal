# Spec: Control Center (Dashboard)

## ADDED Requirements

### Dashboard displays user status
#### Scenario: Viewing Dashboard
- Given the user has completed onboarding
- When they visit `/dashboard`
- Then they should see their current Resume/Profile summary
- And they should see a list of Active Applications (initially empty)

### Dashboard provides navigation to features
#### Scenario: Navigation
- Given the user is on the Dashboard
- Then they should see options to "Edit Resume" and "Upload PFE Book"
