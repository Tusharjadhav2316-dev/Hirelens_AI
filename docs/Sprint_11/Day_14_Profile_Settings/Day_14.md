# Day 14 — Profile Settings

## Objective
Implement the comprehensive Profile Settings workspace matching **PDF Page 4**:
1. Page Header with settings icon tile, "Profile Settings", subtitle, and script accent *"Keep your profile updated for better opportunities."*.
2. Navigation Tabs: Personal Info (active), Account & Security, Preferences, Notifications, Subscription.
3. 2-Column Split:
   - **Left Form Card — Profile Information**:
     - Photo upload avatar with camera button and "Change Photo" trigger.
     - Form fields: Full Name, Email Address (with lock icon + "Linked with Google"), Phone Number, Location, Headline (with char count `36/120`), About Me textarea (`120/500`).
     - Education fields: College, Degree, Year of Graduation.
     - Social profiles: LinkedIn Profile and GitHub Profile inputs with brand icons.
     - "Save Changes" solid violet button.
   - **Right Rail**:
     - **Profile Completion**: 80% donut ring + status checklist (profile photo, headline, education, skills, work experience, LinkedIn).
     - **Skills**: Dynamic skill tag cloud with "+ Add Skill" trigger.
     - **Resume & Documents**: Default resume card thumbnail with "Default" badge and "Change Default Resume" button.

## Reference
- **PDF Page**: **4**
- **Route**: `/dashboard/settings`
