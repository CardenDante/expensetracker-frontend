"use client";

import { useState } from "react";
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Switch,
  Divider,
  Select,
  SelectItem,
  Chip
} from "@heroui/react";
import {
  UserCircleIcon,
  BellIcon,
  ShieldCheckIcon,
  Cog6ToothIcon,
  EnvelopeIcon
} from "@heroicons/react/24/outline";

export default function SettingsPage() {
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [userVerification, setUserVerification] = useState(true);
  const [autoApprove, setAutoApprove] = useState(false);
  const [maintenanceMode, setMaintenanceMode] = useState(false);

  const [defaultRole, setDefaultRole] = useState("N");
  const [sessionTimeout, setSessionTimeout] = useState("30");

  const [saving, setSaving] = useState(false);

  const handleSaveSettings = async () => {
    setSaving(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    setSaving(false);
    alert("Settings saved successfully!");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Admin Settings</h1>
          <p className="text-sm text-gray-500 mt-1">
            Configure system-wide preferences and user management settings
          </p>
        </div>
        <Button variant="flat" onPress={() => window.location.href = "/admin"}>
          Back to Dashboard
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Settings Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* User Management Settings */}
          <Card className="rounded-2xl border shadow-sm">
            <CardHeader className="border-b px-6 py-4 flex items-center gap-3">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <UserCircleIcon className="h-5 w-5 text-indigo-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">User Management</h2>
                <p className="text-sm text-gray-500">Control how users are managed</p>
              </div>
            </CardHeader>
            <CardBody className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">Require Email Verification</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    New users must verify their email before accessing the system
                  </p>
                </div>
                <Switch
                  isSelected={userVerification}
                  onValueChange={setUserVerification}
                  color="primary"
                />
              </div>

              <Divider />

              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">Auto-Approve New Users</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Automatically approve new user registrations
                  </p>
                </div>
                <Switch
                  isSelected={autoApprove}
                  onValueChange={setAutoApprove}
                  color="success"
                />
              </div>

              <Divider />

              <div>
                <h3 className="font-medium text-gray-900 mb-3">Default User Role</h3>
                <Select
                  label="Select default role for new users"
                  selectedKeys={[defaultRole]}
                  onChange={(e) => setDefaultRole(e.target.value)}
                  className="max-w-xs"
                >
                  <SelectItem key="N" value="N">Normal User (N)</SelectItem>
                  <SelectItem key="A" value="A">Admin (A)</SelectItem>
                  <SelectItem key="C" value="C">Customer Care (C)</SelectItem>
                  <SelectItem key="T" value="T">Technician (T)</SelectItem>
                </Select>
                <p className="text-xs text-gray-500 mt-2">
                  This role will be assigned to all new users by default
                </p>
              </div>
            </CardBody>
          </Card>

          {/* Notification Settings */}
          <Card className="rounded-2xl border shadow-sm">
            <CardHeader className="border-b px-6 py-4 flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <BellIcon className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Notifications</h2>
                <p className="text-sm text-gray-500">Manage notification preferences</p>
              </div>
            </CardHeader>
            <CardBody className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">Email Notifications</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Send email notifications for important events
                  </p>
                </div>
                <Switch
                  isSelected={emailNotifications}
                  onValueChange={setEmailNotifications}
                  color="primary"
                />
              </div>

              <Divider />

              <div className="space-y-3">
                <h3 className="font-medium text-gray-900">Notification Types</h3>
                <div className="space-y-2">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" defaultChecked className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
                    <span className="text-sm text-gray-700">New user registration</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" defaultChecked className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
                    <span className="text-sm text-gray-700">Password reset requests</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
                    <span className="text-sm text-gray-700">User role changes</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
                    <span className="text-sm text-gray-700">System errors</span>
                  </label>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Security Settings */}
          <Card className="rounded-2xl border shadow-sm">
            <CardHeader className="border-b px-6 py-4 flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <ShieldCheckIcon className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Security</h2>
                <p className="text-sm text-gray-500">Configure security settings</p>
              </div>
            </CardHeader>
            <CardBody className="p-6 space-y-6">
              <div>
                <h3 className="font-medium text-gray-900 mb-3">Session Timeout</h3>
                <Select
                  label="Automatic logout after inactivity"
                  selectedKeys={[sessionTimeout]}
                  onChange={(e) => setSessionTimeout(e.target.value)}
                  className="max-w-xs"
                >
                  <SelectItem key="15" value="15">15 minutes</SelectItem>
                  <SelectItem key="30" value="30">30 minutes</SelectItem>
                  <SelectItem key="60" value="60">1 hour</SelectItem>
                  <SelectItem key="120" value="120">2 hours</SelectItem>
                  <SelectItem key="0" value="0">Never</SelectItem>
                </Select>
              </div>

              <Divider />

              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">Maintenance Mode</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Restrict access to admins only
                  </p>
                </div>
                <Switch
                  isSelected={maintenanceMode}
                  onValueChange={setMaintenanceMode}
                  color="warning"
                />
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Sidebar - Quick Actions */}
        <div className="space-y-6">
          {/* Quick Stats */}
          <Card className="rounded-2xl border shadow-sm">
            <CardHeader className="border-b px-6 py-4">
              <h3 className="font-semibold text-gray-900">System Status</h3>
            </CardHeader>
            <CardBody className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Status</span>
                <Chip size="sm" color="success" variant="flat">Online</Chip>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Mode</span>
                <Chip size="sm" color={maintenanceMode ? "warning" : "primary"} variant="flat">
                  {maintenanceMode ? "Maintenance" : "Active"}
                </Chip>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">API</span>
                <Chip size="sm" color="success" variant="flat">Connected</Chip>
              </div>
            </CardBody>
          </Card>

          {/* Quick Actions */}
          <Card className="rounded-2xl border shadow-sm">
            <CardHeader className="border-b px-6 py-4">
              <h3 className="font-semibold text-gray-900">Quick Actions</h3>
            </CardHeader>
            <CardBody className="p-6 space-y-3">
              <Button
                fullWidth
                variant="flat"
                color="primary"
                startContent={<UserCircleIcon className="h-4 w-4" />}
                onPress={() => window.location.href = "/admin/users"}
              >
                Manage Users
              </Button>
              <Button
                fullWidth
                variant="flat"
                color="secondary"
                startContent={<Cog6ToothIcon className="h-4 w-4" />}
                onPress={() => window.location.href = "/admin/stats"}
              >
                View Statistics
              </Button>
              <Button
                fullWidth
                variant="flat"
                startContent={<EnvelopeIcon className="h-4 w-4" />}
              >
                Send Announcement
              </Button>
            </CardBody>
          </Card>

          {/* Role Legend */}
          <Card className="rounded-2xl border shadow-sm">
            <CardHeader className="border-b px-6 py-4">
              <h3 className="font-semibold text-gray-900">User Roles</h3>
            </CardHeader>
            <CardBody className="p-6 space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Normal (N)</span>
                <Chip size="sm" variant="flat">Default</Chip>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Admin (A)</span>
                <Chip size="sm" variant="flat" color="primary">Full Access</Chip>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Care (C)</span>
                <Chip size="sm" variant="flat" color="success">Support</Chip>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Tech (T)</span>
                <Chip size="sm" variant="flat" color="warning">Technical</Chip>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end gap-3 border-t pt-6">
        <Button
          variant="flat"
          onPress={() => window.location.href = "/admin"}
        >
          Cancel
        </Button>
        <Button
          color="primary"
          isLoading={saving}
          onPress={handleSaveSettings}
          className="font-semibold"
        >
          {saving ? "Saving..." : "Save Settings"}
        </Button>
      </div>
    </div>
  );
}
