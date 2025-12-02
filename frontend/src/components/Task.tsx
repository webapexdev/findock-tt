import { Task as TaskType } from '../types/task';
import { useAuth } from '../hooks/useAuth';
import { Button } from './Button';
import { Avatar } from './Avatar';
import { Badge } from './Badge';
import { checkTaskPermission } from '../utils/permissions';

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
      className={`task-card ${isMyTask ? 'task-card--my-task' : ''}`}
    >
      {isMyTask && (
        <div className="task-card__badge" title="Assigned to you">
          You
        </div>
      )}
      <header className="task-card__header">
        <h3>{task.title}</h3>
        <Badge
          label={task.status.replace('_', ' ')}
          variant={task.status as 'todo' | 'in_progress' | 'done'}
        />
      </header>
      {task.description && <p>{task.description}</p>}
      <dl className="task-card__meta">
        <div>
          <dt>Owner</dt>
          <dd className="task-card__user">
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
              <div className="task-card__assignees">
                {task.assignees.map((assignee) => (
                  <div key={assignee.id} className="task-card__assignee">
                    <Avatar
                      firstName={assignee.firstName}
                      lastName={assignee.lastName}
                      size="medium"
                      highlight={assignee.id === user?.id}
                    />
                    <span className="task-card__assignee-name">
                      {assignee.firstName} {assignee.lastName}
                    </span>
                    <div className="task-card__assignee-roles">
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
              <span className="task-card__empty">—</span>
            )}
          </dd>
        </div>
      </dl>
      {((onEdit && canEdit) || (onDelete && canDelete)) && (
        <footer className="task-card__actions">
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

