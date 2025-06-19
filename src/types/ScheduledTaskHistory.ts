export interface ScheduledTaskHistory {
  historyId: string;
  taskName: string;
  runTime: string; 
  status: string;
  notes?: string | null;
}