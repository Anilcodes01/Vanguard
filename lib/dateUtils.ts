
export function getWeekStartDateUTC(): Date {
  const now = new Date();
  const dayOfWeek = now.getUTCDay(); 
  const date = new Date(now.getTime());
  
  date.setUTCDate(now.getUTCDate() - dayOfWeek);
  date.setUTCHours(0, 0, 0, 0);
  
  return date;
}