import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchUsers } from '@/api/users';
import { Avatar } from '@/components/Avatar';
import { Badge } from '@/components/Badge';
import styles from './AssigneeSelector.module.css';

type AssigneeSelectorProps = {
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  variant?: 'full' | 'simple'; // 'full' shows badge with name, 'simple' shows only avatar
};

export const AssigneeSelector = ({ selectedIds, onChange, variant = 'simple' }: AssigneeSelectorProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: fetchUsers,
  });

  const filteredUsers = useMemo(() => {
    if (!searchQuery.trim()) return users;
    const query = searchQuery.toLowerCase();
    return users.filter(
      (user) =>
        user.firstName.toLowerCase().includes(query) ||
        user.lastName.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query)
    );
  }, [users, searchQuery]);

  const selectedUsers = useMemo(() => {
    return users.filter((user) => selectedIds.includes(user.id));
  }, [users, selectedIds]);

  const toggleUser = (userId: string) => {
    if (selectedIds.includes(userId)) {
      onChange(selectedIds.filter((id) => id !== userId));
    } else {
      onChange([...selectedIds, userId]);
    }
  };

  const removeUser = (userId: string) => {
    onChange(selectedIds.filter((id) => id !== userId));
  };

  return (
    <div className={styles.container}>
      <div className={styles.wrapper}>
        {selectedUsers.length > 0 && (
          <div className={styles.selected}>
            {selectedUsers.map((user) => {
              if (variant === 'full') {
                // Full variant: avatar, name, roles (inline with avatar), and close button
                return (
                  <span
                    key={user.id}
                    className={styles.badgeFull}
                    title={`${user.firstName} ${user.lastName}`}
                  >
                    <Avatar
                      firstName={user.firstName}
                      lastName={user.lastName}
                      size="small"
                    />
                    <span className={styles.badgeName}>
                      {user.firstName} {user.lastName}
                    </span>
                    {user.roles && user.roles.length > 0 && (
                      <div className={styles.badgeRoles}>
                        {user.roles.map((role) => (
                          <Badge
                            key={role}
                            label={role}
                            variant={role}
                            size="small"
                          />
                        ))}
                      </div>
                    )}
                    <button
                      type="button"
                      className={styles.badgeRemove}
                      onClick={(e) => {
                        e.stopPropagation();
                        removeUser(user.id);
                      }}
                      aria-label={`Remove ${user.firstName} ${user.lastName}`}
                    >
                      ×
                    </button>
                  </span>
                );
              } else {
                // Simple variant: avatar only
                return (
                  <span
                    key={user.id}
                    className={styles.badge}
                    onClick={() => removeUser(user.id)}
                    title={`${user.firstName} ${user.lastName} - Click to remove`}
                  >
                    <Avatar
                      firstName={user.firstName}
                      lastName={user.lastName}
                      size="small"
                    />
                  </span>
                );
              }
            })}
          </div>
        )}
        <div className={styles.inputWrapper}>
          <input
            id="assignee-search"
            type="text"
            placeholder={selectedUsers.length === 0 ? 'Search and select assignees...' : 'Add more assignees...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setIsOpen(true)}
            className={styles.input}
          />
          {isOpen && (
            <>
              <div className={styles.backdrop} onClick={() => setIsOpen(false)} />
              <div className={styles.dropdown}>
                {isLoading ? (
                  <div className={styles.loading}>Loading users...</div>
                ) : filteredUsers.length === 0 ? (
                  <div className={styles.empty}>No users found</div>
                ) : (
                  filteredUsers.map((user) => {
                    const isSelected = selectedIds.includes(user.id);
                    return (
                      <div
                        key={user.id}
                        className={`${styles.option} ${isSelected ? styles.optionSelected : ''}`}
                        onClick={() => toggleUser(user.id)}
                      >
                        <Avatar
                          firstName={user.firstName}
                          lastName={user.lastName}
                          size="medium"
                        />
                        <div className={styles.optionInfo}>
                          <div className={styles.optionHeader}>
                            <div className={styles.optionName}>
                              {user.firstName} {user.lastName}
                            </div>
                            {variant === 'full' && user.roles && user.roles.length > 0 && (
                              <div className={styles.optionRoles}>
                                {user.roles.map((role) => (
                                  <Badge
                                    key={role}
                                    label={role}
                                    variant={role}
                                    size="small"
                                  />
                                ))}
                              </div>
                            )}
                          </div>
                          {variant === 'full' && (
                            <div className={styles.optionMeta}>
                              <span className={styles.optionEmail}>{user.email}</span>
                            </div>
                          )}
                        </div>
                        {isSelected && <span className={styles.optionCheck}>✓</span>}
                      </div>
                    );
                  })
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
