"use client";

import { useEffect, useState } from "react";
import { Card, CardBody, CardHeader, Button, Select, SelectItem } from "@heroui/react";
import { ArrowTrendingUpIcon, ArrowTrendingDownIcon, UserGroupIcon, CheckBadgeIcon, ShieldCheckIcon, ClockIcon } from "@heroicons/react/24/outline";
import { api } from "@/lib/api-client";

type StatType = "month" | "year" | "day" | "all";

export default function StatsPage() {
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [stats, setStats] = useState<any>(null);
  const [groupedStats, setGroupedStats] = useState<any>(null);
  const [statType, setStatType] = useState<StatType>("month");

  // Load general stats
  useEffect(() => {
    (async () => {
      setLoading(true);
      setErr(null);

      const r = await api(`/api/v1/users/stats/`, { method: "GET" });

      if (!r.ok) {
        setErr(`Failed to load statistics (${r.status}).`);
        setStats(null);
        setLoading(false);
        return;
      }

      setStats(r.data);
      setLoading(false);
    })();
  }, []);

  // Load grouped stats
  useEffect(() => {
    (async () => {
      const r = await api(`/api/v1/users/stats/${statType}`, { method: "GET" });

      if (!r.ok) {
        console.error(`Failed to load grouped stats (${r.status})`);
        setGroupedStats(null);
        return;
      }

      setGroupedStats(r.data);
    })();
  }, [statType]);

  const statCards = stats ? [
    {
      title: "Total Users",
      value: stats?.total_users || 0,
      icon: UserGroupIcon,
      color: "bg-blue-500",
      trend: "+12.5%",
      trendUp: true,
    },
    {
      title: "Verified Users",
      value: stats?.verified_users || 0,
      icon: CheckBadgeIcon,
      color: "bg-green-500",
      trend: "+8.2%",
      trendUp: true,
    },
    {
      title: "Admin Users",
      value: stats?.admin_users || 0,
      icon: ShieldCheckIcon,
      color: "bg-purple-500",
      trend: "+2",
      trendUp: true,
    },
    {
      title: "Recent Signups",
      value: stats?.recent_signups || 0,
      icon: ClockIcon,
      color: "bg-orange-500",
      trend: "-3.1%",
      trendUp: false,
    },
  ] : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">User Statistics</h1>
          <p className="text-sm text-gray-500 mt-1">
            Comprehensive analytics and insights into user activity
          </p>
        </div>
        <Button variant="flat" onPress={() => window.location.href = "/admin"}>
          Back to Dashboard
        </Button>
      </div>

      {/* Error state */}
      {err && (
        <Card className="rounded-2xl border-red-200 bg-red-50">
          <CardBody>
            <p className="text-sm text-red-600">{err}</p>
          </CardBody>
        </Card>
      )}

      {/* Loading state */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="rounded-2xl">
              <CardBody className="p-6">
                <div className="animate-pulse space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      ) : (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {statCards.map((stat, idx) => (
              <Card key={idx} className="rounded-2xl border shadow-sm hover:shadow-md transition-shadow">
                <CardBody className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-500">{stat.title}</p>
                      <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value.toLocaleString()}</p>
                      <div className="flex items-center gap-1 mt-2">
                        {stat.trendUp ? (
                          <ArrowTrendingUpIcon className="h-4 w-4 text-green-600" />
                        ) : (
                          <ArrowTrendingDownIcon className="h-4 w-4 text-red-600" />
                        )}
                        <span className={`text-sm font-medium ${stat.trendUp ? 'text-green-600' : 'text-red-600'}`}>
                          {stat.trend}
                        </span>
                        <span className="text-sm text-gray-500">vs last period</span>
                      </div>
                    </div>
                    <div className={`${stat.color} p-3 rounded-xl`}>
                      <stat.icon className="h-6 w-6 text-white" />
                    </div>
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>

          {/* Grouped Statistics */}
          <Card className="rounded-2xl border shadow-sm">
            <CardHeader className="border-b px-6 py-4">
              <div className="flex items-center justify-between w-full">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">User Growth</h2>
                  <p className="text-sm text-gray-500 mt-1">Breakdown by time period</p>
                </div>
                <Select
                  label="Group by"
                  selectedKeys={[statType]}
                  onChange={(e) => setStatType(e.target.value as StatType)}
                  className="max-w-xs"
                  size="sm"
                >
                  <SelectItem key="day" value="day">Day</SelectItem>
                  <SelectItem key="month" value="month">Month</SelectItem>
                  <SelectItem key="year" value="year">Year</SelectItem>
                  <SelectItem key="all" value="all">All Time</SelectItem>
                </Select>
              </div>
            </CardHeader>
            <CardBody className="p-6">
              {groupedStats ? (
                <div className="space-y-4">
                  {Array.isArray(groupedStats) && groupedStats.length > 0 ? (
                    groupedStats.map((item: any, idx: number) => (
                      <div key={idx} className="flex items-center justify-between p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                        <div>
                          <p className="font-medium text-gray-900">
                            {item.period || item.label || `Period ${idx + 1}`}
                          </p>
                          <p className="text-sm text-gray-500">
                            {item.description || 'User statistics for this period'}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-gray-900">
                            {item.count || item.users || item.total || 0}
                          </p>
                          <p className="text-xs text-gray-500">users</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-500">
                        {typeof groupedStats === 'object' ? JSON.stringify(groupedStats, null, 2) : 'No grouped data available'}
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">Loading grouped statistics...</p>
                </div>
              )}
            </CardBody>
          </Card>

          {/* Additional Stats Info */}
          <Card className="rounded-2xl border shadow-sm">
            <CardHeader className="border-b px-6 py-4">
              <h2 className="text-lg font-semibold text-gray-900">Detailed Metrics</h2>
            </CardHeader>
            <CardBody className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-3">User Roles</h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-3 rounded-lg bg-blue-50">
                      <span className="text-sm font-medium text-gray-700">Normal Users (N)</span>
                      <span className="text-sm font-bold text-blue-600">{stats?.normal_users || 0}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-purple-50">
                      <span className="text-sm font-medium text-gray-700">Admin Users (A)</span>
                      <span className="text-sm font-bold text-purple-600">{stats?.admin_users || 0}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-green-50">
                      <span className="text-sm font-medium text-gray-700">Customer Care (C)</span>
                      <span className="text-sm font-bold text-green-600">{stats?.care_users || 0}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-orange-50">
                      <span className="text-sm font-medium text-gray-700">Technicians (T)</span>
                      <span className="text-sm font-bold text-orange-600">{stats?.technician_users || 0}</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-3">Verification Status</h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-3 rounded-lg bg-green-50">
                      <span className="text-sm font-medium text-gray-700">Verified Users</span>
                      <span className="text-sm font-bold text-green-600">{stats?.verified_users || 0}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-yellow-50">
                      <span className="text-sm font-medium text-gray-700">Unverified Users</span>
                      <span className="text-sm font-bold text-yellow-600">{stats?.unverified_users || 0}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-indigo-50">
                      <span className="text-sm font-medium text-gray-700">Verification Rate</span>
                      <span className="text-sm font-bold text-indigo-600">
                        {stats?.total_users > 0
                          ? `${((stats.verified_users / stats.total_users) * 100).toFixed(1)}%`
                          : '0%'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>
        </>
      )}
    </div>
  );
}
