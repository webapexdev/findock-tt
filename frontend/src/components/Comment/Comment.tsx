import { Comment as CommentType } from '@/api/comments';
import { useAuth } from '@/hooks/useAuth';
import { formatDate } from '@/utils/date';
import { Avatar } from '@/components/Avatar';
import { Button } from '@/components/Button';
import { EditIcon, DeleteIcon } from './Icons';
import styles from './Comment.module.css';

type CommentProps = {
  comment: CommentType;
  onEdit?: (comment: CommentType) => void;
  onDelete?: (comment: CommentType) => void;
};

export const Comment = ({ comment, onEdit, onDelete }: CommentProps) => {
  const { user } = useAuth();

  const isAuthor = user?.id === comment.author.id;

  return (
    <div className={styles.comment}>
      <div className={styles.commentHeader}>
        <div className={styles.commentAuthor}>
          <Avatar
            firstName={comment.author.firstName}
            lastName={comment.author.lastName}
            size="small"
          />
          <div className={styles.authorInfo}>
            <span className={styles.authorName}>
              {comment.author.firstName} {comment.author.lastName}
            </span>
            <span className={styles.commentDate}>{formatDate(comment.createdAt)}</span>
          </div>
        </div>
        {isAuthor && (onEdit || onDelete) && (
          <div className={styles.commentActions}>
            {onEdit && (
              <Button
                variant="secondary"
                onClick={() => onEdit(comment)}
                className={styles.actionButton}
                title="Edit comment"
                aria-label="Edit comment"
              >
                <EditIcon />
              </Button>
            )}
            {onDelete && (
              <Button
                variant="danger"
                onClick={() => onDelete(comment)}
                className={styles.actionButton}
                title="Delete comment"
                aria-label="Delete comment"
              >
                <DeleteIcon />
              </Button>
            )}
          </div>
        )}
      </div>
      <div className={styles.commentContent}>{comment.content}</div>
      {comment.updatedAt !== comment.createdAt && (
        <div className={styles.editedBadge}>(edited)</div>
      )}
    </div>
  );
};

