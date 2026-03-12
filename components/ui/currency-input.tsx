"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";

interface CurrencyInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange" | "value" | "type"> {
  value: number | string;
  onChange: (value: number) => void;
}

/**
 * Currency input that displays formatted numbers with commas (e.g. 1,000,000.00)
 * while storing the raw numeric value.
 */
export function CurrencyInput({ value, onChange, ...props }: CurrencyInputProps) {
  const [displayValue, setDisplayValue] = React.useState("");
  const [isFocused, setIsFocused] = React.useState(false);

  // Format number with commas
  const formatNumber = (num: number | string): string => {
    const n = typeof num === "string" ? parseFloat(num) : num;
    if (isNaN(n) || n === 0) return "";
    const parts = n.toString().split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return parts.join(".");
  };

  // Sync display value when value prop changes and input is not focused
  React.useEffect(() => {
    if (!isFocused) {
      setDisplayValue(formatNumber(value));
    }
  }, [value, isFocused]);

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(true);
    // Show raw number without commas when editing
    const n = typeof value === "string" ? parseFloat(value) : value;
    setDisplayValue(isNaN(n) || n === 0 ? "" : n.toString());
    props.onFocus?.(e);
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(false);
    const raw = e.target.value.replace(/,/g, "");
    const n = parseFloat(raw);
    if (!isNaN(n)) {
      onChange(n);
      setDisplayValue(formatNumber(n));
    } else {
      onChange(0);
      setDisplayValue("");
    }
    props.onBlur?.(e);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/,/g, "");
    // Allow empty, digits, and one decimal point
    if (raw === "" || /^\d*\.?\d*$/.test(raw)) {
      setDisplayValue(raw);
      const n = parseFloat(raw);
      if (!isNaN(n)) {
        onChange(n);
      }
    }
  };

  return (
    <Input
      {...props}
      type="text"
      inputMode="decimal"
      value={displayValue}
      onChange={handleChange}
      onFocus={handleFocus}
      onBlur={handleBlur}
    />
  );
}
