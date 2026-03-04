import type { Metadata } from 'next'
import MonitoringDashboard from '@/components/MonitoringDashboard'

export const metadata: Metadata = {
  title: 'Monitoring — Prism Console',
  description: 'Real-time monitoring dashboard for BlackRoad agents, services, infrastructure, and governance',
}

export default function MonitoringPage() {
  return <MonitoringDashboard />
}
