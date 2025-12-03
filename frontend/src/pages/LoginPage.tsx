import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

type FieldErrors = {
  [key: string]: string[];
};

export const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: FieldErrors = {};

    if (!form.email.trim()) {
      newErrors.email = ['Email is required'];
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = ['Please provide a valid email address'];
    }

    if (!form.password.trim()) {
      newErrors.password = ['Password is required'];
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setGeneralError(null);
    setErrors({});

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      await login(form);
      navigate('/dashboard');
    } catch (err: any) {
      if (err.errors) {
        setErrors(err.errors);
      } else {
        setGeneralError(err.message || 'Failed to login');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <form className="auth-card" onSubmit={handleSubmit}>
        <h2>Login</h2>
        {generalError && <div className="form-error">{generalError}</div>}
        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          required
          value={form.email}
          onChange={(event) => {
            setForm((prev) => ({ ...prev, email: event.target.value }));
            if (errors.email) {
              setErrors((prev) => {
                const newErrors = { ...prev };
                delete newErrors.email;
                return newErrors;
              });
            }
          }}
          className={errors.email ? 'input-error' : ''}
        />
        {errors.email && errors.email.length > 0 && (
          <div className="field-error">{errors.email[0]}</div>
        )}
        <label htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          required
          value={form.password}
          onChange={(event) => {
            setForm((prev) => ({ ...prev, password: event.target.value }));
            if (errors.password) {
              setErrors((prev) => {
                const newErrors = { ...prev };
                delete newErrors.password;
                return newErrors;
              });
            }
          }}
          className={errors.password ? 'input-error' : ''}
        />
        {errors.password && errors.password.length > 0 && (
          <div className="field-error">{errors.password[0]}</div>
        )}
        <button type="submit" disabled={loading}>
          {loading ? 'Logging in…' : 'Login'}
        </button>
        <p>
          No account? <Link to="/register">Register here</Link>
        </p>
      </form>
    </div>
  );
};
