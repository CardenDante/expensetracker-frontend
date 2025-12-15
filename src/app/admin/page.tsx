'use client'

import { Fragment, useEffect, useMemo, useState } from 'react'
import { Dialog, DialogPanel, Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react'
import {
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  Bars3Icon,
  EllipsisVerticalIcon,
  PlusIcon,
  UserGroupIcon,
  ShieldCheckIcon,
  CheckBadgeIcon,
  ClockIcon,
  ChartBarIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline'
import { BellIcon, XMarkIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline'
import { api } from "@/lib/api-client"

const navigation = [
  { name: 'Dashboard', href: '/admin', current: true },
  { name: 'Users', href: '/admin/users', current: false },
  { name: 'Statistics', href: '/admin/stats', current: false },
  { name: 'Settings', href: '/admin/settings', current: false },
]

type AnyUser = any
type AnyActivity = any

function normalizeResults(data: any) {
  if (data && typeof data === "object" && Array.isArray(data.results)) {
    return {
      count: typeof data.count === "number" ? data.count : null,
      results: data.results,
      next: data.next ?? null,
      previous: data.previous ?? null,
    }
  }
  if (Array.isArray(data)) {
    return { count: data.length, results: data, next: null, previous: null }
  }
  return { count: null, results: [], next: null, previous: null }
}

function displayName(u: AnyUser) {
  const full = String(u?.full_name ?? "").trim()
  if (full) return full

  const first = String(u?.first_name ?? "").trim()
  const last = String(u?.last_name ?? "").trim()
  const combined = `${first} ${last}`.trim()
  return combined || u?.email?.split('@')[0] || "Unknown User"
}

function classNames(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ')
}

export default function AdminDashboard() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | 'all'>('30d')

  const [usersLoading, setUsersLoading] = useState(true)
  const [usersCount, setUsersCount] = useState<number | null>(null)
  const [users, setUsers] = useState<AnyUser[]>([])
  const [usersErr, setUsersErr] = useState<string | null>(null)

  const [activitiesLoading, setActivitiesLoading] = useState(true)
  const [activities, setActivities] = useState<AnyActivity[]>([])
  const [activitiesErr, setActivitiesErr] = useState<string | null>(null)

  // Load users
  useEffect(() => {
    (async () => {
      setUsersLoading(true)
      setUsersErr(null)

      const pageSize = 50
      const r = await api(`/api/v1/users/?page_size=${pageSize}`, { method: "GET" })

      if (!r.ok) {
        setUsersErr(`Failed to load users (${r.status}).`)
        setUsersCount(null)
        setUsers([])
        setUsersLoading(false)
        return
      }

      const { count, results } = normalizeResults(r.data)
      setUsersCount(count)
      setUsers(results)
      setUsersLoading(false)
    })()
  }, [])

  // Load activities
  useEffect(() => {
    (async () => {
      setActivitiesLoading(true)
      setActivitiesErr(null)

      const r = await api(`/api/v1/activities/?page_size=20`, { method: "GET" })

      if (!r.ok) {
        setActivitiesErr(`Failed to load activities (${r.status}).`)
        setActivities([])
        setActivitiesLoading(false)
        return
      }

      const { results } = normalizeResults(r.data)
      setActivities(results)
      setActivitiesLoading(false)
    })()
  }, [])

  // Filter users by date range
  const filteredUsers = useMemo(() => {
    if (timeRange === "all") return users

    const days = timeRange === "7d" ? 7 : 30
    const cutoff = Date.now() - days * 24 * 60 * 60 * 1000

    return users.filter((u) => {
      const t = u?.date_joined ? new Date(u.date_joined).getTime() : 0
      return t >= cutoff
    })
  }, [users, timeRange])

  const stats = useMemo(() => {
    const admins = filteredUsers.filter((u) => u?.role === "A").length
    const verified = filteredUsers.filter((u) => !!u?.verified).length
    const totalInRange = filteredUsers.length
    const allTimeCount = usersCount || 0

    return [
      {
        name: 'Total Users',
        value: allTimeCount,
        change: '+12.5%',
        changeType: 'increase',
        icon: UserGroupIcon,
        iconBg: 'bg-blue-500',
        iconColor: 'text-blue-500',
      },
      {
        name: 'Verified Users',
        value: verified,
        change: '+8.2%',
        changeType: 'increase',
        icon: CheckBadgeIcon,
        iconBg: 'bg-green-500',
        iconColor: 'text-green-500',
      },
      {
        name: 'Admin Users',
        value: admins,
        change: '+2',
        changeType: 'increase',
        icon: ShieldCheckIcon,
        iconBg: 'bg-purple-500',
        iconColor: 'text-purple-500',
      },
      {
        name: `Active (${timeRange})`,
        value: totalInRange,
        change: timeRange,
        changeType: 'neutral',
        icon: ClockIcon,
        iconBg: 'bg-orange-500',
        iconColor: 'text-orange-500',
      },
    ]
  }, [filteredUsers, usersCount, timeRange])

  // Recent users
  const recentUsers = useMemo(() => {
    return [...users]
      .sort((a, b) => new Date(b?.date_joined || 0).getTime() - new Date(a?.date_joined || 0).getTime())
      .slice(0, 8)
  }, [users])

  // Recent activities
  const recentActivities = useMemo(() => {
    return activities.slice(0, 10)
  }, [activities])

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-40 backdrop-blur-xl bg-white/80">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo & Nav */}
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
                  <span className="text-white font-bold text-lg">ET</span>
                </div>
                <span className="font-bold text-xl text-gray-900 hidden sm:block">Expense Tracker</span>
              </div>

              <div className="hidden md:flex items-center gap-1">
                {navigation.map((item) => (
                  <a
                    key={item.name}
                    href={item.href}
                    className={classNames(
                      item.current
                        ? 'bg-gray-100 text-gray-900'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
                      'px-4 py-2 rounded-lg text-sm font-medium transition-colors'
                    )}
                  >
                    {item.name}
                  </a>
                ))}
              </div>
            </div>

            {/* Right side */}
            <div className="flex items-center gap-3">
              <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                <MagnifyingGlassIcon className="h-5 w-5" />
              </button>
              <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors relative">
                <BellIcon className="h-5 w-5" />
                <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-red-500 rounded-full"></span>
              </button>
              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center cursor-pointer">
                <span className="text-white text-sm font-semibold">A</span>
              </div>
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="md:hidden p-2 text-gray-400 hover:text-gray-600"
              >
                <Bars3Icon className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <Dialog open={mobileMenuOpen} onClose={setMobileMenuOpen} className="md:hidden">
        <div className="fixed inset-0 z-50 bg-gray-900/50" />
        <DialogPanel className="fixed inset-y-0 right-0 z-50 w-full max-w-sm bg-white shadow-xl">
          <div className="flex items-center justify-between p-6 border-b">
            <span className="text-lg font-semibold">Menu</span>
            <button onClick={() => setMobileMenuOpen(false)} className="p-2 hover:bg-gray-100 rounded-lg">
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
          <div className="p-6 space-y-2">
            {navigation.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className={classNames(
                  item.current ? 'bg-indigo-50 text-indigo-600' : 'text-gray-700 hover:bg-gray-50',
                  'block px-4 py-3 rounded-lg font-medium transition-colors'
                )}
              >
                {item.name}
              </a>
            ))}
          </div>
        </DialogPanel>
      </Dialog>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-gray-500 mt-1">Welcome back! Here's what's happening today.</p>
            </div>
            <button className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/40 transition-all hover:scale-105">
              <PlusIcon className="h-5 w-5" />
              <span className="hidden sm:inline">New User</span>
            </button>
          </div>

          {/* Time Range Selector */}
          <div className="flex items-center gap-2 bg-white p-1.5 rounded-xl border border-gray-200 w-fit shadow-sm">
            {[
              { label: 'Last 7 days', value: '7d' },
              { label: 'Last 30 days', value: '30d' },
              { label: 'All time', value: 'all' },
            ].map((option) => (
              <button
                key={option.value}
                onClick={() => setTimeRange(option.value as '7d' | '30d' | 'all')}
                className={classNames(
                  timeRange === option.value
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md'
                    : 'text-gray-600 hover:bg-gray-50',
                  'px-4 py-2 rounded-lg text-sm font-medium transition-all'
                )}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          {stats.map((stat, index) => (
            <div
              key={stat.name}
              className="bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-xl ${stat.iconBg} bg-opacity-10 group-hover:scale-110 transition-transform`}>
                  <stat.icon className={`h-6 w-6 ${stat.iconColor}`} />
                </div>
                {stat.changeType !== 'neutral' && (
                  <span className={classNames(
                    stat.changeType === 'increase' ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50',
                    'inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold'
                  )}>
                    {stat.changeType === 'increase' ? (
                      <ArrowTrendingUpIcon className="h-3 w-3" />
                    ) : (
                      <ArrowTrendingDownIcon className="h-3 w-3" />
                    )}
                    {stat.change}
                  </span>
                )}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">{stat.name}</p>
                <p className="text-3xl font-bold text-gray-900">
                  {usersLoading ? (
                    <span className="inline-block h-8 w-16 bg-gray-200 rounded animate-pulse"></span>
                  ) : (
                    stat.value.toLocaleString()
                  )}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Activity - Takes 2 columns */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">
              <div className="px-6 py-5 border-b border-gray-200 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
                  <p className="text-sm text-gray-500 mt-0.5">Latest user activities and events</p>
                </div>
                <button className="text-indigo-600 hover:text-indigo-700 text-sm font-medium">
                  View all
                </button>
              </div>
              <div className="p-6">
                {activitiesLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="animate-pulse flex gap-4">
                        <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : activitiesErr ? (
                  <div className="text-center py-8 text-red-600">{activitiesErr}</div>
                ) : recentActivities.length === 0 ? (
                  <div className="text-center py-12">
                    <ChartBarIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">No recent activity</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {recentActivities.map((activity, idx) => (
                      <div key={activity?.id || idx} className="flex items-start gap-4 p-3 hover:bg-gray-50 rounded-xl transition-colors">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center flex-shrink-0">
                          <ArrowPathIcon className="h-5 w-5 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {activity?.title || activity?.action || 'Activity'}
                          </p>
                          <p className="text-sm text-gray-500 truncate">
                            {activity?.description || activity?.message || 'No description'}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            {activity?.created_at
                              ? new Date(activity.created_at).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })
                              : 'Just now'}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Recent Users - Takes 1 column */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">
              <div className="px-6 py-5 border-b border-gray-200 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Recent Users</h2>
                  <p className="text-sm text-gray-500 mt-0.5">Newest members</p>
                </div>
                <a href="/admin/users" className="text-indigo-600 hover:text-indigo-700 text-sm font-medium">
                  View all
                </a>
              </div>
              <div className="p-6">
                {usersLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="animate-pulse flex gap-3">
                        <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-gray-200 rounded w-full"></div>
                          <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : usersErr ? (
                  <div className="text-center py-8 text-red-600">{usersErr}</div>
                ) : recentUsers.length === 0 ? (
                  <div className="text-center py-12">
                    <UserGroupIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">No users yet</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {recentUsers.map((user) => (
                      <div key={user?.id} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg transition-colors">
                        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center flex-shrink-0">
                          <span className="text-white font-semibold text-sm">
                            {displayName(user).charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {displayName(user)}
                          </p>
                          <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                        </div>
                        {user?.verified && (
                          <CheckBadgeIcon className="h-5 w-5 text-green-500 flex-shrink-0" />
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
