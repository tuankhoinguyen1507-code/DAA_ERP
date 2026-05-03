import React, { createContext, useContext, useState, ReactNode } from 'react';
import { UserAccount, Role, Scope, checkPermission, Permission } from '../lib/rbac';

interface AuthContextType {
  user: UserAccount | null;
  login: (role: Role) => void;
  logout: () => void;
  hasPermission: (permission: Permission) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  // Simulate a logged-in user by default (e.g., Head of DAA)
  const [user, setUser] = useState<UserAccount | null>({
    id: 'u1',
    name: 'John Doe',
    email: 'admin@daa.edu',
    role: 'head_of_daa',
    scope: 'all'
  });

  const login = (role: Role) => {
    // Dummy login just to demonstrate role switching
    let name = 'Admin User';
    let scope: Scope = 'all';
    
    if (role === 'daa_member') name = 'DAA Member';
    if (role === 'head_of_subject') { name = 'Head of English'; scope = 'department'; }
    if (role === 'lecturer') { name = 'Teacher'; scope = 'assigned_only'; }
    if (role === 'ta') { name = 'Teaching Assistant'; scope = 'assigned_only'; }

    setUser({
      id: `u_${Date.now()}`,
      name,
      email: `${role}@daa.edu`,
      role,
      scope,
    });
  };

  const logout = () => setUser(null);

  const hasPermission = (permission: Permission) => {
    if (!user) return false;
    return checkPermission(user, permission);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, hasPermission }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
