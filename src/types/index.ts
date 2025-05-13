export enum UserRole {
  ADMIN = 'admin',
  TEAM_LEAD = 'team_lead',
  EMPLOYEE = 'employee'
}

export enum TaskStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  APPROVED = 'approved',
  REJECTED = 'rejected'
}

export interface User {
  id: number;
  username: string;
  email: string;
  role: UserRole;
  createdAt: Date;
}

export interface AuthUser extends User {
  token: string;
}

export interface Task {
  id: number;
  title: string;
  description: string;
  status: TaskStatus;
  completionPercentage: number;
  dueDate: Date;
  assignedTo: number;
  createdBy: number;
  attachmentUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TopPerformer {
  userId: number;
  username: string;
  tasksCompleted: number;
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  edited: boolean;
  read: boolean;
  readAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ChatState {
  messages: Message[];
  loading: boolean;
  error: string | null;
  typing: Record<string, boolean>;
}