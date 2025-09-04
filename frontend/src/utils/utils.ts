import { clsx } from 'clsx';
import { format } from 'date-fns';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: unknown[]) {
  return twMerge(clsx(inputs));
}

export const formatDate = (date: string | number | Date): string =>
  format(new Date(date), 'yyyy-MM-dd HH:mm:ss');

export const getSimulationDuration = (
  modelStartDate: string | number | Date,
  modelEndDate: string | number | Date,
): string => {
  const start = new Date(modelStartDate);
  const end = new Date(modelEndDate);
  const ms = end.getTime() - start.getTime();
  const days = Math.floor(ms / (1000 * 60 * 60 * 24));

  if (days >= 365) {
    const years = Math.floor(days / 365);
    return `${years} year${years !== 1 ? 's' : ''}`;
  }

  if (days >= 30) {
    const months = Math.floor(days / 30);
    return `${months} month${months !== 1 ? 's' : ''}`;
  }

  if (days >= 1) {
    return `${days} day${days !== 1 ? 's' : ''}`;
  }

  const hours = Math.floor(ms / (1000 * 60 * 60));
  if (hours >= 1) {
    return `${hours} hour${hours !== 1 ? 's' : ''}`;
  }

  const minutes = Math.floor(ms / (1000 * 60));
  return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
};
