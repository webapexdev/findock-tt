import { FormEvent, useState, useEffect } from 'react';
import { CommentInput } from '@/api/comments';
import { Button } from '@/components/Button';
import styles from './CommentForm.module.css';

type CommentFormProps = {
  onSubmit: (payload: CommentInput) => void;
  initialValue?: string;
  submitLabel?: string;
  onCancel?: () => void;
};

export const CommentForm = ({
  onSubmit,
  initialValue = '',
  submitLabel = 'Add Comment',
  onCancel,
}: CommentFormProps) => {
  const [content, setContent] = useState(initialValue);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setContent(initialValue);
  }, [initialValue]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!content.trim()) return;

    setIsSubmitting(true);
    try {
      await onSubmit({ content: content.trim() });
      setContent('');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.commentForm}>
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Write a comment..."
        className={styles.textarea}
        rows={3}
        required
      />
      <div className={styles.actions}>
        {onCancel && (
          <Button type="button" onClick={onCancel} variant="secondary">
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={isSubmitting || !content.trim()}>
          {isSubmitting ? 'Submitting...' : submitLabel}
        </Button>
      </div>
    </form>
  );
};

