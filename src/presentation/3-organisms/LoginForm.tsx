"use client";
import { FC, memo, PropsWithChildren, useState } from "react";
import LoginInput from "../../presentation/1-atoms/LoginInput";
import LoginButton from "../../presentation/2-molecules/LoginButton";

interface Props {
  onSubmit: (email: string, password: string) => Promise<void>;
}

const LoginForm: FC<Props> = ({ onSubmit }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await onSubmit(email, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <LoginInput
        label="Email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <LoginInput
        label="Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      {error && <p className="text-sm text-red-600">{error}</p>}
      <LoginButton loading={loading} onClick={() => {}} />
    </form>
  );
};

export default memo<PropsWithChildren<Props>>(LoginForm);
