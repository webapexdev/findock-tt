import { FormEvent, useState, useEffect } from 'react';
import { CommentInput } from '@/api/comments';
import { Button } from '@/components/Button';
import styles from './CommentForm.module.css';

type CommentFormProps = {
  onSubmit: (payload: CommentInput) => Promise<void>;
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
  const [error, setError] = useState<string | null>(null);
  const [fieldError, setFieldError] = useState<string | null>(null);

  useEffect(() => {
    setContent(initialValue);
    setError(null);
    setFieldError(null);
  }, [initialValue]);

  const validateForm = (): boolean => {
    if (!content.trim()) {
      setFieldError('Comment content is required');
      return false;
    }
    if (content.trim().length > 2000) {
      setFieldError('Comment must not exceed 2000 characters');
      return false;
    }
    setFieldError(null);
    return true;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setFieldError(null);

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({ content: content.trim() });
      setContent('');
      setError(null);
      setFieldError(null);
    } catch (err: any) {
      if (err.errors?.content) {
        setFieldError(err.errors.content[0]);
      } else {
        setError(err.message || 'Failed to submit comment');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.commentForm}>
      {error && <div className="form-error">{error}</div>}
      <textarea
        value={content}
        onChange={(e) => {
          setContent(e.target.value);
          if (fieldError) {
            setFieldError(null);
          }
        }}
        placeholder="Write a comment..."
        className={`${styles.textarea} ${fieldError ? 'input-error' : ''}`}
        rows={3}
        required
        maxLength={2000}
      />
      {fieldError && <div className="field-error">{fieldError}</div>}
      {content.length > 0 && (
        <div className="field-hint" style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.25rem' }}>
          {content.length}/2000 characters
        </div>
      )}
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
