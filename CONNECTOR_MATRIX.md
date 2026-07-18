# Connector Matrix

| Channel | CSV Export Source | Future Live API |
|---------|------------------|-----------------|
| LinkedIn | LinkedIn Analytics export (Campaign Manager) | LinkedIn Marketing API v2 |
| YouTube | YouTube Studio → Analytics → Export | YouTube Data API v3 |
| Blog | CMS export (WordPress, Ghost, Webflow) | WordPress REST API / Ghost Content API |
| Email Newsletter | Mailchimp / ConvertKit campaign export | Mailchimp API v3 / ConvertKit API |
| Reddit | Pushshift or manual subreddit export | Reddit API (OAuth2) |
| Google PPC | Google Ads report export | Google Ads API |

All connectors share the same interface: `parse(file)` for CSV/Excel, `connect()` for live API.
Same data shape regardless of source — agents receive normalized `ContentItem[]` arrays.
