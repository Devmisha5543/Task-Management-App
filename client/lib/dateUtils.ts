export interface CalendarDay {
  date: Date;
  dateString: string;
  dayNumber: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  isPast: boolean;
  isWeekend: boolean;
}

export const formatDateToKey = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const getMonthName = (date: Date, locale = "en-US"): string => {
  return date.toLocaleString(locale, { month: "long" });
};

export const getMonthYearHeader = (date: Date): string => {
  return `${date.toLocaleString("en-US", { month: "long" })} ${date.getFullYear()}`;
};

export const getCalendarMonthDays = (activeDate: Date): CalendarDay[] => {
  const year = activeDate.getFullYear();
  const month = activeDate.getMonth();

  const todayStr = formatDateToKey(new Date());

  const firstDayOfMonth = new Date(year, month, 1);
  const startingDayOfWeek = firstDayOfMonth.getDay();

  const daysInCurrentMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const days: CalendarDay[] = [];

  for (let i = startingDayOfWeek - 1; i >= 0; i--) {
    const d = new Date(year, month - 1, daysInPrevMonth - i);
    const dateString = formatDateToKey(d);
    days.push({
      date: d,
      dateString,
      dayNumber: d.getDate(),
      isCurrentMonth: false,
      isToday: dateString === todayStr,
      isPast: dateString < todayStr,
      isWeekend: d.getDay() === 0 || d.getDay() === 6,
    });
  }

  for (let i = 1; i <= daysInCurrentMonth; i++) {
    const d = new Date(year, month, i);
    const dateString = formatDateToKey(d);
    days.push({
      date: d,
      dateString,
      dayNumber: i,
      isCurrentMonth: true,
      isToday: dateString === todayStr,
      isPast: dateString < todayStr,
      isWeekend: d.getDay() === 0 || d.getDay() === 6,
    });
  }

  const remainingCells = 42 - days.length;
  for (let i = 1; i <= remainingCells; i++) {
    const d = new Date(year, month + 1, i);
    const dateString = formatDateToKey(d);
    days.push({
      date: d,
      dateString,
      dayNumber: i,
      isCurrentMonth: false,
      isToday: dateString === todayStr,
      isPast: dateString < todayStr,
      isWeekend: d.getDay() === 0 || d.getDay() === 6,
    });
  }

  return days;
};

export const getWeekDays = (activeDate: Date): CalendarDay[] => {
  const d = new Date(activeDate);
  const day = d.getDay();
  const diff = d.getDate() - day;

  const todayStr = formatDateToKey(new Date());
  const weekDays: CalendarDay[] = [];

  for (let i = 0; i < 7; i++) {
    const dayDate = new Date(d.getFullYear(), d.getMonth(), diff + i);
    const dateString = formatDateToKey(dayDate);
    weekDays.push({
      date: dayDate,
      dateString,
      dayNumber: dayDate.getDate(),
      isCurrentMonth: dayDate.getMonth() === activeDate.getMonth(),
      isToday: dateString === todayStr,
      isPast: dateString < todayStr,
      isWeekend: dayDate.getDay() === 0 || dayDate.getDay() === 6,
    });
  }

  return weekDays;
};

export const isTaskOverdue = (dueDate?: string | null, status?: string): boolean => {
  if (!dueDate || status === "done") return false;
  const due = new Date(dueDate);
  const now = new Date();
  due.setHours(23, 59, 59, 999);
  return due < now;
};
