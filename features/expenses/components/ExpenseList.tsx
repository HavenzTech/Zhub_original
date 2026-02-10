"use client";

import { useState, useEffect, useCallback, useRef } from "react";
// Card replaced with plain divs for consistent styling
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Plus,
  MoreVertical,
  Edit,
  Trash2,
  FileUp,
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  Download,
  Loader2,
} from "lucide-react";
import { bmsApi, BmsApiError } from "@/lib/services/bmsApi";
import { authService } from "@/lib/services/auth";
import { toast } from "sonner";
import { ExpenseFormModal } from "./ExpenseFormModal";
import { ExpenseSummaryCard } from "./ExpenseSummaryCard";
import type {
  ExpenseDto,
  ProjectExpenseSummary,
  CreateExpenseRequest,
  UpdateExpenseRequest,
} from "@/types/bms";

interface ExpenseListProps {
  projectId: string;
  projectName: string;
  onBudgetUpdate?: (newBudgetSpent: number) => void;
}

function getStatusBadge(status: string | null | undefined) {
  switch (status) {
    case "approved":
      return (
        <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
          <CheckCircle className="w-3 h-3 mr-1" />
          Approved
        </Badge>
      );
    case "rejected":
      return (
        <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
          <XCircle className="w-3 h-3 mr-1" />
          Rejected
        </Badge>
      );
    case "pending":
    default:
      return (
        <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
          <Clock className="w-3 h-3 mr-1" />
          Pending
        </Badge>
      );
  }
}

function getCategoryBadge(category: string | null | undefined) {
  if (!category) return null;
  const colors: Record<string, string> = {
    software: "bg-blue-100 text-blue-800",
    contractor: "bg-purple-100 text-purple-800",
    equipment: "bg-orange-100 text-orange-800",
    travel: "bg-teal-100 text-teal-800",
    other: "bg-stone-100 text-stone-800 dark:bg-stone-800 dark:text-stone-300",
  };
  return (
    <Badge className={`${colors[category] || colors.other} hover:opacity-90`}>
      {category.charAt(0).toUpperCase() + category.slice(1)}
    </Badge>
  );
}

export function ExpenseList({ projectId, projectName, onBudgetUpdate }: ExpenseListProps) {
  const [expenses, setExpenses] = useState<ExpenseDto[]>([]);
  const [summary, setSummary] = useState<ProjectExpenseSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [summaryLoading, setSummaryLoading] = useState(true);

  // Form states
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingExpense, setEditingExpense] = useState<ExpenseDto | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Delete dialog
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deletingExpense, setDeletingExpense] = useState<ExpenseDto | null>(null);

  // Reject dialog
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectingExpense, setRejectingExpense] = useState<ExpenseDto | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  // Invoice upload
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingExpenseId, setUploadingExpenseId] = useState<string | null>(null);

  // Check if user is admin
  const isAdmin = authService.isAdmin();
  const currentUserId = authService.getAuth()?.userId;

  const loadExpenses = useCallback(async () => {
    try {
      setLoading(true);
      const result = await bmsApi.expenses.getByProject(projectId, {
        pageSize: 100,
        descending: true,
      });
      setExpenses(result.data || []);
    } catch (err) {
      console.error("Error loading expenses:", err);
      toast.error("Failed to load expenses");
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  const loadSummary = useCallback(async () => {
    try {
      setSummaryLoading(true);
      const result = await bmsApi.expenses.getSummary(projectId);
      setSummary(result);
    } catch (err) {
      console.error("Error loading expense summary:", err);
    } finally {
      setSummaryLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    loadExpenses();
    loadSummary();
  }, [loadExpenses, loadSummary]);

  const handleAddSubmit = async (data: CreateExpenseRequest | UpdateExpenseRequest) => {
    setIsSubmitting(true);
    try {
      await bmsApi.expenses.create(data as CreateExpenseRequest);
      toast.success("Expense added successfully");
      setShowAddForm(false);
      loadExpenses();
      loadSummary();
    } catch (err) {
      const message = err instanceof BmsApiError ? err.message : "Failed to add expense";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditSubmit = async (data: CreateExpenseRequest | UpdateExpenseRequest) => {
    if (!editingExpense?.id) return;
    setIsSubmitting(true);
    try {
      await bmsApi.expenses.update(editingExpense.id, data as UpdateExpenseRequest);
      toast.success("Expense updated successfully");
      setShowEditForm(false);
      setEditingExpense(null);
      loadExpenses();
      loadSummary();
    } catch (err) {
      const message = err instanceof BmsApiError ? err.message : "Failed to update expense";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingExpense?.id) return;
    setIsSubmitting(true);
    try {
      await bmsApi.expenses.delete(deletingExpense.id);
      toast.success("Expense deleted successfully");
      setShowDeleteDialog(false);
      setDeletingExpense(null);
      loadExpenses();
      loadSummary();
    } catch (err) {
      const message = err instanceof BmsApiError ? err.message : "Failed to delete expense";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleApprove = async (expense: ExpenseDto) => {
    if (!expense.id) return;
    try {
      const result = await bmsApi.expenses.approve(expense.id);
      toast.success(result.message || "Expense approved");

      // Update project budget instantly if callback provided
      if (onBudgetUpdate && result.newProjectBudgetSpent !== null && result.newProjectBudgetSpent !== undefined) {
        onBudgetUpdate(result.newProjectBudgetSpent);
      }

      loadExpenses();
      loadSummary();
    } catch (err) {
      const message = err instanceof BmsApiError ? err.message : "Failed to approve expense";
      toast.error(message);
    }
  };

  const handleReject = async () => {
    if (!rejectingExpense?.id || !rejectReason.trim()) return;
    setIsSubmitting(true);
    try {
      await bmsApi.expenses.reject(rejectingExpense.id, { reason: rejectReason.trim() });
      toast.success("Expense rejected");
      setShowRejectDialog(false);
      setRejectingExpense(null);
      setRejectReason("");
      loadExpenses();
      loadSummary();
    } catch (err) {
      const message = err instanceof BmsApiError ? err.message : "Failed to reject expense";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUploadInvoice = async (expenseId: string, file: File) => {
    setUploadingExpenseId(expenseId);
    try {
      await bmsApi.expenses.uploadInvoice(expenseId, file);
      toast.success("Invoice uploaded successfully");
      loadExpenses();
    } catch (err) {
      const message = err instanceof BmsApiError ? err.message : "Failed to upload invoice";
      toast.error(message);
    } finally {
      setUploadingExpenseId(null);
    }
  };

  const handleDownloadInvoice = async (expense: ExpenseDto) => {
    if (!expense.id) return;
    try {
      const result = await bmsApi.expenses.getInvoiceUrl(expense.id);
      if (result.downloadUrl) {
        window.open(result.downloadUrl, "_blank");
      }
    } catch (err) {
      const message = err instanceof BmsApiError ? err.message : "Failed to get invoice";
      toast.error(message);
    }
  };

  const canEdit = (expense: ExpenseDto) => {
    return expense.status === "pending" && expense.submittedByUserId === currentUserId;
  };

  const canDelete = (expense: ExpenseDto) => {
    // Admins can delete any pending expense, submitters can delete their own
    return expense.status === "pending" && (isAdmin || expense.submittedByUserId === currentUserId);
  };

  const canUploadInvoice = (expense: ExpenseDto) => {
    return expense.status === "pending" && expense.submittedByUserId === currentUserId;
  };

  return (
    <div className="space-y-6">
      {/* Summary Card */}
      <ExpenseSummaryCard summary={summary} loading={summaryLoading} />

      {/* Expense List */}
      <div className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-700">
        <div className="px-5 py-4 border-b border-stone-200 dark:border-stone-700 flex items-center justify-between">
          <h3 className="flex items-center gap-2 text-base font-semibold text-stone-900 dark:text-stone-50">
            <FileText className="w-5 h-5" />
            Expenses
          </h3>
          <Button onClick={() => setShowAddForm(true)} size="sm" className="bg-accent-cyan hover:bg-accent-cyan/90 text-white">
            <Plus className="w-4 h-4 mr-2" />
            Add Expense
          </Button>
        </div>
        <div className="p-5">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-stone-400 dark:text-stone-500" />
            </div>
          ) : expenses.length === 0 ? (
            <div className="text-center py-8 text-stone-500 dark:text-stone-400">
              <FileText className="w-12 h-12 mx-auto mb-3 text-stone-300 dark:text-stone-600" />
              <p>No expenses yet</p>
              <p className="text-sm">Add your first expense to track project spending</p>
            </div>
          ) : (
            <div className="space-y-3">
              {expenses.map((expense) => (
                <div
                  key={expense.id}
                  className="flex items-center justify-between p-4 bg-stone-50 dark:bg-stone-800/50 rounded-lg border border-stone-200 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-stone-900 dark:text-stone-50 truncate">
                        {expense.description}
                      </span>
                      {getStatusBadge(expense.status)}
                      {getCategoryBadge(expense.category)}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-stone-600 dark:text-stone-400">
                      <span className="font-semibold text-stone-900 dark:text-stone-50">
                        {expense.amountFormatted || `$${expense.amount?.toLocaleString()}`}
                      </span>
                      <span>{expense.submittedTimeAgo || "Just now"}</span>
                      <span>by {expense.submittedByName}</span>
                      {expense.hasInvoice && (
                        <button
                          onClick={() => handleDownloadInvoice(expense)}
                          className="flex items-center gap-1 text-accent-cyan hover:text-accent-cyan/80"
                        >
                          <Download className="w-3 h-3" />
                          Invoice
                        </button>
                      )}
                    </div>
                    {expense.status === "rejected" && expense.rejectionReason && (
                      <p className="text-sm text-red-600 mt-1">
                        Reason: {expense.rejectionReason}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    {/* Admin approve/reject buttons */}
                    {isAdmin && expense.status === "pending" && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-green-600 border-green-600 hover:bg-green-50"
                          onClick={() => handleApprove(expense)}
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-600 border-red-600 hover:bg-red-50"
                          onClick={() => {
                            setRejectingExpense(expense);
                            setShowRejectDialog(true);
                          }}
                        >
                          <XCircle className="w-4 h-4 mr-1" />
                          Reject
                        </Button>
                      </>
                    )}

                    {/* Actions menu for submitter or admin */}
                    {expense.status === "pending" && (canEdit(expense) || canUploadInvoice(expense) || canDelete(expense)) && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {canEdit(expense) && (
                            <DropdownMenuItem
                              onClick={() => {
                                setEditingExpense(expense);
                                setShowEditForm(true);
                              }}
                            >
                              <Edit className="w-4 h-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                          )}
                          {canUploadInvoice(expense) && (
                            <DropdownMenuItem
                              onClick={() => {
                                setUploadingExpenseId(expense.id!);
                                fileInputRef.current?.click();
                              }}
                            >
                              <FileUp className="w-4 h-4 mr-2" />
                              {expense.hasInvoice ? "Replace Invoice" : "Upload Invoice"}
                            </DropdownMenuItem>
                          )}
                          {canDelete(expense) && (
                            <DropdownMenuItem
                              className="text-red-600"
                              onClick={() => {
                                setDeletingExpense(expense);
                                setShowDeleteDialog(true);
                              }}
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}

                    {uploadingExpenseId === expense.id && (
                      <Loader2 className="w-4 h-4 animate-spin text-stone-400 dark:text-stone-500" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Hidden file input for invoice upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.jpg,.jpeg,.png,.gif"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file && uploadingExpenseId) {
            handleUploadInvoice(uploadingExpenseId, file);
          }
          e.target.value = "";
        }}
      />

      {/* Add Form Modal */}
      <ExpenseFormModal
        open={showAddForm}
        onOpenChange={setShowAddForm}
        mode="add"
        projectId={projectId}
        isSubmitting={isSubmitting}
        onSubmit={handleAddSubmit}
      />

      {/* Edit Form Modal */}
      <ExpenseFormModal
        open={showEditForm}
        onOpenChange={(open) => {
          setShowEditForm(open);
          if (!open) setEditingExpense(null);
        }}
        mode="edit"
        projectId={projectId}
        expense={editingExpense}
        isSubmitting={isSubmitting}
        onSubmit={handleEditSubmit}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Expense</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this expense? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isSubmitting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isSubmitting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reject Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Expense</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="rejectReason">Reason for rejection *</Label>
            <Textarea
              id="rejectReason"
              placeholder="e.g., Missing receipt details, Exceeds budget limit"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={3}
              className="mt-2"
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowRejectDialog(false);
                setRejectingExpense(null);
                setRejectReason("");
              }}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleReject}
              disabled={!rejectReason.trim() || isSubmitting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isSubmitting ? "Rejecting..." : "Reject Expense"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
