import React, { createContext, useContext } from "react";

const AuthContext = createContext(null);

const defaultAuthState = {
  user: null,
  isAuthenticated: false,
  isLoadingAuth: false,
  isLoadingPublicSettings: false,
  authError: null,
  appPublicSettings: null,
  logout: () => {},
  navigateToLogin: () => {},
  checkAppState: () => {},
};

export const AuthProvider = ({ children }) => (
  <AuthContext.Provider value={defaultAuthState}>{children}</AuthContext.Provider>
);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
