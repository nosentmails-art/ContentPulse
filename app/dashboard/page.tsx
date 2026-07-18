'use client'

import { useEffect, useState } from 'react'
import { prisma } from '@/lib/db'

export default function DashboardPage() {
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Placeholder: will fetch dashboard data
        setLoading(false)
      } catch (error) {
        console.error('Error fetching dashboard:', error)
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  return (
    <div className="container-page">
      <h1 className="text-4xl font-bold text-white mb-8">Dashboard</h1>
      {loading ? (
        <div className="card">
          <p className="text-slate-400">Loading dashboard...</p>
        </div>
      ) : (
        <div className="card">
          <p className="text-slate-400">Dashboard coming soon</p>
        </div>
      )}
    </div>
  )
}
