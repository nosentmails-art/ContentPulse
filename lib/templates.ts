// CSV template generator for all channels
// Each template has headers + 2 example rows

type Channel =
  | 'LINKEDIN'
  | 'YOUTUBE'
  | 'BLOG'
  | 'EMAIL_NEWSLETTER'
  | 'REDDIT'
  | 'GOOGLE_PPC';

export function getTemplate(channel: Channel): string {
  const templates: Record<Channel, string> = {
    LINKEDIN: `post_date,post_text,post_type,impressions,reach,likes,comments,shares,ctr,follower_growth,hashtags
2024-01-15,"Just launched our new dev course! Really excited to share with the community.",article,5000,3200,150,45,12,2.5,8,"#devtips #learning"
2024-01-14,"Quick tip: Always test your edge cases before deploying to production",tip,3800,2100,95,28,5,1.8,3,"#coding #bestpractices"`,

    YOUTUBE: `video_date,title,description,tags,duration_seconds,video_url,views,watch_time_hours,avg_view_duration_seconds,likes,comments,subscribers_gained,comment_text
2024-01-15,"10 CSS Tricks You Didn't Know","In this video we explore 10 advanced CSS techniques...","css,web development,tutorial",720,https://youtube.com/watch?v=abc123,25000,150.5,324,450,32,"Great tutorial! Learned a lot","Absolutely brilliant explanation!"
2024-01-10,"React Hooks Deep Dive","Let's explore React Hooks in detail...","react,javascript,hooks",1200,https://youtube.com/watch?v=xyz789,45000,280.2,412,820,55,"This cleared up my confusion","Perfect breakdown of useEffect"`,

    BLOG: `publish_date,title,url,author,category,tags,word_count,format,pageviews,sessions,avg_time_on_page_seconds,bounce_rate,conversions,search_traffic,comment_text
2024-01-15,"The Future of Web Development",https://blog.example.com/future-web-dev,"John Doe",Tutorial,"web,future,trends",2500,article,8900,7200,285,35.2,45,2100,"Great insights into upcoming trends!"
2024-01-10,"JavaScript Performance Tips",https://blog.example.com/js-perf,"Jane Smith",Guide,"javascript,performance,optimization",3200,guide,12500,9800,425,28.1,78,4500,"This saved me hours of debugging"`,

    EMAIL_NEWSLETTER: `send_date,subject,audience_segment,cta_text,total_sent,open_rate,ctr,unsubscribes,leads_generated,conversions
2024-01-15,"Weekly Dev Digest - Top 5 Stories","developers",Read Full Story,15000,32.5,4.2,12,28,18
2024-01-08,"Product Update: New Features Released","customers",Learn More,8500,45.2,6.8,5,42,31`,

    REDDIT: `post_date,subreddit,post_title,post_text,post_url,upvotes,comment_count,top_comments,mention_frequency,trend_velocity
2024-01-15,r/webdev,"Tips for optimizing React performance","We've compiled our best practices for React optimization...","https://reddit.com/r/webdev/...",1250,87,"Great tips! Using these now",45,78.5
2024-01-12,r/javascript,"Async/Await vs Promises - Which to choose?","Let's discuss the differences and when to use each...","https://reddit.com/r/javascript/...",892,156,"Finally a clear explanation",62,92.3`,

    GOOGLE_PPC: `date,campaign_name,ad_copy,keyword,search_term,landing_page_url,impressions,clicks,cpc,ctr,conversions,cost_per_conversion
2024-01-15,"React Course",Learn React Fast - Expert Training,react course,react online course,https://example.com/react,2500,125,0.85,5.0,18,5.83
2024-01-14,"Web Dev",Master Web Development - Join 10000+ Students,web development,learn web development,https://example.com/webdev,3200,156,0.72,4.9,24,4.67`,
  };

  const template = templates[channel];
  if (!template) {
    throw new Error(`Unknown channel: ${channel}`);
  }

  return template;
}

/**
 * Utility to get the download filename for a template
 */
export function getTemplateFilename(channel: Channel): string {
  const channelName = channel.toLowerCase().replace(/_/g, '-');
  return `${channelName}-template.csv`;
}
