import { ButtonHTMLAttributes, ReactNode } from 'react';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'default' | 'danger';
  children: ReactNode;
};

export const Button = ({ variant = 'default', className = '', children, ...props }: ButtonProps) => {
  const baseClasses = 'button';
  const variantClasses = variant === 'danger' ? 'button--danger' : '';
  const combinedClasses = `${baseClasses} ${variantClasses} ${className}`.trim();

  return (
    <button type="button" className={combinedClasses} {...props}>
      {children}
    </button>
  );
};

