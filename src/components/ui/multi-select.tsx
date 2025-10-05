"use client"

import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"

type Option = { value: string; label: string }

const conditionsOptions: Option[] = [
  { value: "respiratory", label: "Respiratory Condition" },
  { value: "heart", label: "Heart Condition" },
  { value: "pregnant", label: "Pregnancy" },
  { value: "active", label: "Active Lifestyle" },
]

export function MultiSelectConditions({
  value,
  onChange,
}: {
  value: string[]
  onChange: (val: string[]) => void
}) {
  const [open, setOpen] = React.useState(false)

  const toggleValue = (val: string) => {
    onChange(
      value.includes(val)
        ? value.filter((v) => v !== val)
        : [...value, val]
    )
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          className="w-full justify-between truncate"
        >
          {value.length > 0
            ? conditionsOptions
                .filter((opt) => value.includes(opt.value))
                .map((opt) => opt.label)
                .join(", ")
            : "Select conditions..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command>
          <CommandInput placeholder="Search condition..." />
          <CommandList>
            <CommandEmpty>No condition found.</CommandEmpty>
            <CommandGroup>
              {conditionsOptions.map((opt) => {
                const selected = value.includes(opt.value)
                return (
                  <CommandItem
                    key={opt.value}
                    onSelect={() => toggleValue(opt.value)}
                  >
                    <div
                      className={cn(
                        "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border",
                        selected
                          ? "bg-primary text-primary-foreground"
                          : "opacity-50"
                      )}
                    >
                      {selected && <Check className="h-3 w-3" />}
                    </div>
                    {opt.label}
                  </CommandItem>
                )
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
