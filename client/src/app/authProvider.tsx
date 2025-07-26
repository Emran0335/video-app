import { useGetCurrentLoggedInUserQuery } from "@/state/api";
import SignupPage from "./signUp/page";

const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const { data: user } = useGetCurrentLoggedInUserQuery();
  return user ? <div>{children}</div> : <SignupPage />;
};

export default AuthProvider;
