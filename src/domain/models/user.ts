export type UserRole = 'developer' | 'admin' | 'waiter';

export interface AuthorizedStaff {
  email: string;
  role: UserRole;
  name: string;
  active: boolean;
  assignedAt: string;
  lastLoginAt: string | null;
  currentSessionId?: string;
}

export interface RestaurantUser {
  uid: string;
  role: UserRole;
  name: string;
  email?: string;
  username?: string;
  pinHash?: string;
  isActive: boolean;
  currentSessionId?: string;
  lastLoginAt?: string;
  createdAt?: string;
}
