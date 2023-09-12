import { format, isValid, parse } from "date-fns";
import { CalendarIcon } from "lucide-react";
import * as React from "react";
import { mergeRefs } from "react-merge-refs";

import { Calendar } from "./calendar";
import { Input } from "./input";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";

export interface DatePickerProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const DatePicker = React.forwardRef<HTMLInputElement, DatePickerProps>(
  (props, ref) => {
    const [isDatePickerOpen, setIsDatePickerOpen] = React.useState(false);
    const [selectedDate, setSelectedDate] = React.useState<Date>();
    const inputRef = React.useRef<HTMLInputElement>(null);
    return (
      <>
        <Input
          ref={mergeRefs([inputRef, ref])}
          {...props}
          onChange={(event) => {
            const date = parse(event.target.value, "y-MM-dd", new Date());
            if (isValid(date)) {
              setSelectedDate(date);
            } else {
              setSelectedDate(undefined);
            }
          }}
        />
        <Popover open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
          <PopoverTrigger aria-label="open date picker">
            <CalendarIcon className="h-4 w-4" />
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              defaultMonth={selectedDate}
              selected={selectedDate}
              onSelect={(date) => {
                setSelectedDate(date);
                if (date && inputRef.current) {
                  inputRef.current.value = format(date, "y-MM-dd");
                }
                setIsDatePickerOpen(false);
              }}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </>
    );
  },
);
DatePicker.displayName = "DatePicker";

export { DatePicker };
