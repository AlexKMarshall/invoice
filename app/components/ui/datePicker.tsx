import { format, isValid, parse } from 'date-fns'
import { CalendarIcon } from 'lucide-react'
import * as React from 'react'
import { mergeRefs } from 'react-merge-refs'

import { cn } from '~/lib/utils'

import { Calendar } from './calendar'
import { Input } from './input'
import { Popover, PopoverContent, PopoverTrigger } from './popover'

export interface DatePickerProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const DatePicker = React.forwardRef<HTMLInputElement, DatePickerProps>(
  ({ className, ...props }, ref) => {
    const [isDatePickerOpen, setIsDatePickerOpen] = React.useState(false)
    const [selectedDate, setSelectedDate] = React.useState<Date>()
    const inputRef = React.useRef<HTMLInputElement>(null)
    return (
      <div className={cn('relative', className)}>
        <Input
          ref={mergeRefs([inputRef, ref])}
          className="pr-12"
          {...props}
          onChange={(event) => {
            const date = parse(event.target.value, 'y-MM-dd', new Date())
            if (isValid(date)) {
              setSelectedDate(date)
            } else {
              setSelectedDate(undefined)
            }
          }}
        />
        <Popover open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
          <PopoverTrigger
            aria-label="open date picker"
            className="absolute right-4 top-1/2 -translate-y-1/2"
          >
            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              defaultMonth={selectedDate}
              selected={selectedDate}
              onSelect={(date) => {
                setSelectedDate(date)
                if (date && inputRef.current) {
                  inputRef.current.value = format(date, 'y-MM-dd')
                }
                setIsDatePickerOpen(false)
              }}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>
    )
  },
)
DatePicker.displayName = 'DatePicker'

export { DatePicker }
