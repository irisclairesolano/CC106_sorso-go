"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { X } from "lucide-react"
import { useCallback, useEffect, useRef, useState } from "react"

/**
 * TagInput - A polished tag input component with autocomplete support
 * 
 * @param {Object} props
 * @param {string[]} props.value - Current tags array
 * @param {function} props.onChange - Callback when tags change
 * @param {string[]} props.suggestions - Optional array of tag suggestions
 * @param {string} props.placeholder - Input placeholder text
 * @param {number} props.maxTags - Maximum number of tags allowed
 * @param {boolean} props.disabled - Whether the input is disabled
 */
export function TagInput({
  value = [],
  onChange,
  suggestions = [],
  placeholder = "Add a tag...",
  maxTags = 10,
  disabled = false,
  className = "",
}) {
  const [inputValue, setInputValue] = useState("")
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [filteredSuggestions, setFilteredSuggestions] = useState([])
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1)
  const inputRef = useRef(null)
  const containerRef = useRef(null)

  // Filter suggestions based on input
  useEffect(() => {
    if (inputValue.trim() && suggestions.length > 0) {
      const filtered = suggestions.filter(
        (suggestion) =>
          suggestion.toLowerCase().includes(inputValue.toLowerCase()) &&
          !value.includes(suggestion)
      )
      setFilteredSuggestions(filtered.slice(0, 5))
      setShowSuggestions(filtered.length > 0)
    } else {
      setFilteredSuggestions([])
      setShowSuggestions(false)
    }
    setSelectedSuggestionIndex(-1)
  }, [inputValue, suggestions, value])

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setShowSuggestions(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const addTag = useCallback(
    (tag) => {
      const trimmedTag = tag.trim().toLowerCase()
      if (
        trimmedTag &&
        !value.includes(trimmedTag) &&
        value.length < maxTags
      ) {
        onChange([...value, trimmedTag])
        setInputValue("")
        setShowSuggestions(false)
      }
    },
    [value, onChange, maxTags]
  )

  const removeTag = useCallback(
    (tagToRemove) => {
      onChange(value.filter((tag) => tag !== tagToRemove))
    },
    [value, onChange]
  )

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault()
      if (selectedSuggestionIndex >= 0 && filteredSuggestions[selectedSuggestionIndex]) {
        addTag(filteredSuggestions[selectedSuggestionIndex])
      } else if (inputValue.trim()) {
        addTag(inputValue)
      }
    } else if (e.key === "Backspace" && !inputValue && value.length > 0) {
      removeTag(value[value.length - 1])
    } else if (e.key === "ArrowDown") {
      e.preventDefault()
      setSelectedSuggestionIndex((prev) =>
        prev < filteredSuggestions.length - 1 ? prev + 1 : prev
      )
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      setSelectedSuggestionIndex((prev) => (prev > 0 ? prev - 1 : -1))
    } else if (e.key === "Escape") {
      setShowSuggestions(false)
      setSelectedSuggestionIndex(-1)
    } else if (e.key === "," || e.key === "Tab") {
      if (inputValue.trim()) {
        e.preventDefault()
        addTag(inputValue)
      }
    }
  }

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <div
        className={`
          flex flex-wrap gap-2 p-2 min-h-[42px] rounded-md border border-input bg-background
          focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2
          ${disabled ? "opacity-50 cursor-not-allowed" : ""}
        `}
        onClick={() => inputRef.current?.focus()}
      >
        {/* Existing tags */}
        {value.map((tag) => (
          <Badge
            key={tag}
            variant="secondary"
            className="flex items-center gap-1 px-2 py-1 text-xs font-medium bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
          >
            {tag}
            {!disabled && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  removeTag(tag)
                }}
                className="ml-1 rounded-full hover:bg-primary/30 p-0.5 transition-colors"
                aria-label={`Remove ${tag} tag`}
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </Badge>
        ))}

        {/* Input field */}
        {value.length < maxTags && (
          <Input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => {
              if (inputValue.trim() && filteredSuggestions.length > 0) {
                setShowSuggestions(true)
              }
            }}
            placeholder={value.length === 0 ? placeholder : ""}
            disabled={disabled}
            className="flex-1 min-w-[120px] border-0 p-0 h-6 focus-visible:ring-0 focus-visible:ring-offset-0 text-sm"
          />
        )}
      </div>

      {/* Tag count */}
      <div className="flex justify-between items-center mt-1.5 text-xs text-muted-foreground">
        <span>Press Enter or comma to add a tag</span>
        <span>{value.length}/{maxTags} tags</span>
      </div>

      {/* Suggestions dropdown */}
      {showSuggestions && (
        <div className="absolute z-50 w-full mt-1 bg-popover border rounded-md shadow-md overflow-hidden">
          {filteredSuggestions.map((suggestion, index) => (
            <button
              key={suggestion}
              type="button"
              onClick={() => addTag(suggestion)}
              className={`
                w-full px-3 py-2 text-left text-sm transition-colors
                ${index === selectedSuggestionIndex
                  ? "bg-accent text-accent-foreground"
                  : "hover:bg-accent/50"
                }
              `}
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default TagInput

