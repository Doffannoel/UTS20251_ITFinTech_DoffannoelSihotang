import { useState, useEffect } from "react";

interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  whatsapp?: string;
  isVerified?: boolean;
}

interface Admin {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface AuthData {
  user: User | null;
  admin: Admin | null;
  isLoading: boolean;
}

export const useAuth = (): AuthData => {
  const [user, setUser] = useState<User | null>(null);
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const fetchAuthData = async () => {
      try {
        // Check for user token first
        const userResponse = await fetch("/api/auth/check-user");
        const userData = await userResponse.json();

        if (userData.user) {
          setUser(userData.user);
          setIsLoading(false);
          return;
        }

        // If no user, check for admin token
        const adminResponse = await fetch("/api/auth/verify-admin");
        const adminData = await adminResponse.json();

        if (adminData.success && adminData.admin) {
          setAdmin(adminData.admin);
        }
      } catch (error) {
        console.error("Error fetching auth data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAuthData();
  }, [mounted]);

  return { user, admin, isLoading };
};
