# Footer Administration Setup

This document explains how to set up and use the footer administration functionality in Bethany Marketplace.

## Features

- Admin interface to manage footer content
- Dynamic categories from the database
- Contact information management
- Social media links configuration
- Settings stored in Supabase database

## Setup Instructions

### 1. Create the Settings Table

Run the migration script to create the Settings table in your Supabase database:

```bash
node src/scripts/migrations/createSettingsTable.js
```

This will create a Settings table with the necessary structure and policies, and populate it with default footer settings.

If the automatic migration fails, you can manually run the SQL commands that will be displayed in the console.

### 2. Access the Footer Admin Panel

1. Log in to the admin dashboard
2. Navigate to "Footer Settings" in the Configuration section
3. Update the contact information and social links
4. Click "Save Changes" to update the footer content

## How It Works

### Data Storage

- Footer settings are stored in the `Settings` table with a key of "footer"
- The value is a JSON object containing contact information and social media links
- Categories are pulled from the existing categories management system

### Components

The footer is divided into several components:

- `Footer`: The main component that orchestrates the layout
- `FooterCategoriesWithContact`: Server component for fetching categories and contact information
- `FooterSocialLinks`: Server component for fetching and displaying social links
- `FooterSearchForm`: Client component for the search form
- `NewsletterSignup`: Client component for the newsletter form

### Server Actions

- `getPublicFooterSettings()`: Cached server action for fetching footer settings
- `getFooterSettings()`: Admin-only server action for fetching settings
- `updateFooterSettings()`: Admin-only server action for updating settings

## Troubleshooting

If you encounter issues with the footer content not updating:

1. Check that you have admin rights in the system
2. Verify the Settings table exists and contains a "footer" entry
3. Check for any console errors during save operations
4. Try manually navigating to a different page after saving to force a cache reset

## Customizing Default Settings

The default footer settings can be modified in:
- `src/actions/settings/footer.ts` for the admin interface
- `src/actions/settings/getPublicFooterSettings.ts` for the public interface
- `src/scripts/migrations/createSettingsTable.js` for initial setup 