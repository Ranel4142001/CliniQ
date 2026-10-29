"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Loader2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useDebounce } from "@/hooks/useDebounce";

export interface AsyncSelectOption {
  value: string;
  label: string;
  subLabel?: string;
  disabled?: boolean;
}

interface AsyncSelectProps {
  value?: string;
  onChange: (value: string) => void;
  loadOptions: (query: string) => Promise<AsyncSelectOption[]>;
  placeholder?: string;
  searchPlaceholder?: string;
  disabled?: boolean;
  className?: string;
}

export function AsyncSelect({
  value,
  onChange,
  loadOptions,
  placeholder = "Select an item...",
  searchPlaceholder = "Type to search...",
  disabled,
  className = "",
}: AsyncSelectProps) {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [options, setOptions] = useState<AsyncSelectOption[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const debouncedSearch = useDebounce(searchTerm, 300);

  const fetchOptions = useCallback(
    async (query: string) => {
      setIsLoading(true);
      try {
        const results = await loadOptions(query);
        setOptions(results);
      } catch (err) {
        console.error("Failed to load options", err);
        setOptions([]);
      } finally {
        setIsLoading(false);
      }
    },
    [loadOptions]
  );

  useEffect(() => {
    if (open) {
      fetchOptions(debouncedSearch);
    }
  }, [debouncedSearch, open, fetchOptions]);

  const selectedOption = options.find((opt) => opt.value === value);

  return (
    <Select
      open={open}
      onOpenChange={setOpen}
      value={value}
      onValueChange={onChange}
      disabled={disabled}
    >
      <SelectTrigger className={className}>
        <SelectValue placeholder={placeholder}>
          {selectedOption ? selectedOption.label : placeholder}
        </SelectValue>
      </SelectTrigger>
      <SelectContent className="max-h-60 w-[var(--radix-select-trigger-width)]">
        <div className="p-2 border-b">
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={searchPlaceholder}
            className="h-8 text-xs"
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
          />
        </div>
        {isLoading ? (
          <div className="flex items-center justify-center p-4 text-xs text-muted-foreground">
            <Loader2 className="mr-2 h-4 w-4 animate-spin text-primary" />
            Searching...
          </div>
        ) : options.length === 0 ? (
          <div className="p-4 text-center text-xs text-muted-foreground">No results found</div>
        ) : (
          options.map((opt) => (
            <SelectItem key={opt.value} value={opt.value} disabled={opt.disabled}>
              <div className="flex flex-col">
                <span className="font-medium">{opt.label}</span>
                {opt.subLabel && (
                  <span className="text-[10px] text-muted-foreground">{opt.subLabel}</span>
                )}
              </div>
            </SelectItem>
          ))
        )}
      </SelectContent>
    </Select>
  );
}
