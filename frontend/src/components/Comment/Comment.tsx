import { useState } from 'react';
import { Comment as CommentType } from '@/api/comments';
import { useAuth } from '@/hooks/useAuth';
import { formatDate } from '@/utils/date';
import { Avatar } from '@/components/Avatar';
import { Button } from '@/components/Button';
import { CommentForm } from '@/components/CommentForm';
import { createComment } from '@/api/comments';
import { EditIcon, DeleteIcon, ReplyIcon } from './Icons';
import styles from './Comment.module.css';

type CommentProps = {
  comment: CommentType;
  taskId: string;
  onEdit?: (comment: CommentType) => void;
  onDelete?: (comment: CommentType) => void;
  onCommentAdded?: () => void;
  depth?: number;
};

export const Comment = ({
  comment,
  taskId,
  onEdit,
  onDelete,
  onCommentAdded,
  depth = 0,
}: CommentProps) => {
  const { user } = useAuth();
  const [showMentionForm, setShowMentionForm] = useState(false);

  const isAuthor = user?.id === comment.author.id;
  const maxDepth = 10; // Prevent infinite nesting
  const canReply = depth < maxDepth;

  const handleMention = async (payload: { content: string }) => {
    try {
      await createComment(taskId, {
        content: payload.content,
        parentId: comment.id,
      });
      setShowMentionForm(false);
      if (onCommentAdded) {
        onCommentAdded();
      }
    } catch (error) {
      console.error('Failed to create mention:', error);
    }
  };

  return (
    <div className={styles.comment} style={{ marginLeft: depth > 0 ? `${depth * 24}px` : '0' }}>
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
        <div className={styles.commentActions}>
          {canReply && (
            <Button
              variant="secondary"
              onClick={() => setShowMentionForm(!showMentionForm)}
              className={styles.actionButton}
              title={showMentionForm ? 'Cancel mention' : 'Mention'}
              aria-label={showMentionForm ? 'Cancel mention' : 'Mention this comment'}
            >
              {showMentionForm ? 'Cancel' : <ReplyIcon />}
            </Button>
          )}
          {isAuthor && onEdit && (
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
          {isAuthor && onDelete && (
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
      </div>
      <div className={styles.commentContent}>{comment.content}</div>
      {comment.updatedAt !== comment.createdAt && (
        <div className={styles.editedBadge}>(edited)</div>
      )}

      {showMentionForm && canReply && (
        <div className={styles.mentionForm}>
          <CommentForm
            onSubmit={handleMention}
            submitLabel="Post Mention"
            onCancel={() => setShowMentionForm(false)}
          />
        </div>
      )}

      {comment.replies && comment.replies.length > 0 && (
        <div className={styles.replies}>
          {comment.replies.map((reply) => (
            <Comment
              key={reply.id}
              comment={reply}
              taskId={taskId}
              onEdit={onEdit}
              onDelete={onDelete}
              onCommentAdded={onCommentAdded}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};
