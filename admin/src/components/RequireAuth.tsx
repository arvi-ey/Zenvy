import { useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useAppSelector } from "@/redux/store";

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const isAuth = useAppSelector((s) => s.auth.isAuthenticated);
  const navigate = useNavigate();
  useEffect(() => { if (!isAuth) navigate({ to: "/signin" }); }, [isAuth, navigate]);
  if (!isAuth) return null;
  return <>{children}</>;
}
