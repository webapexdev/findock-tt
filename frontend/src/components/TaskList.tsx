import { Task as TaskType } from '@/types/task';
import { Task } from '@/components/Task';
import styles from './TaskList.module.css';

type TaskListProps = {
  tasks: TaskType[];
  onEdit?: (task: TaskType) => void;
  onDelete?: (task: TaskType) => void;
};

export const TaskList = ({ tasks, onEdit, onDelete }: TaskListProps) => {
  if (!tasks.length) {
    return <p className={styles.emptyState}>No tasks found.</p>;
  }

  return (
    <div className={styles.list}>
      {tasks.map((task) => (
        <Task key={task.id} task={task} onEdit={onEdit} onDelete={onDelete} />
      ))}
    </div>
  );
};

