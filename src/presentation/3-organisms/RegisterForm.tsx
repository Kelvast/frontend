"use client";
import { FC, memo, useState } from "react";
import Input from "../1-atoms/Input";
import Button from "../1-atoms/Button";

interface FieldErrors {
  playerName?: string;
  email?: string;
  password?: string;
}

interface Props {
  onSubmit: (playerName: string, email: string, password: string) => Promise<void>;
}

function validateRegister(playerName: string, email: string, password: string): FieldErrors {
  const errors: FieldErrors = {};
  if (!playerName.trim()) errors.playerName = "Name is required";
  else if (playerName.trim().length < 2) errors.playerName = "Name must be at least 2 characters";
  if (!email) errors.email = "Email is required";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = "Enter a valid email address";
  if (!password) errors.password = "Password is required";
  else if (password.length < 8) errors.password = "Password must be at least 8 characters";
  else if (!/[A-Z]/.test(password)) errors.password = "Password must contain an uppercase letter";
  else if (!/[0-9]/.test(password)) errors.password = "Password must contain a number";
  return errors;
}

const RegisterForm: FC<Props> = ({ onSubmit }) => {
  const [playerName, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const errors = validateRegister(playerName, email, password);
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }
    setFieldErrors({});
    setLoading(true);

    try {
      await onSubmit(playerName, email, password);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
      <Input
        label="Name"
        type="text"
        autoComplete="playerName"
        value={playerName}
        onChange={(e) => setName(e.target.value)}
        error={fieldErrors.playerName}
        disabled={loading}
      />
      <Input
        label="Email"
        type="email"
        autoComplete="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        error={fieldErrors.email}
        disabled={loading}
      />
      <Input
        label="Password"
        type="password"
        autoComplete="new-password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        error={fieldErrors.password}
        disabled={loading}
      />
      {formError && (
        <p role="alert" className="text-sm text-[var(--color-danger)]">
          {formError}
        </p>
      )}
      <Button type="submit" loading={loading} fullWidth>
        Create account
      </Button>
    </form>
  );
};

export default memo(RegisterForm);
