import { Task as TaskType } from '../types/task';
import { Task } from './Task';

type TaskListProps = {
  tasks: TaskType[];
  onEdit?: (task: TaskType) => void;
  onDelete?: (task: TaskType) => void;
};

export const TaskList = ({ tasks, onEdit, onDelete }: TaskListProps) => {
  if (!tasks.length) {
    return <p className="empty-state">No tasks found.</p>;
  }

  return (
    <div className="task-list">
      {tasks.map((task) => (
        <Task key={task.id} task={task} onEdit={onEdit} onDelete={onDelete} />
      ))}
    </div>
  );
};

