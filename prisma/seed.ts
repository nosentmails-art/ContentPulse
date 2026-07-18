import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const articles = [
  // React/Frontend (15 articles)
  {
    title: 'React 18 Suspense: A Deep Dive into Concurrent Rendering',
    slug: 'react-18-suspense-deep-dive',
    url: 'https://devinsights.tech/react-18-suspense',
    category: 'React/Frontend',
    format: 'guide',
    wordCount: 3200,
    publishDate: new Date('2024-08-15'),
    metrics: { pageviews: 2340, sessions: 1200, avgTimeOnPage: 245, bounceRate: 28, impressions: 4500, clicks: 320, ctr: 7.1, avgPosition: 5.2 }
  },
  {
    title: 'TailwindCSS vs Styled-Components: Performance Showdown',
    slug: 'tailwind-vs-styled-components',
    url: 'https://devinsights.tech/tailwind-vs-styled',
    category: 'React/Frontend',
    format: 'comparison',
    wordCount: 2800,
    publishDate: new Date('2024-08-20'),
    metrics: { pageviews: 1890, sessions: 950, avgTimeOnPage: 189, bounceRate: 32, impressions: 3200, clicks: 210, ctr: 6.6, avgPosition: 8.5 }
  },
  {
    title: 'Next.js 14 App Router: Migration Guide from Pages',
    slug: 'nextjs-14-app-router-migration',
    url: 'https://devinsights.tech/nextjs-14-migration',
    category: 'React/Frontend',
    format: 'how-to',
    wordCount: 3500,
    publishDate: new Date('2024-08-05'),
    metrics: { pageviews: 4120, sessions: 2100, avgTimeOnPage: 312, bounceRate: 22, impressions: 6800, clicks: 580, ctr: 8.5, avgPosition: 3.1 }
  },
  {
    title: 'State Management in 2024: Zustand, Jotai, or Redux?',
    slug: 'state-management-2024',
    url: 'https://devinsights.tech/state-management-2024',
    category: 'React/Frontend',
    format: 'listicle',
    wordCount: 2900,
    publishDate: new Date('2024-07-28'),
    metrics: { pageviews: 3400, sessions: 1800, avgTimeOnPage: 267, bounceRate: 26, impressions: 5200, clicks: 385, ctr: 7.4, avgPosition: 4.8 }
  },
  {
    title: 'Web Performance Optimization: From 5s to 1.2s Load Time',
    slug: 'web-performance-optimization',
    url: 'https://devinsights.tech/web-perf-optimization',
    category: 'React/Frontend',
    format: 'case-study',
    wordCount: 3100,
    publishDate: new Date('2024-07-15'),
    metrics: { pageviews: 5200, sessions: 2800, avgTimeOnPage: 289, bounceRate: 19, impressions: 8900, clicks: 720, ctr: 8.1, avgPosition: 2.4 }
  },
  {
    title: 'TypeScript Generics: Master Advanced Patterns',
    slug: 'typescript-generics-advanced',
    url: 'https://devinsights.tech/typescript-generics',
    category: 'React/Frontend',
    format: 'guide',
    wordCount: 2600,
    publishDate: new Date('2024-07-22'),
    metrics: { pageviews: 2100, sessions: 1050, avgTimeOnPage: 198, bounceRate: 35, impressions: 3800, clicks: 240, ctr: 6.3, avgPosition: 7.2 }
  },
  {
    title: 'React Query vs SWR: Choosing the Right Data Fetching Library',
    slug: 'react-query-vs-swr',
    url: 'https://devinsights.tech/react-query-vs-swr',
    category: 'React/Frontend',
    format: 'comparison',
    wordCount: 2400,
    publishDate: new Date('2024-08-10'),
    metrics: { pageviews: 3800, sessions: 1900, avgTimeOnPage: 234, bounceRate: 29, impressions: 5600, clicks: 402, ctr: 7.2, avgPosition: 6.1 }
  },
  {
    title: 'Component Design Patterns in React: Container vs Presentational',
    slug: 'react-component-patterns',
    url: 'https://devinsights.tech/react-component-patterns',
    category: 'React/Frontend',
    format: 'guide',
    wordCount: 2700,
    publishDate: new Date('2024-07-18'),
    metrics: { pageviews: 1620, sessions: 810, avgTimeOnPage: 176, bounceRate: 42, impressions: 2900, clicks: 155, ctr: 5.3, avgPosition: 11.3 }
  },
  {
    title: 'CSS-in-JS: Five Libraries Compared for 2024',
    slug: 'css-in-js-libraries-2024',
    url: 'https://devinsights.tech/css-in-js-2024',
    category: 'React/Frontend',
    format: 'listicle',
    wordCount: 3000,
    publishDate: new Date('2024-06-30'),
    metrics: { pageviews: 2800, sessions: 1450, avgTimeOnPage: 215, bounceRate: 31, impressions: 4200, clicks: 290, ctr: 6.9, avgPosition: 8.8 }
  },
  {
    title: 'Accessibility in React: Building for Everyone',
    slug: 'react-accessibility-guide',
    url: 'https://devinsights.tech/react-accessibility',
    category: 'React/Frontend',
    format: 'guide',
    wordCount: 2800,
    publishDate: new Date('2024-07-05'),
    metrics: { pageviews: 1340, sessions: 680, avgTimeOnPage: 203, bounceRate: 38, impressions: 2100, clicks: 112, ctr: 5.3, avgPosition: 12.5 }
  },
  {
    title: 'Next.js Image Optimization: Cut Your Bundle by 60%',
    slug: 'nextjs-image-optimization',
    url: 'https://devinsights.tech/nextjs-image-opt',
    category: 'React/Frontend',
    format: 'how-to',
    wordCount: 2200,
    publishDate: new Date('2024-06-20'),
    metrics: { pageviews: 2950, sessions: 1520, avgTimeOnPage: 198, bounceRate: 36, impressions: 4600, clicks: 310, ctr: 6.7, avgPosition: 9.2 }
  },
  {
    title: 'React Testing Library: Complete Guide with Examples',
    slug: 'react-testing-library-guide',
    url: 'https://devinsights.tech/react-testing-library',
    category: 'React/Frontend',
    format: 'guide',
    wordCount: 3400,
    publishDate: new Date('2024-06-10'),
    metrics: { pageviews: 3200, sessions: 1680, avgTimeOnPage: 267, bounceRate: 25, impressions: 5800, clicks: 450, ctr: 7.8, avgPosition: 5.5 }
  },
  {
    title: 'Vitest: The Fast Unit Testing Framework for Vite',
    slug: 'vitest-unit-testing',
    url: 'https://devinsights.tech/vitest-testing',
    category: 'React/Frontend',
    format: 'tutorial',
    wordCount: 2500,
    publishDate: new Date('2024-05-28'),
    metrics: { pageviews: 1680, sessions: 820, avgTimeOnPage: 187, bounceRate: 40, impressions: 2800, clicks: 178, ctr: 6.4, avgPosition: 10.1 }
  },
  {
    title: 'Framer Motion: Create Delightful Animations in React',
    slug: 'framer-motion-animations',
    url: 'https://devinsights.tech/framer-motion',
    category: 'React/Frontend',
    format: 'how-to',
    wordCount: 2300,
    publishDate: new Date('2024-05-15'),
    metrics: { pageviews: 4100, sessions: 2200, avgTimeOnPage: 289, bounceRate: 21, impressions: 6200, clicks: 530, ctr: 8.5, avgPosition: 3.8 }
  },
  {
    title: 'Monorepos with Turbo: Scaling Your React Codebase',
    slug: 'turbo-monorepo-scaling',
    url: 'https://devinsights.tech/turbo-monorepo',
    category: 'React/Frontend',
    format: 'guide',
    wordCount: 3100,
    publishDate: new Date('2024-05-01'),
    metrics: { pageviews: 1420, sessions: 710, avgTimeOnPage: 219, bounceRate: 44, impressions: 2400, clicks: 128, ctr: 5.3, avgPosition: 13.2 }
  },

  // Career/Productivity (10 articles)
  {
    title: 'Remote Work Productivity: Tools and Tactics That Actually Work',
    slug: 'remote-work-productivity',
    url: 'https://devinsights.tech/remote-productivity',
    category: 'Career/Productivity',
    format: 'listicle',
    wordCount: 2900,
    publishDate: new Date('2024-08-18'),
    metrics: { pageviews: 5600, sessions: 3100, avgTimeOnPage: 267, bounceRate: 20, impressions: 8200, clicks: 580, ctr: 7.1, avgPosition: 4.2 }
  },
  {
    title: 'How to Negotiate Your Developer Salary: Data from 500+ Offers',
    slug: 'negotiate-developer-salary',
    url: 'https://devinsights.tech/salary-negotiation',
    category: 'Career/Productivity',
    format: 'case-study',
    wordCount: 3200,
    publishDate: new Date('2024-08-08'),
    metrics: { pageviews: 7200, sessions: 4000, avgTimeOnPage: 312, bounceRate: 18, impressions: 11000, clicks: 890, ctr: 8.1, avgPosition: 2.1 }
  },
  {
    title: 'Burnout and Developer Mental Health: A Survival Guide',
    slug: 'developer-burnout-guide',
    url: 'https://devinsights.tech/burnout-guide',
    category: 'Career/Productivity',
    format: 'guide',
    wordCount: 2600,
    publishDate: new Date('2024-07-25'),
    metrics: { pageviews: 4300, sessions: 2300, avgTimeOnPage: 289, bounceRate: 22, impressions: 6800, clicks: 520, ctr: 7.6, avgPosition: 3.5 }
  },
  {
    title: 'Building Your Portfolio: Projects That Get You Hired',
    slug: 'portfolio-projects-hired',
    url: 'https://devinsights.tech/portfolio-projects',
    category: 'Career/Productivity',
    format: 'how-to',
    wordCount: 2800,
    publishDate: new Date('2024-07-10'),
    metrics: { pageviews: 3800, sessions: 2000, avgTimeOnPage: 245, bounceRate: 26, impressions: 5600, clicks: 410, ctr: 7.3, avgPosition: 5.8 }
  },
  {
    title: 'The Tech Interview: 30 Algorithms Every Developer Should Know',
    slug: 'tech-interview-algorithms',
    url: 'https://devinsights.tech/interview-algorithms',
    category: 'Career/Productivity',
    format: 'listicle',
    wordCount: 4000,
    publishDate: new Date('2024-06-28'),
    metrics: { pageviews: 6100, sessions: 3300, avgTimeOnPage: 378, bounceRate: 17, impressions: 9200, clicks: 720, ctr: 7.8, avgPosition: 2.9 }
  },
  {
    title: 'Open Source Contributions: How to Get Started',
    slug: 'open-source-getting-started',
    url: 'https://devinsights.tech/open-source',
    category: 'Career/Productivity',
    format: 'guide',
    wordCount: 2400,
    publishDate: new Date('2024-06-15'),
    metrics: { pageviews: 2100, sessions: 1100, avgTimeOnPage: 201, bounceRate: 34, impressions: 3400, clicks: 220, ctr: 6.5, avgPosition: 8.9 }
  },
  {
    title: 'Writing Better Code: Principles Every Developer Needs',
    slug: 'writing-better-code',
    url: 'https://devinsights.tech/better-code',
    category: 'Career/Productivity',
    format: 'guide',
    wordCount: 2700,
    publishDate: new Date('2024-05-30'),
    metrics: { pageviews: 1890, sessions: 980, avgTimeOnPage: 234, bounceRate: 37, impressions: 2900, clicks: 180, ctr: 6.2, avgPosition: 10.4 }
  },
  {
    title: 'Time Management for Developers: Calendar Hacks That Work',
    slug: 'time-management-developers',
    url: 'https://devinsights.tech/time-management',
    category: 'Career/Productivity',
    format: 'how-to',
    wordCount: 2300,
    publishDate: new Date('2024-05-12'),
    metrics: { pageviews: 1680, sessions: 850, avgTimeOnPage: 178, bounceRate: 41, impressions: 2500, clicks: 150, ctr: 6.0, avgPosition: 11.8 }
  },
  {
    title: 'Freelance vs Full-Time: Which Career Path Is Right for You',
    slug: 'freelance-vs-fulltime',
    url: 'https://devinsights.tech/freelance-fulltime',
    category: 'Career/Productivity',
    format: 'comparison',
    wordCount: 2600,
    publishDate: new Date('2024-04-20'),
    metrics: { pageviews: 3200, sessions: 1700, avgTimeOnPage: 212, bounceRate: 31, impressions: 4800, clicks: 340, ctr: 7.1, avgPosition: 6.3 }
  },
  {
    title: 'Imposter Syndrome: How Senior Developers Overcome It',
    slug: 'imposter-syndrome-guide',
    url: 'https://devinsights.tech/imposter-syndrome',
    category: 'Career/Productivity',
    format: 'opinion',
    wordCount: 2200,
    publishDate: new Date('2024-04-05'),
    metrics: { pageviews: 2340, sessions: 1200, avgTimeOnPage: 189, bounceRate: 39, impressions: 3600, clicks: 220, ctr: 6.1, avgPosition: 9.7 }
  },

  // Backend/APIs (10 articles)
  {
    title: 'Building REST APIs with Node.js and Express: Best Practices',
    slug: 'nodejs-express-rest-api',
    url: 'https://devinsights.tech/nodejs-rest-api',
    category: 'Backend/APIs',
    format: 'guide',
    wordCount: 3300,
    publishDate: new Date('2024-08-22'),
    metrics: { pageviews: 4200, sessions: 2200, avgTimeOnPage: 267, bounceRate: 23, impressions: 6800, clicks: 510, ctr: 7.5, avgPosition: 4.1 }
  },
  {
    title: 'GraphQL vs REST: Which Should You Use in 2024?',
    slug: 'graphql-vs-rest-2024',
    url: 'https://devinsights.tech/graphql-vs-rest',
    category: 'Backend/APIs',
    format: 'comparison',
    wordCount: 2800,
    publishDate: new Date('2024-08-12'),
    metrics: { pageviews: 3900, sessions: 2000, avgTimeOnPage: 289, bounceRate: 24, impressions: 5800, clicks: 440, ctr: 7.6, avgPosition: 4.7 }
  },
  {
    title: 'Database Optimization: Scaling PostgreSQL to Millions of Queries',
    slug: 'postgresql-optimization-scale',
    url: 'https://devinsights.tech/postgresql-scale',
    category: 'Backend/APIs',
    format: 'guide',
    wordCount: 3600,
    publishDate: new Date('2024-07-30'),
    metrics: { pageviews: 2100, sessions: 1100, avgTimeOnPage: 298, bounceRate: 28, impressions: 3600, clicks: 280, ctr: 7.8, avgPosition: 6.2 }
  },
  {
    title: 'Microservices Architecture: When to Use and When to Avoid',
    slug: 'microservices-architecture',
    url: 'https://devinsights.tech/microservices',
    category: 'Backend/APIs',
    format: 'guide',
    wordCount: 3200,
    publishDate: new Date('2024-07-14'),
    metrics: { pageviews: 2800, sessions: 1450, avgTimeOnPage: 267, bounceRate: 29, impressions: 4500, clicks: 340, ctr: 7.6, avgPosition: 5.9 }
  },
  {
    title: 'API Rate Limiting: Protect Your Backend from Abuse',
    slug: 'api-rate-limiting',
    url: 'https://devinsights.tech/rate-limiting',
    category: 'Backend/APIs',
    format: 'how-to',
    wordCount: 2400,
    publishDate: new Date('2024-07-02'),
    metrics: { pageviews: 1680, sessions: 840, avgTimeOnPage: 189, bounceRate: 35, impressions: 2800, clicks: 180, ctr: 6.4, avgPosition: 9.1 }
  },
  {
    title: 'WebSocket vs Server-Sent Events: Real-time Communication Guide',
    slug: 'websocket-sse-realtime',
    url: 'https://devinsights.tech/websocket-sse',
    category: 'Backend/APIs',
    format: 'comparison',
    wordCount: 2700,
    publishDate: new Date('2024-06-18'),
    metrics: { pageviews: 1420, sessions: 720, avgTimeOnPage: 201, bounceRate: 40, impressions: 2300, clicks: 140, ctr: 6.1, avgPosition: 11.2 }
  },
  {
    title: 'Authentication Security: JWT vs Sessions Explained',
    slug: 'jwt-vs-sessions',
    url: 'https://devinsights.tech/jwt-sessions',
    category: 'Backend/APIs',
    format: 'guide',
    wordCount: 2900,
    publishDate: new Date('2024-06-05'),
    metrics: { pageviews: 3400, sessions: 1800, avgTimeOnPage: 234, bounceRate: 27, impressions: 5200, clicks: 395, ctr: 7.6, avgPosition: 5.1 }
  },
  {
    title: 'Container Orchestration with Kubernetes: A Practical Start',
    slug: 'kubernetes-getting-started',
    url: 'https://devinsights.tech/kubernetes-start',
    category: 'Backend/APIs',
    format: 'how-to',
    wordCount: 3400,
    publishDate: new Date('2024-05-20'),
    metrics: { pageviews: 1340, sessions: 680, avgTimeOnPage: 267, bounceRate: 38, impressions: 2200, clicks: 130, ctr: 5.9, avgPosition: 12.8 }
  },
  {
    title: 'CI/CD Pipelines: From GitHub to Production',
    slug: 'ci-cd-pipelines-github',
    url: 'https://devinsights.tech/ci-cd-pipelines',
    category: 'Backend/APIs',
    format: 'guide',
    wordCount: 3100,
    publishDate: new Date('2024-05-08'),
    metrics: { pageviews: 2340, sessions: 1200, avgTimeOnPage: 278, bounceRate: 32, impressions: 3800, clicks: 280, ctr: 7.4, avgPosition: 7.3 }
  },
  {
    title: 'Error Handling in APIs: Best Practices and Common Mistakes',
    slug: 'api-error-handling',
    url: 'https://devinsights.tech/api-errors',
    category: 'Backend/APIs',
    format: 'guide',
    wordCount: 2500,
    publishDate: new Date('2024-04-22'),
    metrics: { pageviews: 1260, sessions: 640, avgTimeOnPage: 167, bounceRate: 43, impressions: 2100, clicks: 125, ctr: 5.9, avgPosition: 13.1 }
  },

  // AI/ML Tools (10 articles)
  {
    title: 'ChatGPT API: Building Intelligent Chatbots in 2024',
    slug: 'chatgpt-api-chatbots',
    url: 'https://devinsights.tech/chatgpt-api',
    category: 'AI/ML Tools',
    format: 'how-to',
    wordCount: 2800,
    publishDate: new Date('2024-08-25'),
    metrics: { pageviews: 6300, sessions: 3500, avgTimeOnPage: 289, bounceRate: 19, impressions: 9800, clicks: 750, ctr: 7.7, avgPosition: 2.8 }
  },
  {
    title: 'Langchain: Building LLM Applications That Actually Work',
    slug: 'langchain-llm-apps',
    url: 'https://devinsights.tech/langchain',
    category: 'AI/ML Tools',
    format: 'guide',
    wordCount: 3200,
    publishDate: new Date('2024-08-14'),
    metrics: { pageviews: 2890, sessions: 1500, avgTimeOnPage: 301, bounceRate: 25, impressions: 4600, clicks: 340, ctr: 7.4, avgPosition: 5.3 }
  },
  {
    title: 'Vector Databases: Pinecone, Weaviate, Qdrant Compared',
    slug: 'vector-databases-compared',
    url: 'https://devinsights.tech/vector-databases',
    category: 'AI/ML Tools',
    format: 'comparison',
    wordCount: 2600,
    publishDate: new Date('2024-07-29'),
    metrics: { pageviews: 1680, sessions: 850, avgTimeOnPage: 234, bounceRate: 32, impressions: 2900, clicks: 200, ctr: 6.9, avgPosition: 7.8 }
  },
  {
    title: 'Fine-tuning Open-source LLMs: Llama 2 and Mistral',
    slug: 'fine-tuning-llama-mistral',
    url: 'https://devinsights.tech/fine-tuning-llm',
    category: 'AI/ML Tools',
    format: 'guide',
    wordCount: 3400,
    publishDate: new Date('2024-07-09'),
    metrics: { pageviews: 1240, sessions: 620, avgTimeOnPage: 267, bounceRate: 37, impressions: 2100, clicks: 145, ctr: 6.9, avgPosition: 10.2 }
  },
  {
    title: 'Prompt Engineering: Getting 10x Better Results from GPT',
    slug: 'prompt-engineering-gpt',
    url: 'https://devinsights.tech/prompt-engineering',
    category: 'AI/ML Tools',
    format: 'how-to',
    wordCount: 2500,
    publishDate: new Date('2024-06-24'),
    metrics: { pageviews: 5400, sessions: 2900, avgTimeOnPage: 267, bounceRate: 21, impressions: 8200, clicks: 610, ctr: 7.4, avgPosition: 3.1 }
  },
  {
    title: 'Computer Vision with Python: From TensorFlow to Production',
    slug: 'computer-vision-tensorflow',
    url: 'https://devinsights.tech/computer-vision',
    category: 'AI/ML Tools',
    format: 'guide',
    wordCount: 3600,
    publishDate: new Date('2024-06-10'),
    metrics: { pageviews: 1420, sessions: 710, avgTimeOnPage: 289, bounceRate: 36, impressions: 2400, clicks: 155, ctr: 6.5, avgPosition: 9.8 }
  },
  {
    title: 'Machine Learning Deployment: Docker + AWS Lambda Guide',
    slug: 'ml-deployment-docker-lambda',
    url: 'https://devinsights.tech/ml-deployment',
    category: 'AI/ML Tools',
    format: 'how-to',
    wordCount: 3000,
    publishDate: new Date('2024-05-26'),
    metrics: { pageviews: 1680, sessions: 840, avgTimeOnPage: 245, bounceRate: 33, impressions: 2800, clicks: 190, ctr: 6.8, avgPosition: 8.5 }
  },
  {
    title: 'Embeddings and Semantic Search: The Future of Discovery',
    slug: 'embeddings-semantic-search',
    url: 'https://devinsights.tech/embeddings',
    category: 'AI/ML Tools',
    format: 'guide',
    wordCount: 2800,
    publishDate: new Date('2024-05-13'),
    metrics: { pageviews: 1240, sessions: 620, avgTimeOnPage: 212, bounceRate: 38, impressions: 2100, clicks: 130, ctr: 6.2, avgPosition: 11.3 }
  },
  {
    title: 'Retrieval-Augmented Generation: Building RAG Systems',
    slug: 'rag-systems-guide',
    url: 'https://devinsights.tech/rag-systems',
    category: 'AI/ML Tools',
    format: 'guide',
    wordCount: 3100,
    publishDate: new Date('2024-04-29'),
    metrics: { pageviews: 1890, sessions: 950, avgTimeOnPage: 267, bounceRate: 35, impressions: 3100, clicks: 210, ctr: 6.8, avgPosition: 8.1 }
  },
  {
    title: 'Monitoring LLM Applications: Debugging and Observability',
    slug: 'monitoring-llm-apps',
    url: 'https://devinsights.tech/monitoring-llm',
    category: 'AI/ML Tools',
    format: 'guide',
    wordCount: 2400,
    publishDate: new Date('2024-04-12'),
    metrics: { pageviews: 840, sessions: 420, avgTimeOnPage: 145, bounceRate: 45, impressions: 1400, clicks: 80, ctr: 5.7, avgPosition: 14.2 }
  },

  // Tutorials/How-tos (5 articles)
  {
    title: 'Build a Full-Stack App in 30 Minutes with Next.js',
    slug: 'fullstack-nextjs-30min',
    url: 'https://devinsights.tech/fullstack-nextjs',
    category: 'Tutorials/How-tos',
    format: 'tutorial',
    wordCount: 2200,
    publishDate: new Date('2024-08-01'),
    metrics: { pageviews: 4500, sessions: 2400, avgTimeOnPage: 267, bounceRate: 20, impressions: 7200, clicks: 540, ctr: 7.5, avgPosition: 3.9 }
  },
  {
    title: 'Deploy a React App to Vercel: Step-by-Step Tutorial',
    slug: 'deploy-react-vercel',
    url: 'https://devinsights.tech/vercel-deploy',
    category: 'Tutorials/How-tos',
    format: 'how-to',
    wordCount: 1800,
    publishDate: new Date('2024-07-20'),
    metrics: { pageviews: 2100, sessions: 1100, avgTimeOnPage: 134, bounceRate: 42, impressions: 3200, clicks: 210, ctr: 6.6, avgPosition: 7.5 }
  },
  {
    title: 'Set Up a Development Environment from Scratch',
    slug: 'dev-environment-setup',
    url: 'https://devinsights.tech/dev-setup',
    category: 'Tutorials/How-tos',
    format: 'how-to',
    wordCount: 2400,
    publishDate: new Date('2024-06-22'),
    metrics: { pageviews: 1340, sessions: 680, avgTimeOnPage: 178, bounceRate: 38, impressions: 2200, clicks: 140, ctr: 6.4, avgPosition: 10.3 }
  },
  {
    title: 'Git Workflows for Team Collaboration',
    slug: 'git-workflows-teams',
    url: 'https://devinsights.tech/git-workflows',
    category: 'Tutorials/How-tos',
    format: 'guide',
    wordCount: 2600,
    publishDate: new Date('2024-05-10'),
    metrics: { pageviews: 1680, sessions: 850, avgTimeOnPage: 201, bounceRate: 35, impressions: 2700, clicks: 180, ctr: 6.7, avgPosition: 8.9 }
  },
  {
    title: 'Build a REST API with Django and PostgreSQL',
    slug: 'django-rest-api',
    url: 'https://devinsights.tech/django-rest',
    category: 'Tutorials/How-tos',
    format: 'tutorial',
    wordCount: 3000,
    publishDate: new Date('2024-04-18'),
    metrics: { pageviews: 1420, sessions: 710, avgTimeOnPage: 234, bounceRate: 36, impossions: 2400, clicks: 165, ctr: 6.9, avgPosition: 9.4 }
  },
]

async function main() {
  console.log('🌱 Seeding DevInsights demo data...')

  // Clear existing data
  await prisma.metrics.deleteMany({})
  await prisma.contentItem.deleteMany({})

  // Insert articles with metrics
  for (const article of articles) {
    const { metrics, ...contentData } = article
    const item = await prisma.contentItem.create({
      data: {
        ...contentData,
        metrics: {
          create: {
            recordDate: article.publishDate,
            ...metrics,
          },
        },
      },
    })
    console.log(`✓ Created: ${item.title}`)
  }

  console.log('✅ Seeding complete! 50 articles with metrics ready.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
