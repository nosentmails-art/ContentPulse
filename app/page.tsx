import Link from 'next/link'
import { ArrowRight, BarChart3, Zap, FileText } from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Hero Section */}
      <section className="container-page pt-20 pb-16">
        <div className="max-w-3xl mx-auto text-center">
          <div className="mb-8">
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
              Make Data-Driven <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">Editorial Decisions</span>
            </h1>
            <p className="text-xl text-slate-400 mb-8">
              ContentPulse is an AI-powered editorial intelligence platform that helps content teams analyze performance metrics, discover opportunities, and make smarter content decisions—backed by real data, not gut feel.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link
              href="/dashboard"
              className="btn-primary flex items-center justify-center gap-2 text-lg px-8 py-3"
            >
              View Dashboard <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/upload"
              className="btn-secondary flex items-center justify-center gap-2 text-lg px-8 py-3"
            >
              Upload Your Data
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container-page py-16 border-t border-slate-800">
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {[
            {
              icon: BarChart3,
              title: 'Performance Dashboard',
              description: 'Real-time analytics with charts, trends, and deep-dive metrics across all your content.',
            },
            {
              icon: Zap,
              title: 'AI Editorial Report',
              description: 'Get AI-generated recommendations on what to write, refresh, optimize, and kill.',
            },
            {
              icon: FileText,
              title: 'Content Briefs',
              description: 'Auto-generate detailed briefs with keywords, outlines, and strategy for each recommendation.',
            },
          ].map((feature, i) => {
            const Icon = feature.icon
            return (
              <div key={i} className="card text-center">
                <Icon className="w-12 h-12 text-indigo-600 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-slate-400">{feature.description}</p>
              </div>
            )
          })}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container-page py-16 border-t border-slate-800">
        <div className="bg-gradient-to-r from-indigo-900 to-violet-900 rounded-lg p-12 text-center border border-indigo-800">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Transform Your Content Strategy?
          </h2>
          <p className="text-indigo-100 mb-8 max-w-2xl mx-auto">
            Start with our demo dataset or upload your own Google Analytics 4 and Search Console data. Either way, get started in seconds.
          </p>
          <Link href="/dashboard" className="btn-primary inline-flex items-center gap-2">
            Get Started Now <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>
    </div>
  )
}
