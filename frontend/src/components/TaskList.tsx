import { useMemo } from 'react';
import { Task as TaskType } from '../types/task';
import { Task } from './Task';

type TaskListProps = {
  tasks: TaskType[];
  onEdit?: (task: TaskType) => void;
  onDelete?: (task: TaskType) => void;
  filterByAssigneeId?: string;
};

export const TaskList = ({ tasks, onEdit, onDelete, filterByAssigneeId }: TaskListProps) => {
  const filteredTasks = useMemo(() => {
    if (!filterByAssigneeId) return tasks;
    return tasks.filter((task) =>
      task.assignees.some((assignee) => assignee.id === filterByAssigneeId)
    );
  }, [tasks, filterByAssigneeId]);

  if (!filteredTasks.length) {
    return <p className="empty-state">No tasks found.</p>;
  }

  return (
    <div className="task-list">
      {filteredTasks.map((task) => (
        <Task key={task.id} task={task} onEdit={onEdit} onDelete={onDelete} />
      ))}
    </div>
  );
};

