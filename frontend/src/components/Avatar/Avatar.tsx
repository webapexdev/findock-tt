import styles from './Avatar.module.css';

type AvatarProps = {
  firstName: string;
  lastName: string;
  size?: 'small' | 'medium' | 'large';
  highlight?: boolean;
  className?: string;
};

const getInitials = (firstName: string, lastName: string): string => {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
};

const sizeClasses = {
  small: styles.small,
  medium: styles.medium,
  large: styles.large,
};

export const Avatar = ({
  firstName,
  lastName,
  size = 'medium',
  highlight = false,
  className = '',
}: AvatarProps) => {
  const baseClasses = styles.avatar;
  const sizeClass = sizeClasses[size];
  const highlightClass = highlight ? styles.highlight : '';
  const combinedClasses = `${baseClasses} ${sizeClass} ${highlightClass} ${className}`.trim();

  return (
    <span className={combinedClasses} title={`${firstName} ${lastName}`}>
      {getInitials(firstName, lastName)}
    </span>
  );
};
