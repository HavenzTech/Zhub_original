"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import type { ExpenseDto, CreateExpenseRequest, UpdateExpenseRequest } from "@/types/bms";

const EXPENSE_CATEGORIES = [
  { value: "software", label: "Software" },
  { value: "contractor", label: "Contractor" },
  { value: "equipment", label: "Equipment" },
  { value: "travel", label: "Travel" },
  { value: "other", label: "Other" },
];

interface ExpenseFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "add" | "edit";
  projectId: string;
  expense?: ExpenseDto | null;
  isSubmitting: boolean;
  onSubmit: (data: CreateExpenseRequest | UpdateExpenseRequest) => Promise<void>;
}

export function ExpenseFormModal({
  open,
  onOpenChange,
  mode,
  projectId,
  expense,
  isSubmitting,
  onSubmit,
}: ExpenseFormModalProps) {
  const [description, setDescription] = useState(expense?.description || "");
  const [amount, setAmount] = useState(expense?.amount?.toString() || "");
  const [expenseDate, setExpenseDate] = useState(
    expense?.expenseDate ? expense.expenseDate.split("T")[0] : new Date().toISOString().split("T")[0]
  );
  const [category, setCategory] = useState(expense?.category || "");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (mode === "add") {
      const data: CreateExpenseRequest = {
        projectId,
        description: description.trim(),
        amount: parseFloat(amount),
        expenseDate: expenseDate,
        category: category || null,
      };
      await onSubmit(data);
    } else {
      const data: UpdateExpenseRequest = {
        description: description.trim(),
        amount: parseFloat(amount),
        expenseDate: expenseDate,
        category: category || null,
      };
      await onSubmit(data);
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      // Reset form when closing
      setDescription(expense?.description || "");
      setAmount(expense?.amount?.toString() || "");
      setExpenseDate(
        expense?.expenseDate ? expense.expenseDate.split("T")[0] : new Date().toISOString().split("T")[0]
      );
      setCategory(expense?.category || "");
    }
    onOpenChange(open);
  };

  const isValid = description.trim() && amount && parseFloat(amount) > 0 && expenseDate;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {mode === "add" ? "Add Expense" : "Edit Expense"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                placeholder="e.g., AWS monthly hosting, Design contractor payment"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
              />
            </div>

            {/* Amount */}
            <div className="space-y-2">
              <Label htmlFor="amount">Amount ($) *</Label>
              <Input
                id="amount"
                type="number"
                min="0.01"
                step="0.01"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>

            {/* Expense Date */}
            <div className="space-y-2">
              <Label htmlFor="expenseDate">Expense Date *</Label>
              <Input
                id="expenseDate"
                type="date"
                value={expenseDate}
                onChange={(e) => setExpenseDate(e.target.value)}
              />
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a category (optional)" />
                </SelectTrigger>
                <SelectContent>
                  {EXPENSE_CATEGORIES.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={!isValid || isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {mode === "add" ? "Adding..." : "Saving..."}
                </>
              ) : mode === "add" ? (
                "Add Expense"
              ) : (
                "Save Changes"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
