"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Check, X, Shield, Eye, Edit, Trash2, Plus } from "lucide-react"
import { getCurrentRole, getPermissions, getRoleInfo } from "@/lib/utils/permissions"

export function PermissionMatrixDemo() {
  const role = getCurrentRole()
  const permissions = getPermissions()
  const roleInfo = role ? getRoleInfo(role) : null

  if (!role || !roleInfo) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Permission Matrix</CardTitle>
          <CardDescription>You are not logged in</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  const actions = [
    { name: 'View', icon: Eye, key: 'canView', description: 'View and read resources' },
    { name: 'Create', icon: Plus, key: 'canCreate', description: 'Create new resources' },
    { name: 'Edit', icon: Edit, key: 'canEdit', description: 'Modify existing resources' },
    { name: 'Delete', icon: Trash2, key: 'canDelete', description: 'Remove resources permanently' },
  ]

  return (
    <Card className="border-2">
      <CardHeader className={`bg-${roleInfo.color}-50 border-b`}>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Shield className={`w-5 h-5 text-${roleInfo.color}-600`} />
              Permission Matrix
            </CardTitle>
            <CardDescription className="mt-2">
              Your current role and permissions
            </CardDescription>
          </div>
          <Badge className={`bg-${roleInfo.color}-100 text-${roleInfo.color}-800 text-lg px-4 py-2`}>
            {roleInfo.icon} {roleInfo.badge}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-6">
          {/* Role Description */}
          <div className={`p-4 bg-${roleInfo.color}-50 border border-${roleInfo.color}-200 rounded-lg`}>
            <h4 className="font-semibold text-gray-900 mb-1">{roleInfo.label}</h4>
            <p className="text-sm text-gray-600">{roleInfo.description}</p>
          </div>

          {/* Permission Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {actions.map((action) => {
              const hasPermission = permissions[action.key as keyof typeof permissions]
              const Icon = action.icon

              return (
                <div
                  key={action.name}
                  className={`p-4 rounded-lg border-2 ${
                    hasPermission
                      ? 'bg-green-50 border-green-200'
                      : 'bg-red-50 border-red-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Icon className={`w-5 h-5 ${hasPermission ? 'text-green-600' : 'text-red-600'}`} />
                      <h4 className="font-semibold text-gray-900">{action.name}</h4>
                    </div>
                    {hasPermission ? (
                      <Check className="w-6 h-6 text-green-600" />
                    ) : (
                      <X className="w-6 h-6 text-red-600" />
                    )}
                  </div>
                  <p className="text-xs text-gray-600">{action.description}</p>
                </div>
              )
            })}
          </div>

          {/* What This Means */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-semibold text-blue-900 mb-2">💡 What this means:</h4>
            <ul className="space-y-1 text-sm text-blue-800">
              {permissions.canView && <li>✓ You can view all resources in your company</li>}
              {permissions.canCreate && <li>✓ You can create new projects, departments, etc.</li>}
              {permissions.canEdit && <li>✓ You can edit existing resources</li>}
              {permissions.canDelete && <li>✓ You can delete resources (admin only)</li>}
              {!permissions.canCreate && <li>✗ You cannot create new resources</li>}
              {!permissions.canEdit && <li>✗ You cannot edit existing resources</li>}
              {!permissions.canDelete && <li>✗ You cannot delete resources</li>}
            </ul>
          </div>

          {/* Test Buttons */}
          <div className="space-y-3">
            <h4 className="font-semibold text-gray-900">Test Permission-Based UI:</h4>
            <div className="grid grid-cols-2 gap-3">
              <Button disabled={!permissions.canCreate} className="w-full">
                <Plus className="w-4 h-4 mr-2" />
                Create Project
              </Button>
              <Button disabled={!permissions.canEdit} variant="outline" className="w-full">
                <Edit className="w-4 h-4 mr-2" />
                Edit Settings
              </Button>
              <Button disabled={!permissions.canDelete} variant="destructive" className="w-full">
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Item
              </Button>
              <Button disabled={!permissions.canView} variant="secondary" className="w-full">
                <Eye className="w-4 h-4 mr-2" />
                View Details
              </Button>
            </div>
            <p className="text-xs text-gray-500 italic">
              * Buttons are enabled/disabled based on your role permissions
            </p>
          </div>

          {/* Role Comparison Table */}
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-100 border-b">
                <tr>
                  <th className="text-left p-3 font-semibold">Action</th>
                  <th className="text-center p-3 font-semibold">👑 Admin</th>
                  <th className="text-center p-3 font-semibold">✏️ Member</th>
                  <th className="text-center p-3 font-semibold">👁️ Viewer</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="p-3 font-medium">View</td>
                  <td className="text-center p-3"><Check className="w-5 h-5 text-green-600 mx-auto" /></td>
                  <td className="text-center p-3"><Check className="w-5 h-5 text-green-600 mx-auto" /></td>
                  <td className="text-center p-3"><Check className="w-5 h-5 text-green-600 mx-auto" /></td>
                </tr>
                <tr className="border-b">
                  <td className="p-3 font-medium">Create</td>
                  <td className="text-center p-3"><Check className="w-5 h-5 text-green-600 mx-auto" /></td>
                  <td className="text-center p-3"><Check className="w-5 h-5 text-green-600 mx-auto" /></td>
                  <td className="text-center p-3"><X className="w-5 h-5 text-red-600 mx-auto" /></td>
                </tr>
                <tr className="border-b">
                  <td className="p-3 font-medium">Edit</td>
                  <td className="text-center p-3"><Check className="w-5 h-5 text-green-600 mx-auto" /></td>
                  <td className="text-center p-3"><Check className="w-5 h-5 text-green-600 mx-auto" /></td>
                  <td className="text-center p-3"><X className="w-5 h-5 text-red-600 mx-auto" /></td>
                </tr>
                <tr>
                  <td className="p-3 font-medium">Delete</td>
                  <td className="text-center p-3"><Check className="w-5 h-5 text-green-600 mx-auto" /></td>
                  <td className="text-center p-3"><X className="w-5 h-5 text-red-600 mx-auto" /></td>
                  <td className="text-center p-3"><X className="w-5 h-5 text-red-600 mx-auto" /></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
