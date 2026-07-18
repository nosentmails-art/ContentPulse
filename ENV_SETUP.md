# Environment Setup

## Required `.env` File

Create a file called `.env` in the project root with these variables:

```
DATABASE_URL="file:./prisma/dev.db"
```

That's all that's needed for the hackathon build.

---

## Future API Keys (Post-Hackathon)

These are NOT needed now. Add when building live API connectors:

```
# YouTube Data API v3
# Get from: console.cloud.google.com → Enable YouTube Data API v3 → Create API Key
YOUTUBE_API_KEY=

# Reddit API
# Get from: reddit.com/prefs/apps → Create app (script type)
REDDIT_CLIENT_ID=
REDDIT_CLIENT_SECRET=

# LinkedIn Marketing API
# Get from: linkedin.com/developers → Create app
LINKEDIN_CLIENT_ID=
LINKEDIN_CLIENT_SECRET=

# Google Analytics 4
# Get from: console.cloud.google.com → Enable GA4 API
GA4_PROPERTY_ID=
GA4_SERVICE_ACCOUNT_KEY=

# Email (for report distribution)
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASS=
```

---

## `.env.example` Template

Commit this file (without real values) so teammates know what's needed:

```
DATABASE_URL="file:./prisma/dev.db"
YOUTUBE_API_KEY=
REDDIT_CLIENT_ID=
REDDIT_CLIENT_SECRET=
LINKEDIN_CLIENT_ID=
LINKEDIN_CLIENT_SECRET=
```

---

## Never commit `.env` to Git

It is already in `.gitignore`. Never remove it from there.
