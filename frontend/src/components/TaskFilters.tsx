import { TaskStatus } from '../types/task';
import { Button } from './Button';

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
  return (
    <div className="task-filters">
      <div className="task-filters__row">
        <div className="task-filters__search">
          <input
            id="task-search"
            type="text"
            placeholder="Search by title or description..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="task-filters__input"
          />
        </div>
        <div className="task-filters__my-tasks">
          <label className="task-filters__checkbox-label">
            <input
              type="checkbox"
              checked={myTasks}
              onChange={onMyTasksToggle}
              className="task-filters__checkbox"
            />
            <span>My Tasks</span>
          </label>
        </div>
      </div>
      <div className="task-filters__row">
        <div className="task-filters__status">
          <label>Status</label>
          <div className="task-filters__status-checkboxes">
            {statusOptions.map((status) => (
              <label key={status} className="task-filters__status-checkbox-label">
                <input
                  type="checkbox"
                  checked={statusFilters.includes(status)}
                  onChange={() => onStatusToggle(status)}
                  className="task-filters__status-checkbox"
                />
                <span className="task-filters__status-label-text">
                  {status.replace('_', ' ')}
                </span>
              </label>
            ))}
          </div>
        </div>
        <div className="task-filters__sort">
          <label htmlFor="task-sort" className="task-filters__sort-label">Sort By</label>
          <div className="task-filters__sort-controls">
            <select
              id="task-sort"
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value as 'createdAt' | 'updatedAt' | 'title' | 'status')}
              className="task-filters__select"
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
              className="task-filters__sort-order"
              title={`Sort ${sortOrder === 'ASC' ? 'Ascending' : 'Descending'}`}
            >
              {sortOrder === 'ASC' ? '↑' : '↓'}
            </button>
          </div>
        </div>
        <div className="task-filters__clear">
          <Button onClick={onClear} variant="default">Clear Filters</Button>
        </div>
      </div>
    </div>
  );
};

