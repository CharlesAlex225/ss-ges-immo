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
// app/types.ts

// ... keep your Ticket types here ...

export interface User {
  id: string;
  name: string;
  role: UserRole;
  email?: string;
  phone?: string;
}

// ... keep your Enums (UserRole, TicketPriority) here ...