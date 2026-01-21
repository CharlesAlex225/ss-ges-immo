// app/types.ts
export type Ticket = {
  id: string;
  title: string;
  description: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'CLOSED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  category: string;
  createdAt: string; // ISO date string
  userId: string;
};

export enum UserRole {
  TENANT = 'TENANT',
  ADMIN = 'ADMIN',
  PROVIDER = 'PROVIDER'
}

export enum TicketPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT'
}