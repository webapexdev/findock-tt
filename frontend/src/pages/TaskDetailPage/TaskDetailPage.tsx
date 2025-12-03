import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchTaskById } from '@/api/tasks';
import { fetchComments, createComment, updateComment, deleteComment, Comment } from '@/api/comments';
import { markNotificationsAsReadByTask } from '@/api/notifications';
import { useAuth } from '@/hooks/useAuth';
import { formatDate } from '@/utils/date';
import { Avatar } from '@/components/Avatar';
import { Badge } from '@/components/Badge';
import { Button } from '@/components/Button';
import { CommentForm } from '@/components/CommentForm';
import { CommentList } from '@/components/CommentList';
import styles from './TaskDetailPage.module.css';

export const TaskDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [editingComment, setEditingComment] = useState<Comment | null>(null);

  const { data: task, isLoading: taskLoading, error: taskError } = useQuery({
    queryKey: ['task', id],
    queryFn: () => fetchTaskById(id!),
    enabled: !!id,
  });

  const commentsQuery = useQuery({
    queryKey: ['comments', id],
    queryFn: () => fetchComments(id!),
    enabled: !!id,
  });

  const comments = commentsQuery.data || [];
  const commentsLoading = commentsQuery.isLoading;

  useEffect(() => {
    if (task && id) {
      markNotificationsAsReadByTask(id)
        .then(() => {
          queryClient.invalidateQueries({ queryKey: ['notifications'] });
          queryClient.invalidateQueries({ queryKey: ['notifications', 'unread-count'] });
        })
        .catch((error) => {
          console.error('Failed to mark notifications as read:', error);
        });
    }
  }, [task, id, queryClient]);

  const createMutation = useMutation({
    mutationFn: (payload: { content: string }) => createComment(id!, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', id] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ commentId, payload }: { commentId: string; payload: { content: string } }) =>
      updateComment(id!, commentId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', id] });
      setEditingComment(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (commentId: string) => deleteComment(id!, commentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', id] });
    },
  });

  const handleCreateComment = async (payload: { content: string }) => {
    await createMutation.mutateAsync(payload);
  };

  const handleUpdateComment = async (payload: { content: string }) => {
    if (!editingComment) return;
    await updateMutation.mutateAsync({ commentId: editingComment.id, payload });
  };

  const handleDeleteComment = async (comment: Comment) => {
    if (window.confirm('Are you sure you want to delete this comment?')) {
      await deleteMutation.mutateAsync(comment.id);
    }
  };

  if (taskLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Loading task...</div>
      </div>
    );
  }

  if (taskError || !task) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>
          <p>Task not found or failed to load.</p>
          <Button onClick={() => navigate('/tasks')}>Back to Tasks</Button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Link to="/tasks" className={styles.backLink}>
          ← Back to Tasks
        </Link>
        <h1 className={styles.title}>{task.title}</h1>
      </div>

      <div className={styles.content}>
        <div className={styles.mainSection}>
          <div className={styles.taskInfo}>
            <div className={styles.statusSection}>
              <Badge
                label={task.status.replace('_', ' ')}
                variant={task.status as 'todo' | 'in_progress' | 'done'}
              />
            </div>

            {task.description && (
              <div className={styles.descriptionSection}>
                <h2 className={styles.sectionTitle}>Description</h2>
                <p className={styles.description}>{task.description}</p>
              </div>
            )}

            <div className={styles.metaSection}>
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>Owner:</span>
                <div className={styles.userInfo}>
                  <Avatar
                    firstName={task.owner.firstName}
                    lastName={task.owner.lastName}
                    size="medium"
                  />
                  <span>
                    {task.owner.firstName} {task.owner.lastName}
                  </span>
                </div>
              </div>

              {task.assignees.length > 0 && (
                <div className={styles.metaItem}>
                  <span className={styles.metaLabel}>Assignees:</span>
                  <div className={styles.assigneesList}>
                    {task.assignees.map((assignee) => (
                      <div key={assignee.id} className={styles.userInfo}>
                        <Avatar
                          firstName={assignee.firstName}
                          lastName={assignee.lastName}
                          size="medium"
                          highlight={assignee.id === user?.id}
                        />
                        <span>
                          {assignee.firstName} {assignee.lastName}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>Created:</span>
                <span className={styles.metaValue}>{formatDate(task.createdAt, { month: 'long' })}</span>
              </div>

              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>Last Updated:</span>
                <span className={styles.metaValue}>{formatDate(task.updatedAt, { month: 'long' })}</span>
              </div>

              {task.attachments && task.attachments.length > 0 && (
                <div className={styles.metaItem}>
                  <span className={styles.metaLabel}>Attachments:</span>
                  <div className={styles.attachmentsList}>
                    {task.attachments.map((attachment) => (
                      <a
                        key={attachment.id}
                        href={`/api/uploads/${attachment.filename}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.attachmentLink}
                      >
                        {attachment.filename}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className={styles.commentsSection}>
            <h2 className={styles.sectionTitle}>Comments</h2>
            {editingComment ? (
              <CommentForm
                onSubmit={handleUpdateComment}
                initialValue={editingComment.content}
                submitLabel="Update Comment"
                onCancel={() => setEditingComment(null)}
              />
            ) : (
              <CommentForm onSubmit={handleCreateComment} />
            )}

            {commentsLoading ? (
              <div className={styles.loading}>Loading comments...</div>
            ) : (
              <CommentList
                comments={comments}
                taskId={id!}
                onEdit={setEditingComment}
                onDelete={handleDeleteComment}
                onCommentAdded={() => {
                  commentsQuery.refetch();
                }}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

