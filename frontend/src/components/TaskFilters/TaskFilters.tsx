import { useState, useEffect, useRef } from 'react';
import { TaskStatus } from '@/types/task';
import { Button } from '@/components/Button';
import { useDebounce } from '@/hooks/useDebounce';
import styles from './TaskFilters.module.css';

type TaskFiltersProps = {
  search: string;
  statusFilters: TaskStatus[];
  myTasks: boolean;
  sortBy: 'createdAt' | 'updatedAt' | 'title' | 'status';
  sortOrder: 'ASC' | 'DESC';
  onSearchChange: (value: string) => void;
  onStatusToggle: (status: TaskStatus) => void;
  onMyTasksToggle: () => void;
  onSortChange: (sortBy: 'createdAt' | 'updatedAt' | 'title' | 'status') => void;
  onSortOrderToggle: () => void;
  onClear: () => void;
};

const statusOptions: TaskStatus[] = ['todo', 'in_progress', 'done'];
const sortOptions: Array<{ value: 'createdAt' | 'updatedAt' | 'title' | 'status'; label: string }> = [
  { value: 'createdAt', label: 'Date Created' },
  { value: 'updatedAt', label: 'Date Updated' },
  { value: 'title', label: 'Title' },
  { value: 'status', label: 'Status' },
];

const DEBOUNCE_DELAY = 700;

export const TaskFilters = ({
  search,
  statusFilters,
  myTasks,
  sortBy,
  sortOrder,
  onSearchChange,
  onStatusToggle,
  onMyTasksToggle,
  onSortChange,
  onSortOrderToggle,
  onClear,
}: TaskFiltersProps) => {
  const [localSearch, setLocalSearch] = useState(search);
  const debouncedSearch = useDebounce(localSearch, DEBOUNCE_DELAY);
  const isInitialMount = useRef(true);
  const lastDebouncedValue = useRef(debouncedSearch);

  // Update local search when prop changes (e.g., from URL or clear)
  useEffect(() => {
    if (search !== localSearch) {
      setLocalSearch(search);
      lastDebouncedValue.current = search;
    }
  }, [search]);

  // Call onSearchChange when debounced value changes (only if different from last debounced value)
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    if (debouncedSearch !== lastDebouncedValue.current) {
      lastDebouncedValue.current = debouncedSearch;
      onSearchChange(debouncedSearch);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  return (
    <div className={styles.container}>
      <div className={styles.row}>
        <div className={styles.search}>
          <input
            id="task-search"
            type="text"
            placeholder="Search by title or description..."
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            className={styles.input}
          />
        </div>
        <div className={styles.myTasks}>
          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={myTasks}
              onChange={onMyTasksToggle}
              className={styles.checkbox}
            />
            <span>My Tasks</span>
          </label>
        </div>
      </div>
      <div className={styles.row}>
        <div className={styles.status}>
          <label>Status</label>
          <div className={styles.statusCheckboxes}>
            {statusOptions.map((status) => (
              <label key={status} className={styles.statusCheckboxLabel}>
                <input
                  type="checkbox"
                  checked={statusFilters.includes(status)}
                  onChange={() => onStatusToggle(status)}
                  className={styles.statusCheckbox}
                />
                <span className={styles.statusLabelText}>
                  {status.replace('_', ' ')}
                </span>
              </label>
            ))}
          </div>
        </div>
        <div className={styles.sort}>
          <label htmlFor="task-sort" className={styles.sortLabel}>Sort By</label>
          <div className={styles.sortControls}>
            <select
              id="task-sort"
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value as 'createdAt' | 'updatedAt' | 'title' | 'status')}
              className={styles.select}
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={onSortOrderToggle}
              className={styles.sortOrder}
              title={`Sort ${sortOrder === 'ASC' ? 'Ascending' : 'Descending'}`}
            >
              {sortOrder === 'ASC' ? '↑' : '↓'}
            </button>
          </div>
        </div>
        <div className={styles.clear}>
          <Button onClick={onClear} variant="default">Clear Filters</Button>
        </div>
      </div>
    </div>
  );
};
