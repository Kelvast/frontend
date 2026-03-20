"use client";
import { FC, memo, PropsWithChildren, ReactNode, useState } from "react";
import LoginInput from "../../presentation/1-atoms/LoginInput";
import LoginButton from "../../presentation/2-molecules/LoginButton";
import { useRouter } from "next/navigation";

interface Props {
  onSubmit: (username: string, password: string) => Promise<void>;
}

const LoginForm: FC<Props> = ({ onSubmit }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await onSubmit(username, password);
    router.push("/game");
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <LoginInput
        label="Username"
        type="text"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        required
      />
      <LoginInput
        label="Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      <LoginButton loading={loading} onClick={() => {}} />
    </form>
  );
};

export default memo<PropsWithChildren<Props>>(LoginForm);
