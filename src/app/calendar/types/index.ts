export interface Event {
  _id: string;
  title: string;
  start: Date;
  end: Date;
  color?: string;
  isAllDay?: boolean;
}

export interface FormEvent {
  title: string;
  start: Date;
  end: Date;
  color?: string;
  isAllDay?: boolean;
}