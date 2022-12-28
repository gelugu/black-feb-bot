export interface Command {
  name: string;
  description: string;
  staffOnly: boolean;
  text: string;
  staffText?: string;
}
