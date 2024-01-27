import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";
import { axiosInstance } from "../axiosInstance";
export interface User {
  id: number;
  name: string;
  email: string;
}

interface AuthContextProps {
  user: User | null;
  accessToken: string | null;
  login: (user: User, accessToken: string) => void;
  logout: () => void;
  setCurrentUser: () => void;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);

  const login = (newUser: User, accessToken: string) => {
    setUser(newUser);
    setAccessToken(accessToken);
  };

  const logout = () => {
    setUser(null);
    localStorage.clear();
  };
  const getCurrentUser = async () => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      try {
        const response = await axiosInstance.get("/users/me");
        setUser(response.data);
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    }
  };

  useEffect(() => {}, []);

  const contextValue: AuthContextProps = {
    user,
    login,
    accessToken,
    logout,
    setCurrentUser: getCurrentUser,
  };

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};
