
export function getWeekStartDateUTC(): Date {
  const now = new Date();
  const dayOfWeek = now.getUTCDay(); 
  const date = new Date(now.getTime());
  
  date.setUTCDate(now.getUTCDate() - dayOfWeek);
  date.setUTCHours(0, 0, 0, 0);
  
  return date;
}

export function getWeekEndDateUTC(): Date {
  const startDate = getWeekStartDateUTC();
  const endDate = new Date(startDate.getTime() + 7 * 24 * 60 * 60 * 1000);
  return endDate;
}