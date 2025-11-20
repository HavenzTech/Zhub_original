"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { bmsApi, BmsApiError } from "@/lib/services/bmsApi"
import { authService } from "@/lib/services/auth"
import { UserResponse, CreateUserRequest, CreateUserResponse, UserRole } from "@/types/bms"
import { toast } from "sonner"
import {
  UserPlus,
  Search,
  Mail,
  Shield,
  Loader2,
  RefreshCw,
  Users as UsersIcon,
  Copy,
  Check,
  Eye,
  Calendar,
  Edit,
  Trash2
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"

export default function UsersPage() {
  const router = useRouter()
  const [users, setUsers] = useState<UserResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [showAddForm, setShowAddForm] = useState(false)
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [createdUser, setCreatedUser] = useState<CreateUserResponse | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [passwordCopied, setPasswordCopied] = useState(false)
  const [formData, setFormData] = useState<CreateUserRequest>({
    email: "",
    name: "",
    pictureUrl: "",
    role: "member"
  })

  // Edit user state
  const [showEditForm, setShowEditForm] = useState(false)
  const [editingUser, setEditingUser] = useState<UserResponse | null>(null)
  const [editFormData, setEditFormData] = useState({
    name: "",
    pictureUrl: ""
  })

  // Delete user state
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [deletingUser, setDeletingUser] = useState<UserResponse | null>(null)

  // Initialize auth on mount
  useEffect(() => {
    const auth = authService.getAuth()
    if (!auth) {
      router.push('/login')
      return
    }

    // Check if user has admin or super_admin role
    const role = authService.getCurrentRole()
    if (role !== 'admin' && role !== 'super_admin') {
      toast.error('Access denied. Only admins can manage users.')
      router.push('/')
      return
    }

    const token = authService.getToken()
    const companyId = authService.getCurrentCompanyId()

    if (token) bmsApi.setToken(token)
    if (companyId) bmsApi.setCompanyId(companyId)

    loadUsers()
  }, [router])

  const loadUsers = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await bmsApi.users.getAll()
      setUsers(data as UserResponse[])
    } catch (err) {
      const errorMessage = err instanceof BmsApiError
        ? err.message
        : 'Failed to load users'
      setError(errorMessage)
      toast.error(errorMessage)
      console.error('Error loading users:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.email.trim() || !formData.name.trim()) {
      toast.error("Email and name are required")
      return
    }

    setIsSubmitting(true)
    try {
      const payload: CreateUserRequest = {
        email: formData.email.trim(),
        name: formData.name.trim(),
        role: formData.role,
      }

      // Only add pictureUrl if it has a value
      if (formData.pictureUrl?.trim()) {
        payload.pictureUrl = formData.pictureUrl.trim()
      }

      console.log('Creating user with payload:', payload)
      const newUser = await bmsApi.users.create(payload) as CreateUserResponse

      // Add to users list (convert CreateUserResponse to UserResponse)
      const userResponse: UserResponse = {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        pictureUrl: newUser.pictureUrl,
        createdAt: newUser.createdAt,
        updatedAt: newUser.createdAt,
        role: newUser.role
      }
      setUsers(prev => [...prev, userResponse])

      // Show password modal
      setCreatedUser(newUser)
      setShowPasswordModal(true)
      setShowAddForm(false)

      // Reset form
      setFormData({
        email: "",
        name: "",
        pictureUrl: "",
        role: "member"
      })

      toast.success("User created successfully!")
    } catch (err) {
      const errorMessage = err instanceof BmsApiError ? err.message : 'Failed to create user'
      toast.error(errorMessage)
      console.error('Error creating user:', err)
      if (err instanceof BmsApiError) {
        console.error('Error details:', {
          status: err.status,
          code: err.code,
          details: err.details,
          message: err.message
        })
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const copyPassword = () => {
    if (createdUser?.temporaryPassword) {
      navigator.clipboard.writeText(createdUser.temporaryPassword)
      setPasswordCopied(true)
      toast.success("Password copied to clipboard!")
      setTimeout(() => setPasswordCopied(false), 2000)
    }
  }

  const handleEdit = (user: UserResponse) => {
    setEditingUser(user)
    setEditFormData({
      name: user.name,
      pictureUrl: user.pictureUrl || ""
    })
    setShowEditForm(true)
  }

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingUser || !editFormData.name.trim()) {
      toast.error("Name is required")
      return
    }

    setIsSubmitting(true)
    try {
      const payload = {
        name: editFormData.name.trim(),
        pictureUrl: editFormData.pictureUrl?.trim() || undefined
      }

      await bmsApi.users.update(editingUser.id, payload)

      // Update in users list
      setUsers(prev => prev.map(u =>
        u.id === editingUser.id
          ? { ...u, name: payload.name, pictureUrl: payload.pictureUrl }
          : u
      ))

      setShowEditForm(false)
      setEditingUser(null)
      toast.success("User updated successfully!")
    } catch (err) {
      const errorMessage = err instanceof BmsApiError ? err.message : 'Failed to update user'
      toast.error(errorMessage)
      console.error('Error updating user:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = (user: UserResponse) => {
    setDeletingUser(user)
    setShowDeleteDialog(true)
  }

  const handleDeleteConfirm = async () => {
    if (!deletingUser) return

    setIsSubmitting(true)
    try {
      await bmsApi.users.delete(deletingUser.id)

      // Remove from users list
      setUsers(prev => prev.filter(u => u.id !== deletingUser.id))

      setShowDeleteDialog(false)
      setDeletingUser(null)
      toast.success("User deactivated successfully!")
    } catch (err) {
      const errorMessage = err instanceof BmsApiError ? err.message : 'Failed to deactivate user'
      toast.error(errorMessage)
      console.error('Error deactivating user:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const getRoleBadgeColor = (role?: string) => {
    switch (role) {
      case 'super_admin':
        return 'bg-purple-500 text-white'
      case 'admin':
        return 'bg-blue-500 text-white'
      case 'member':
        return 'bg-green-500 text-white'
      case 'viewer':
        return 'bg-gray-500 text-white'
      default:
        return 'bg-gray-300 text-gray-800'
    }
  }

  const getRoleLabel = (role?: string) => {
    if (!role) return 'Unknown'
    return role.replace('_', ' ').split(' ').map(word =>
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ')
  }

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.role?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-CA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <p className="text-destructive">Error: {error}</p>
        <Button onClick={loadUsers} variant="outline">
          <RefreshCw className="w-4 h-4 mr-2" />
          Retry
        </Button>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Users</h1>
          <p className="text-muted-foreground">Manage users and their roles</p>
        </div>
        <Button onClick={() => setShowAddForm(true)}>
          <UserPlus className="w-4 h-4 mr-2" />
          Add User
        </Button>
      </div>

      {/* Search and Stats */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search by name, email, or role..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Badge variant="outline" className="px-4 py-2">
          <UsersIcon className="w-4 h-4 mr-2" />
          {filteredUsers.length} {filteredUsers.length === 1 ? 'user' : 'users'}
        </Badge>
      </div>

      {/* Users Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredUsers.map((user) => (
          <Card key={user.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  {user.pictureUrl ? (
                    <img
                      src={user.pictureUrl}
                      alt={user.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-primary font-semibold">
                        {getInitials(user.name)}
                      </span>
                    </div>
                  )}
                  <div>
                    <CardTitle className="text-lg">{user.name}</CardTitle>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <Mail className="w-3 h-3" />
                      {user.email}
                    </p>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground flex items-center gap-1">
                  <Shield className="w-4 h-4" />
                  Role
                </span>
                <Badge className={getRoleBadgeColor(user.role)}>
                  {getRoleLabel(user.role)}
                </Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  Joined
                </span>
                <span>{formatDate(user.createdAt)}</span>
              </div>
              <div className="flex gap-2 pt-3 border-t">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleEdit(user)}
                  className="flex-1"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleDelete(user)}
                  className="flex-1"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Deactivate
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredUsers.length === 0 && (
        <Card className="p-12">
          <div className="text-center">
            <UsersIcon className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No users found</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm ? 'Try a different search term' : 'Get started by adding a user'}
            </p>
            {!searchTerm && (
              <Button onClick={() => setShowAddForm(true)}>
                <UserPlus className="w-4 h-4 mr-2" />
                Add User
              </Button>
            )}
          </div>
        </Card>
      )}

      {/* Add User Dialog */}
      <Dialog open={showAddForm} onOpenChange={setShowAddForm}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add New User</DialogTitle>
            <DialogDescription>
              Create a new user account. A temporary password will be generated.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                placeholder="user@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                placeholder="John Doe"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Role *</Label>
              <Select
                value={formData.role}
                onValueChange={(value) => setFormData({ ...formData, role: value as UserRole })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="viewer">Viewer - Read-only access</SelectItem>
                  <SelectItem value="member">Member - Standard access</SelectItem>
                  <SelectItem value="admin">Admin - Full control</SelectItem>
                  <SelectItem value="super_admin">Super Admin - Platform-wide access</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="pictureUrl">Picture URL (optional)</Label>
              <Input
                id="pictureUrl"
                type="url"
                placeholder="https://example.com/photo.jpg"
                value={formData.pictureUrl}
                onChange={(e) => setFormData({ ...formData, pictureUrl: e.target.value })}
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowAddForm(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4 mr-2" />
                    Create User
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Password Display Modal */}
      <Dialog open={showPasswordModal} onOpenChange={setShowPasswordModal}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Check className="w-5 h-5 text-green-500" />
              User Created Successfully!
            </DialogTitle>
            <DialogDescription>
              Please save the temporary password. The user will need it to log in for the first time.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-4 bg-muted rounded-lg space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Email:</span>
                <span className="text-sm">{createdUser?.email}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Name:</span>
                <span className="text-sm">{createdUser?.name}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Role:</span>
                <Badge className={getRoleBadgeColor(createdUser?.role)}>
                  {getRoleLabel(createdUser?.role)}
                </Badge>
              </div>
            </div>
            <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg space-y-2">
              <div className="flex items-center gap-2 text-yellow-800 dark:text-yellow-200">
                <Eye className="w-4 h-4" />
                <span className="text-sm font-semibold">Temporary Password</span>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <code className="flex-1 p-2 bg-white dark:bg-gray-800 rounded border border-yellow-300 dark:border-yellow-700 font-mono text-sm">
                  {createdUser?.temporaryPassword}
                </code>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={copyPassword}
                  className="shrink-0"
                >
                  {passwordCopied ? (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 mr-2" />
                      Copy
                    </>
                  )}
                </Button>
              </div>
              <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-2">
                Send this password to the user via a secure channel (email, Slack, etc.)
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setShowPasswordModal(false)}>
              Got it, close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={showEditForm} onOpenChange={setShowEditForm}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Update user profile information. Email and role cannot be changed here.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-email">Email (read-only)</Label>
              <Input
                id="edit-email"
                type="email"
                value={editingUser?.email || ""}
                disabled
                className="bg-muted"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-name">Full Name *</Label>
              <Input
                id="edit-name"
                placeholder="John Doe"
                value={editFormData.name}
                onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-role">Role (read-only)</Label>
              <div className="flex items-center gap-2">
                <Badge className={getRoleBadgeColor(editingUser?.role)}>
                  {getRoleLabel(editingUser?.role)}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  Role changes require separate approval
                </span>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-pictureUrl">Picture URL (optional)</Label>
              <Input
                id="edit-pictureUrl"
                type="url"
                placeholder="https://example.com/photo.jpg"
                value={editFormData.pictureUrl}
                onChange={(e) => setEditFormData({ ...editFormData, pictureUrl: e.target.value })}
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowEditForm(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete User Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <Trash2 className="w-5 h-5" />
              Deactivate User?
            </DialogTitle>
            <DialogDescription>
              This will deactivate the user account. They won't be able to log in anymore.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">User:</span>
                <span className="text-sm">{deletingUser?.name}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Email:</span>
                <span className="text-sm">{deletingUser?.email}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Role:</span>
                <Badge className={getRoleBadgeColor(deletingUser?.role)}>
                  {getRoleLabel(deletingUser?.role)}
                </Badge>
              </div>
            </div>
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                ⚠️ <strong>Warning:</strong> This action will prevent the user from logging in.
                Their data will be preserved for audit purposes.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Deactivating...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Deactivate User
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
