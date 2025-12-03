import { Comment as CommentType } from '@/api/comments';
import { Comment } from '@/components/Comment';
import styles from './CommentList.module.css';

type CommentListProps = {
  comments: CommentType[];
  taskId: string;
  onEdit?: (comment: CommentType) => void;
  onDelete?: (comment: CommentType) => void;
  onCommentAdded?: () => void;
};

export const CommentList = ({
  comments,
  taskId,
  onEdit,
  onDelete,
  onCommentAdded,
}: CommentListProps) => {
  if (comments.length === 0) {
    return (
      <div className={styles.emptyState}>
        <p>No comments yet. Be the first to comment!</p>
      </div>
    );
  }

  return (
    <div className={styles.commentList}>
      {comments.map((comment) => (
        <Comment
          key={comment.id}
          comment={comment}
          taskId={taskId}
          onEdit={onEdit}
          onDelete={onDelete}
          onCommentAdded={onCommentAdded}
        />
      ))}
    </div>
  );
};
