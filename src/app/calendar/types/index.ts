export interface Event {
  id: string;
  title: string;
  start: Date;
  end: Date;
  color?: string;
  isAllDay?: boolean;
}
