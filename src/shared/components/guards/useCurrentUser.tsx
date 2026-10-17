"use client";

import React, { createContext, useContext, ReactNode } from "react";
import { Role } from "@/shared/constants/roles";

export interface CurrentUser {
  id: string;
  email: string;
  fullName: string;
  role: Role;
  isActive: boolean;
}

interface UserContextValue {
  user: CurrentUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  logout?: () => void;
}

const UserContext = createContext<UserContextValue>({
  user: null,
  isLoading: false,
  isAuthenticated: false,
});

export function UserProvider({
  children,
  value,
}: {
  children: ReactNode;
  value: UserContextValue;
}) {
  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useCurrentUser(): UserContextValue {
  return useContext(UserContext);
}
