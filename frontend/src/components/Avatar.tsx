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
  small: 'avatar--small',
  medium: 'avatar--medium',
  large: 'avatar--large',
};

export const Avatar = ({
  firstName,
  lastName,
  size = 'medium',
  highlight = false,
  className = '',
}: AvatarProps) => {
  const baseClasses = 'avatar';
  const sizeClass = sizeClasses[size];
  const highlightClass = highlight ? 'avatar--highlight' : '';
  const combinedClasses = `${baseClasses} ${sizeClass} ${highlightClass} ${className}`.trim();

  return (
    <span className={combinedClasses} title={`${firstName} ${lastName}`}>
      {getInitials(firstName, lastName)}
    </span>
  );
};

