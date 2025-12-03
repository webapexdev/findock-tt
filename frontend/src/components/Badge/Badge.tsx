import styles from './Badge.module.css';

type BadgeProps = {
  label: string;
  variant?: 'admin' | 'manager' | 'user' | 'todo' | 'in_progress' | 'done' | 'custom';
  size?: 'small' | 'medium';
  customColor?: string;
  className?: string;
};

const getBadgeColor = (variant: string): string => {
  switch (variant) {
    case 'admin':
      return '#dc2626';
    case 'manager':
      return '#2563eb';
    case 'user':
      return '#16a34a';
    case 'todo':
      return '#fef3c7';
    case 'in_progress':
      return '#bfdbfe';
    case 'done':
      return '#bbf7d0';
    default:
      return '#64748b';
  }
};

const getTextColor = (variant: string): string => {
  switch (variant) {
    case 'todo':
      return '#92400e';
    case 'in_progress':
      return '#1e3a8a';
    case 'done':
      return '#166534';
    default:
      return '#ffffff';
  }
};

const getVariantClass = (variant: string): string => {
  if (variant === 'custom') return '';
  if (variant === 'in_progress') return styles.inProgress;
  return styles[variant as keyof typeof styles] || '';
};

export const Badge = ({
  label,
  variant = 'custom',
  size = 'medium',
  customColor,
  className = '',
}: BadgeProps) => {
  const baseClasses = styles.badge;
  const sizeClass = size === 'small' ? styles.small : '';
  const variantClass = getVariantClass(variant);
  const combinedClasses = `${baseClasses} ${sizeClass} ${variantClass} ${className}`.trim();

  const backgroundColor = customColor || (variant !== 'custom' ? getBadgeColor(variant) : '#64748b');
  const color = variant === 'todo' || variant === 'in_progress' || variant === 'done'
    ? getTextColor(variant)
    : '#ffffff';

  const style = {
    backgroundColor,
    color,
  };

  return (
    <span className={combinedClasses} style={style}>
      {label}
    </span>
  );
};
