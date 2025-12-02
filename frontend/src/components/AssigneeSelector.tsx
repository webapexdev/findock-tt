import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchUsers } from '../api/users';
import { Avatar } from './Avatar';
import { Badge } from './Badge';

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
    <div className="assignee-selector">
      <label htmlFor="assignee-search">Assignees</label>
      <div className="assignee-selector__container">
        {selectedUsers.length > 0 && (
          <div className="assignee-selector__selected">
            {selectedUsers.map((user) => (
              <span key={user.id} className="assignee-badge">
                <Avatar
                  firstName={user.firstName}
                  lastName={user.lastName}
                  size="small"
                />
                <span className="assignee-badge__name">
                  {user.firstName} {user.lastName}
                </span>
                <button
                  type="button"
                  className="assignee-badge__remove"
                  onClick={() => removeUser(user.id)}
                  aria-label={`Remove ${user.firstName} ${user.lastName}`}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
        <div className="assignee-selector__input-wrapper">
          <input
            id="assignee-search"
            type="text"
            placeholder={selectedUsers.length === 0 ? 'Search and select assignees...' : 'Add more assignees...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setIsOpen(true)}
            className="assignee-selector__input"
          />
          {isOpen && (
            <>
              <div className="assignee-selector__backdrop" onClick={() => setIsOpen(false)} />
              <div className="assignee-selector__dropdown">
                {isLoading ? (
                  <div className="assignee-selector__loading">Loading users...</div>
                ) : filteredUsers.length === 0 ? (
                  <div className="assignee-selector__empty">No users found</div>
                ) : (
                  filteredUsers.map((user) => {
                    const isSelected = selectedIds.includes(user.id);
                    return (
                      <div
                        key={user.id}
                        className={`assignee-option ${isSelected ? 'assignee-option--selected' : ''}`}
                        onClick={() => toggleUser(user.id)}
                      >
                        <Avatar
                          firstName={user.firstName}
                          lastName={user.lastName}
                          size="medium"
                        />
                        <div className="assignee-option__info">
                          <div className="assignee-option__name">
                            {user.firstName} {user.lastName}
                          </div>
                          <div className="assignee-option__meta">
                            <span className="assignee-option__email">{user.email}</span>
                            <div className="assignee-option__roles">
                              {user.roles.map((role) => (
                                <Badge
                                  key={role}
                                  label={role}
                                  variant={role as 'admin' | 'manager' | 'user'}
                                  size="small"
                                />
                              ))}
                            </div>
                          </div>
                        </div>
                        {isSelected && <span className="assignee-option__check">✓</span>}
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

