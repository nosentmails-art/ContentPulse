/**
 * Landing Page
 * @author sanat.k.mahapatra
 * 
 * Home page with hero, features, and CTA
 */

import Link from "next/link";
import { BarChart3, Zap, FileText, ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Hero Section */}
      <section className="container-page py-20 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
            Turn Scattered Content Metrics Into{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">
              Your Next Winning Strategy
            </span>
          </h1>

          <p className="text-xl text-slate-400 mb-8 max-w-2xl mx-auto">
            ContentPulse connects your LinkedIn, YouTube, Blog, and Email data, then tells you exactly what to publish next.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/devinsights"
              className="btn-primary inline-flex items-center justify-center gap-2 text-lg px-8 py-3"
            >
              View Demo <ArrowRight className="w-5 h-5" />
            </Link>
            <a
              href="#features"
              className="btn-secondary inline-flex items-center justify-center gap-2 text-lg px-8 py-3"
            >
              Learn More
            </a>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="container-page py-12 border-t border-slate-800">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-white text-center mb-12">How ContentPulse Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: "1", title: "Connect your content channels", desc: "Link your blog, LinkedIn, YouTube, email, and more." },
              { step: "2", title: "Run AI analysis", desc: "Five AI agents analyze audience, channels, sentiment, gaps, and competitors." },
              { step: "3", title: "Get your content plan", desc: "Receive a prioritized report with your next 3 moves." },
            ].map((s) => (
              <div key={s.step} className="card text-center">
                <div className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold mx-auto mb-4">{s.step}</div>
                <h3 className="text-lg font-bold text-white mb-2">{s.title}</h3>
                <p className="text-slate-400">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="container-page py-20 border-t border-slate-800">
        <h2 className="text-3xl font-bold text-white text-center mb-12">
          Everything Your Content Team Needs to Decide What to Publish Next
        </h2>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {[
            {
              icon: BarChart3,
              title: "Know What Works on Every Channel",
              description:
                "See which formats and channels actually move your audience, in one dashboard.",
            },
            {
              icon: Zap,
              title: "Spot Gaps, Sentiment & Opportunities",
              description:
                "AI surfaces missing topics, audience sentiment, and competitor moves before your rivals do.",
            },
            {
              icon: FileText,
              title: "Get a Ready-to-Use Content Brief",
              description:
                "Walk away with recommended topics, titles, channels, and timing — not another raw report.",
            },
          ].map((feature, i) => {
            const Icon = feature.icon;
            return (
              <div key={i} className="card text-center">
                <Icon className="w-12 h-12 text-indigo-600 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-white mb-2">{feature.title}</h3>
                <p className="text-slate-400">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container-page py-20 border-t border-slate-800">
        <div className="bg-gradient-to-r from-indigo-900 to-violet-900 rounded-xl p-12 text-center border border-indigo-800 max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Stop Guessing What to Publish?
          </h2>
          <p className="text-indigo-100 mb-8">
            Start with the demo workspace and see what your content plan could look like this week.
          </p>
          <Link href="/devinsights" className="btn-primary inline-flex items-center gap-2">
            Explore Demo <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-8 text-center text-slate-500 text-sm">
        <p>&copy; 2024 ContentPulse. Content intelligence for editorial teams.</p>
      </footer>
    </div>
  );
}
