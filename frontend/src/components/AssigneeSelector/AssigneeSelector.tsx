import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchUsers } from '@/api/users';
import { Avatar } from '@/components/Avatar';
import styles from './AssigneeSelector.module.css';

type AssigneeSelectorProps = {
  selectedIds: string[];
  onChange: (ids: string[]) => void;
};

export const AssigneeSelector = ({ selectedIds, onChange }: AssigneeSelectorProps) => {
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
            {selectedUsers.map((user) => (
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
            ))}
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
                          <div className={styles.optionName}>
                            {user.firstName} {user.lastName}
                          </div>
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
