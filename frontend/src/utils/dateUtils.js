import { format, isPast as dateIsPast, differenceInDays } from "date-fns";

export const formatDate = (date) => {
  if (!date) return "";
  const d = new Date(date);
  return format(d, "EEE, MMM d yyyy");
};

export const formatTime = (time) => {
  if (!time) return "";

  // Already in "HH:MM AM/PM" format — return unchanged
  if (/\b(AM|PM)\b/i.test(time)) {
    return time.trim();
  }

  // Convert 24-hour "HH:MM" to "HH:MM AM/PM"
  const [hours, minutes] = time.split(":");
  const hour = parseInt(hours, 10);
  const ampm = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 || 12;
  return `${String(displayHour).padStart(2, "0")}:${minutes} ${ampm}`;
};

export const isPast = (date) => {
  if (!date) return false;
  return dateIsPast(new Date(date));
};

export const daysUntil = (date) => {
  if (!date) return 0;
  return differenceInDays(new Date(date), new Date());
};
