import { Link } from 'react-router-dom';
import { Task as TaskType } from '@/types/task';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/Button';
import { Avatar } from '@/components/Avatar';
import { Badge } from '@/components/Badge';
import { checkTaskPermission } from '@/utils/permissions';
import styles from './Task.module.css';

type TaskProps = {
  task: TaskType;
  onEdit?: (task: TaskType) => void;
  onDelete?: (task: TaskType) => void;
};

export const Task = ({ task, onEdit, onDelete }: TaskProps) => {
  const { user } = useAuth();

  const isAssignedToCurrentUser = (): boolean => {
    if (!user) return false;
    return task.assignees.some((assignee) => assignee.id === user.id);
  };

  const isMyTask = isAssignedToCurrentUser();

  // Check permissions
  const canEdit = checkTaskPermission(user, task, 'edit');
  const canDelete = checkTaskPermission(user, task, 'delete');

  return (
    <article
      key={task.id}
      className={`${styles.container} ${isMyTask ? styles.myTask : ''}`}
    >
      {isMyTask && (
        <div className={styles.badge} title="Assigned to you">
          You
        </div>
      )}
      <header className={styles.header}>
        <Link to={`/tasks/${task.id}`} className={styles.titleLink}>
          <h3>{task.title}</h3>
        </Link>
        <Badge
          label={task.status.replace('_', ' ')}
          variant={task.status as 'todo' | 'in_progress' | 'done'}
        />
      </header>
      {task.description && <p>{task.description}</p>}
      <dl className={styles.meta}>
        <div>
          <dt>Owner</dt>
          <dd className={styles.user}>
            <Avatar
              firstName={task.owner.firstName}
              lastName={task.owner.lastName}
              size="medium"
            />
            <span>
              {task.owner.firstName} {task.owner.lastName}
            </span>
          </dd>
        </div>
        <div>
          <dt>Assignees</dt>
          <dd>
            {task.assignees.length > 0 ? (
              <div className={styles.assignees}>
                {task.assignees.map((assignee) => (
                  <div key={assignee.id} className={styles.assignee}>
                    <Avatar
                      firstName={assignee.firstName}
                      lastName={assignee.lastName}
                      size="medium"
                      highlight={assignee.id === user?.id}
                    />
                    <span className={styles.assigneeName}>
                      {assignee.firstName} {assignee.lastName}
                    </span>
                    <div className={styles.assigneeRoles}>
                      {assignee.roles.map((role) => (
                        <Badge
                          key={role}
                          label={role}
                          variant={role as 'admin' | 'manager' | 'user'}
                          size="small"
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <span className={styles.empty}>—</span>
            )}
          </dd>
        </div>
      </dl>
      {((onEdit && canEdit) || (onDelete && canDelete)) && (
        <footer className={styles.actions}>
          {onEdit && canEdit && (
            <Button onClick={() => onEdit(task)}>Edit</Button>
          )}
          {onDelete && canDelete && (
            <Button variant="danger" onClick={() => onDelete(task)}>Delete</Button>
          )}
        </footer>
      )}
    </article>
  );
};
