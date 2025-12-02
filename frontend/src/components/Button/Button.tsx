import { ButtonHTMLAttributes, ReactNode } from 'react';
import styles from './Button.module.css';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'default' | 'danger' | 'secondary';
  children: ReactNode;
};

export const Button = ({ variant = 'default', className = '', children, ...props }: ButtonProps) => {
  const baseClasses = styles.button;
  let variantClasses = '';
  if (variant === 'danger') {
    variantClasses = styles.danger;
  } else if (variant === 'secondary') {
    variantClasses = styles.secondary;
  }
  const combinedClasses = `${baseClasses} ${variantClasses} ${className}`.trim();

  return (
    <button type="button" className={combinedClasses} {...props}>
      {children}
    </button>
  );
};
