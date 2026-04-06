import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { authApi } from "@/lib/api";

type AppRole = "SUPER_ADMIN" | "SITE_MANAGER" | "DEVELOPER" | "CONTRACTOR" | "CS_CENTER" | "CS_AGENT";

interface UserInfo {
  email: string;
  name: string;
  roles: AppRole[];
}

interface AuthContextType {
  user: UserInfo | null;
  roles: AppRole[];
  loading: boolean;
  signOut: () => void;
  hasRole: (role: AppRole) => boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null, roles: [], loading: true,
  signOut: () => {}, hasRole: () => false,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("jwt_token");
    if (token) {
      const info = authApi.getUserInfo();
      if (info?.email) setUser(info);
    }
    setLoading(false);
  }, []);

  const signOut = () => {
    authApi.logout();
    setUser(null);
    window.location.href = "/login";
  };

  const roles = user?.roles || [];
  const hasRole = (role: AppRole) => roles.includes(role);

  return (
    <AuthContext.Provider value={{ user, roles, loading, signOut, hasRole }}>
      {children}
    </AuthContext.Provider>
  );
};
