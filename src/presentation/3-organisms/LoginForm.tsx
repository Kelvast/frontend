"use client";
import { FC, memo, useState } from "react";
import Input from "../1-atoms/Input";
import Button from "../1-atoms/Button";

interface FieldErrors {
  email?: string;
  password?: string;
}

interface Props {
  onSubmit: (email: string, password: string) => Promise<void>;
}

function validateLogin(email: string, password: string): FieldErrors {
  const errors: FieldErrors = {};
  if (!email) errors.email = "Email is required";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = "Enter a valid email address";
  if (!password) errors.password = "Password is required";
  return errors;
}

const LoginForm: FC<Props> = ({ onSubmit }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const errors = validateLogin(email, password);
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }
    setFieldErrors({});
    setLoading(true);

    try {
      await onSubmit(email, password);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Sign in failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
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
        autoComplete="current-password"
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
        Sign in
      </Button>
    </form>
  );
};

export default memo(LoginForm);
