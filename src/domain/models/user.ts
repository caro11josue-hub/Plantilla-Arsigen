export type UserRole = 'developer' | 'admin' | 'waiter';

export interface RestaurantUser {
  uid: string;
  role: UserRole;
  name: string;
  email?: string;
  username?: string;
  pinHash?: string;
  isActive: boolean;
  currentSessionId: string;
  lastLoginAt: string;
  createdAt: string;
}
