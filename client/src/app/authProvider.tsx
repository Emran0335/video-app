import { useGetCurrentLoggedInUserQuery } from "@/state/api";
import AuthPage from "./auth/page";

const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const { data: user } = useGetCurrentLoggedInUserQuery();

  if (user) {
    return <div>{children}</div>;
  }

  return <AuthPage />;
};

export default AuthProvider;
