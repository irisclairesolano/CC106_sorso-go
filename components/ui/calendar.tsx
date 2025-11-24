'use client'

import * as React from 'react'
import {
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from 'lucide-react'
import { DayButton, DayPicker, getDefaultClassNames } from 'react-day-picker'

import { cn } from '@/lib/utils'
import { Button, buttonVariants } from '@/components/ui/button'

/* -------------------------------------------------------------------------- */
/*                           🌸 BEAUTIFIED CALENDAR 🌸                         */
/* -------------------------------------------------------------------------- */

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  captionLayout = 'label',
  buttonVariant = 'ghost',
  formatters,
  components,
  ...props
}: React.ComponentProps<typeof DayPicker> & {
  buttonVariant?: React.ComponentProps<typeof Button>['variant']
}) {
  const defaultClassNames = getDefaultClassNames()

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      captionLayout={captionLayout}
      className={cn(
        // Layout
        'bg-background group/calendar p-3',
        '[--cell-size:--spacing(8)]',
        // For popover/card embedding
        '[[data-slot=card-content]_&]:bg-transparent',
        '[[data-slot=popover-content]_&]:bg-transparent',
        // RTL support
        String.raw`rtl:**:[.rdp-button_next>svg]:rotate-180`,
        String.raw`rtl:**:[.rdp-button_previous>svg]:rotate-180`,
        className,
      )}
      /* ------------------------------- Formatters ------------------------------ */
      formatters={{
        formatMonthDropdown: (date) =>
          date.toLocaleString('default', { month: 'short' }),
        ...formatters,
      }}
      /* ------------------------------- ClassNames ------------------------------ */
      classNames={{
        root: cn('w-fit', defaultClassNames.root),

        months: cn(
          'flex flex-col md:flex-row gap-4 relative',
          defaultClassNames.months,
        ),

        month: cn('flex flex-col w-full gap-4', defaultClassNames.month),

        /* ------------------------------ Navigation ----------------------------- */
        nav: cn(
          'flex items-center justify-between gap-1',
          'absolute top-0 inset-x-0',
          defaultClassNames.nav,
        ),

        button_previous: cn(
          buttonVariants({ variant: buttonVariant }),
          'size-(--cell-size) p-0 select-none aria-disabled:opacity-50',
          defaultClassNames.button_previous,
        ),

        button_next: cn(
          buttonVariants({ variant: buttonVariant }),
          'size-(--cell-size) p-0 select-none aria-disabled:opacity-50',
          defaultClassNames.button_next,
        ),

        /* ---------------------------- Month Caption ---------------------------- */
        month_caption: cn(
          'flex items-center justify-center w-full',
          'h-(--cell-size) px-(--cell-size)',
          defaultClassNames.month_caption,
        ),

        dropdowns: cn(
          'flex items-center justify-center gap-1.5',
          'h-(--cell-size) w-full text-sm font-medium',
          defaultClassNames.dropdowns,
        ),

        dropdown_root: cn(
          'relative border border-input rounded-md shadow-xs',
          'has-focus:border-ring has-focus:ring-ring/50 has-focus:ring-[3px]',
          defaultClassNames.dropdown_root,
        ),

        dropdown: cn(
          'absolute inset-0 bg-popover opacity-0',
          defaultClassNames.dropdown,
        ),

        caption_label: cn(
          'select-none font-medium',
          captionLayout === 'label'
            ? 'text-sm'
            : 'flex items-center gap-1 rounded-md pl-2 pr-1 h-8 text-sm [&>svg]:size-3.5 [&>svg]:text-muted-foreground',
          defaultClassNames.caption_label,
        ),

        /* ------------------------------ Grid Layout ----------------------------- */
        table: 'w-full border-collapse',
        weekdays: cn('flex', defaultClassNames.weekdays),

        weekday: cn(
          'flex-1 text-center text-[0.8rem] text-muted-foreground',
          'font-normal select-none rounded-md',
          defaultClassNames.weekday,
        ),

        week: cn('flex w-full mt-2', defaultClassNames.week),

        week_number_header: cn(
          'w-(--cell-size) select-none',
          defaultClassNames.week_number_header,
        ),

        week_number: cn(
          'text-[0.8rem] text-muted-foreground select-none',
          defaultClassNames.week_number,
        ),

        /* --------------------------------- Day --------------------------------- */
        day: cn(
          'relative w-full h-full p-0 aspect-square text-center select-none',
          'group/day',
          '[&:first-child[data-selected=true]_button]:rounded-l-md',
          '[&:last-child[data-selected=true]_button]:rounded-r-md',
          defaultClassNames.day,
        ),

        /* ---------------------------- Range Selection --------------------------- */
        range_start: cn('rounded-l-md bg-accent', defaultClassNames.range_start),
        range_middle: cn('rounded-none', defaultClassNames.range_middle),
        range_end: cn('rounded-r-md bg-accent', defaultClassNames.range_end),

        /* -------------------------------- States -------------------------------- */
        today: cn(
          'rounded-md bg-accent text-accent-foreground',
          'data-[selected=true]:rounded-none',
          defaultClassNames.today,
        ),

        outside: cn(
          'text-muted-foreground aria-selected:text-muted-foreground',
          defaultClassNames.outside,
        ),

        disabled: cn('text-muted-foreground opacity-50', defaultClassNames.disabled),

        hidden: cn('invisible', defaultClassNames.hidden),

        ...classNames,
      }}
      /* ------------------------------ Custom Parts ----------------------------- */
      components={{
        Root: ({ className, rootRef, ...props }) => (
          <div ref={rootRef} data-slot="calendar" className={cn(className)} {...props} />
        ),

        Chevron: ({ className, orientation, ...props }) => {
          if (orientation === 'left')
            return <ChevronLeftIcon className={cn('size-4', className)} {...props} />

          if (orientation === 'right')
            return <ChevronRightIcon className={cn('size-4', className)} {...props} />

          return <ChevronDownIcon className={cn('size-4', className)} {...props} />
        },

        DayButton: CalendarDayButton,

        WeekNumber: ({ children, ...props }) => (
          <td {...props}>
            <div className="flex items-center justify-center size-(--cell-size)">
              {children}
            </div>
          </td>
        ),

        ...components,
      }}
      {...props}
    />
  )
}

/* -------------------------------------------------------------------------- */
/*                          🎀 Custom Day Button 🎀                           */
/* -------------------------------------------------------------------------- */

function CalendarDayButton({
  className,
  day,
  modifiers,
  ...props
}: React.ComponentProps<typeof DayButton>) {
  const defaultClassNames = getDefaultClassNames()
  const ref = React.useRef<HTMLButtonElement>(null)

  React.useEffect(() => {
    if (modifiers.focused) ref.current?.focus()
  }, [modifiers.focused])

  return (
    <Button
      ref={ref}
      variant="ghost"
      size="icon"
      data-day={day.date.toLocaleDateString()}
      /* Selection states */
      data-selected-single={
        modifiers.selected &&
        !modifiers.range_start &&
        !modifiers.range_end &&
        !modifiers.range_middle
      }
      data-range-start={modifiers.range_start}
      data-range-end={modifiers.range_end}
      data-range-middle={modifiers.range_middle}
      className={cn(
        'w-full aspect-square min-w-(--cell-size)',
        'flex flex-col gap-1 font-normal leading-none',
        'group-data-[focused=true]/day:border-ring group-data-[focused=true]/day:ring-ring/50 group-data-[focused=true]/day:ring-[3px] group-data-[focused=true]/day:relative',
        /* Selected states */
        'data-[selected-single=true]:bg-primary data-[selected-single=true]:text-primary-foreground',
        'data-[range-middle=true]:bg-accent data-[range-middle=true]:text-accent-foreground',
        'data-[range-start=true]:bg-primary data-[range-start=true]:text-primary-foreground rounded-l-md',
        'data-[range-end=true]:bg-primary data-[range-end=true]:text-primary-foreground rounded-r-md',
        /* Inner date text */
        '[&>span]:text-xs [&>span]:opacity-70',
        defaultClassNames.day,
        className,
      )}
      {...props}
    />
  )
}

export { Calendar, CalendarDayButton }
