import React from 'react';
import { Calendar, Clock, Globe } from 'lucide-react';
import { TIMEZONES } from '../../constants/mockData';

const CalendarPicker = ({
  selectedDate,
  onDateChange,
  selectedTime,
  onTimeChange,
  selectedTimezone,
  onTimezoneChange,
  error
}) => {
  return (
    <div className="w-full flex flex-col gap-3.5 p-4 bg-slate-50/50 dark:bg-slate-900/30 rounded-card border border-slate-200/60 dark:border-slate-800">
      <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 dark:border-slate-800 pb-2">
        <Calendar className="w-4 h-4 text-primary" />
        Schedule Delivery Settings
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Date Input */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" /> Date
          </label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => onDateChange(e.target.value)}
            className="w-full py-2 px-3 rounded-[12px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 text-slate-900 dark:text-white"
          />
        </div>

        {/* Time Input */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" /> Time
          </label>
          <input
            type="time"
            value={selectedTime}
            onChange={(e) => onTimeChange(e.target.value)}
            className="w-full py-2 px-3 rounded-[12px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 text-slate-900 dark:text-white"
          />
        </div>

        {/* Timezone Selector */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1">
            <Globe className="w-3.5 h-3.5" /> Timezone
          </label>
          <select
            value={selectedTimezone}
            onChange={(e) => onTimezoneChange(e.target.value)}
            className="w-full py-2 px-3 rounded-[12px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 text-slate-900 dark:text-white"
          >
            {TIMEZONES.map((tz) => (
              <option key={tz} value={tz}>
                {tz}
              </option>
            ))}
          </select>
        </div>
      </div>
      {error && (
        <span className="text-xs text-danger font-medium mt-1">{error}</span>
      )}
    </div>
  );
};

export default CalendarPicker;
