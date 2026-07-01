import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { authService } from "@/services/auth.service";
import { getToken, setToken } from "@/services/api";
import type { LoginDTO, RegisterDTO, UserResponseDTO } from "@/types/api";

interface AuthContextValue {
  user: UserResponseDTO | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (dto: LoginDTO) => Promise<void>;
  register: (dto: RegisterDTO) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserResponseDTO | null>(null);
  const [token, setTokenState] = useState<string | null>(() => getToken());
  const [isLoading, setIsLoading] = useState<boolean>(!!getToken());

  useEffect(() => {
    let mounted = true;
    if (!token) {
      setIsLoading(false);
      return;
    }
    authService
      .me()
      .then((u) => mounted && setUser(u))
      .catch(() => {
        setToken(null);
        if (mounted) setTokenState(null);
      })
      .finally(() => mounted && setIsLoading(false));
    return () => {
      mounted = false;
    };
  }, [token]);

  const login = useCallback(async (dto: LoginDTO) => {
    const { user: u, token: t } = await authService.login(dto);
    setToken(t);
    setTokenState(t);
    setUser(u);
  }, []);

  const register = useCallback(async (dto: RegisterDTO) => {
    const { user: u, token: t } = await authService.register(dto);
    setToken(t);
    setTokenState(t);
    setUser(u);
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setTokenState(null);
    setUser(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      isAuthenticated: !!user && !!token,
      isLoading,
      login,
      register,
      logout,
    }),
    [user, token, isLoading, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
