import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { CheckIcon, ChevronDownIcon } from "lucide-react";
import { createContext, useCallback, useContext, useEffect, useState } from "react";

import { cn } from "@syntax402/utils/class-name";

import { Button } from "./button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "./command";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";

type MultiSelectContextType = {
  open: boolean;
  setOpen: (open: boolean) => void;
  selectedValues: Set<string>;
  toggleValue: (value: string) => void;
  items: Map<string, ReactNode>;
  onItemAdded: (value: string, label: ReactNode) => void;
  name: string;
  disabled?: boolean;
};
const MultiSelectContext = createContext<MultiSelectContextType | null>(null);

export function MultiSelect({
  children,
  value,
  values,
  defaultValues,
  onChange,
  name,
  disabled,
}: {
  children: ReactNode;
  value?: string[];
  values?: string[];
  defaultValues?: string[];
  onChange?: (values: string[]) => void;
  name: string;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const controlledValue = value ?? values;
  const [internalValues, setInternalValues] = useState(new Set<string>(controlledValue ?? defaultValues));
  const selectedValues = controlledValue ? new Set(controlledValue) : internalValues;
  const [items, setItems] = useState<Map<string, ReactNode>>(new Map());

  // Sync internal state when controlled value changes (e.g., on form reset or setValue)
  useEffect(() => {
    if (controlledValue !== undefined) {
      setInternalValues(new Set(controlledValue));
    }
  }, [controlledValue]);

  function toggleValue(value: string) {
    const getNewSet = (prev: Set<string>) => {
      const newSet = new Set(prev);
      if (newSet.has(value)) {
        newSet.delete(value);
      } else {
        newSet.add(value);
      }
      return newSet;
    };
    setInternalValues(getNewSet);
    onChange?.([...getNewSet(selectedValues)]);
  }

  const onItemAdded = useCallback((value: string, label: ReactNode) => {
    setItems((prev) => {
      if (prev.get(value) === label) return prev;
      return new Map(prev).set(value, label);
    });
  }, []);

  return (
    <MultiSelectContext
      value={{
        open,
        setOpen,
        selectedValues,
        toggleValue,
        items,
        onItemAdded,
        name,
        disabled,
      }}
    >
      <Popover open={open} onOpenChange={setOpen}>
        {children}
      </Popover>
    </MultiSelectContext>
  );
}

export function MultiSelectTrigger({
  className,
  children,
  ...props
}: {
  className?: string;
  children?: ReactNode;
} & ComponentPropsWithoutRef<typeof Button>) {
  const { open, disabled } = useMultiSelectContext();

  return (
    <PopoverTrigger asChild disabled={disabled}>
      <Button
        {...props}
        disabled={disabled}
        variant={props.variant ?? "outline"}
        role={props.role ?? "combobox"}
        aria-expanded={props["aria-expanded"] ?? open}
        className={cn(
          "flex h-auto min-h-9 w-fit items-center justify-between gap-2 overflow-hidden whitespace-nowrap rounded-md border border-input bg-transparent px-3 py-1.5 text-sm shadow-xs outline-none transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 data-[placeholder]:text-muted-foreground dark:bg-input/30 dark:aria-invalid:ring-destructive/40 dark:hover:bg-input/50 [&_svg:not([class*='size-'])]:size-4 [&_svg:not([class*='text-'])]:text-muted-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0",
          className
        )}
      >
        {children}
        <ChevronDownIcon className={cn("size-4 shrink-0 opacity-50 transition", open && "rotate-180")} />
      </Button>
    </PopoverTrigger>
  );
}

export function MultiSelectValue({
  placeholder,
  formatSelected,
  className,
  ...props
}: {
  placeholder?: string;
  formatSelected?: (selectedValues: Set<string>) => string;
} & Omit<ComponentPropsWithoutRef<"div">, "children" | "clickToRemove" | "overflowBehavior">) {
  const { selectedValues, name } = useMultiSelectContext();

  const defaultPlaceholder = `Select ${name}...`;
  const defaultSelectedMessage = `${selectedValues.size} ${name} selected`;

  if (selectedValues.size === 0) {
    return (
      <span className="min-w-0 overflow-hidden font-normal text-muted-foreground">
        {placeholder ?? defaultPlaceholder}
      </span>
    );
  }

  return (
    <div {...props} className={cn("flex w-fit gap-1.5 overflow-hidden", className)}>
      <span className="min-w-0 overflow-hidden">{formatSelected?.(selectedValues) ?? defaultSelectedMessage}</span>
    </div>
  );
}

export function MultiSelectContent({
  search = true,
  children,
  ...props
}: {
  search?: boolean | { placeholder?: string; emptyMessage?: string };
  children: ReactNode;
} & Omit<ComponentPropsWithoutRef<typeof Command>, "children">) {
  const canSearch = typeof search === "object" ? true : search;

  return (
    <>
      <div style={{ display: "none" }}>
        <Command>
          <CommandList>{children}</CommandList>
        </Command>
      </div>
      <PopoverContent className="min-w-[var(--radix-popover-trigger-width)] p-0">
        <Command {...props}>
          {canSearch ? (
            <CommandInput placeholder={typeof search === "object" ? search.placeholder : undefined} />
          ) : (
            <button type="submit" className="sr-only" />
          )}
          <CommandList>
            {canSearch && <CommandEmpty>{typeof search === "object" ? search.emptyMessage : undefined}</CommandEmpty>}
            {children}
          </CommandList>
        </Command>
      </PopoverContent>
    </>
  );
}

export function MultiSelectItem({
  value,
  children,
  badgeLabel,
  onSelect,
  ...props
}: {
  badgeLabel?: ReactNode;
  value: string;
} & Omit<ComponentPropsWithoutRef<typeof CommandItem>, "value">) {
  const { toggleValue, selectedValues, onItemAdded } = useMultiSelectContext();
  const isSelected = selectedValues.has(value);

  useEffect(() => {
    onItemAdded(value, badgeLabel ?? children);
  }, [value, children, onItemAdded, badgeLabel]);

  return (
    <CommandItem
      {...props}
      onSelect={() => {
        toggleValue(value);
        onSelect?.(value);
      }}
    >
      <CheckIcon className={cn("mr-2 size-4 text-primary", isSelected ? "opacity-100" : "opacity-0")} />
      {children}
    </CommandItem>
  );
}

export function MultiSelectGroup(props: ComponentPropsWithoutRef<typeof CommandGroup>) {
  return <CommandGroup {...props} />;
}

export function MultiSelectSeparator(props: ComponentPropsWithoutRef<typeof CommandSeparator>) {
  return <CommandSeparator {...props} />;
}

function useMultiSelectContext() {
  const context = useContext(MultiSelectContext);
  if (context == null) {
    throw new Error("useMultiSelectContext must be used within a MultiSelectContext");
  }
  return context;
}
