import { FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

type FieldErrors = {
  [key: string]: string[];
};

export const RegisterPage = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [form, setForm] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
  });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: FieldErrors = {};

    if (!form.firstName.trim()) {
      newErrors.firstName = ['First name is required'];
    } else if (form.firstName.trim().length > 50) {
      newErrors.firstName = ['First name must not exceed 50 characters'];
    }

    if (!form.lastName.trim()) {
      newErrors.lastName = ['Last name is required'];
    } else if (form.lastName.trim().length > 50) {
      newErrors.lastName = ['Last name must not exceed 50 characters'];
    }

    if (!form.email.trim()) {
      newErrors.email = ['Email is required'];
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = ['Please provide a valid email address'];
    }

    if (!form.password.trim()) {
      newErrors.password = ['Password is required'];
    } else if (form.password.length < 8) {
      newErrors.password = ['Password must be at least 8 characters long'];
    } else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(form.password)) {
      newErrors.password = [
        'Password must contain at least one uppercase letter, one lowercase letter, and one number',
      ];
    } else if (form.password.length > 100) {
      newErrors.password = ['Password must not exceed 100 characters'];
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
      await register(form);
      navigate('/dashboard');
    } catch (err: any) {
      if (err.errors) {
        setErrors(err.errors);
      } else {
        setGeneralError(err.message || 'Failed to register');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleFieldChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  return (
    <div className="auth-page">
      <form className="auth-card" onSubmit={handleSubmit}>
        <h2>Register</h2>
        {generalError && <div className="form-error">{generalError}</div>}
        <label htmlFor="firstName">First Name</label>
        <input
          id="firstName"
          required
          value={form.firstName}
          onChange={(event) => handleFieldChange('firstName', event.target.value)}
          className={errors.firstName ? 'input-error' : ''}
        />
        {errors.firstName && errors.firstName.length > 0 && (
          <div className="field-error">{errors.firstName[0]}</div>
        )}
        <label htmlFor="lastName">Last Name</label>
        <input
          id="lastName"
          required
          value={form.lastName}
          onChange={(event) => handleFieldChange('lastName', event.target.value)}
          className={errors.lastName ? 'input-error' : ''}
        />
        {errors.lastName && errors.lastName.length > 0 && (
          <div className="field-error">{errors.lastName[0]}</div>
        )}
        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          required
          value={form.email}
          onChange={(event) => handleFieldChange('email', event.target.value)}
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
          onChange={(event) => handleFieldChange('password', event.target.value)}
          className={errors.password ? 'input-error' : ''}
        />
        {errors.password && errors.password.length > 0 && (
          <div className="field-error">{errors.password[0]}</div>
        )}
        <button type="submit" disabled={loading}>
          {loading ? 'Registering…' : 'Register'}
        </button>
        <p>
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </form>
    </div>
  );
};
