import { FormEvent, useEffect, useMemo, useState } from 'react';
import { TaskInput, TaskStatus } from '@/types/task';
import { AssigneeSelector } from '@/components/AssigneeSelector';
import { Button } from '@/components/Button';

type TaskFormProps = {
  initialValue?: TaskInput;
  onSubmit: (payload: TaskInput) => Promise<void>;
  submitLabel?: string;
  onError?: (errors: Record<string, string[]>) => void;
};

type FieldErrors = {
  [key: string]: string[];
};

const defaultTask: TaskInput = {
  title: '',
  description: '',
  status: 'todo',
  assigneeIds: [],
};

const statusOptions: TaskStatus[] = ['todo', 'in_progress', 'done'];

export const TaskForm = ({ initialValue, onSubmit, submitLabel = 'Create Task', onError }: TaskFormProps) => {
  const computedInitialValue = useMemo<TaskInput>(
    () => initialValue ?? { ...defaultTask },
    [initialValue],
  );

  const [form, setForm] = useState<TaskInput>(computedInitialValue);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setForm(computedInitialValue);
    setErrors({});
  }, [computedInitialValue]);

  const validateForm = (): boolean => {
    const newErrors: FieldErrors = {};

    if (!form.title.trim()) {
      newErrors.title = ['Title is required'];
    } else if (form.title.trim().length > 200) {
      newErrors.title = ['Title must not exceed 200 characters'];
    }

    if (form.description && form.description.length > 5000) {
      newErrors.description = ['Description must not exceed 5000 characters'];
    }

    if (form.assigneeIds && form.assigneeIds.length > 50) {
      newErrors.assigneeIds = ['Cannot assign more than 50 users to a task'];
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (key: keyof TaskInput, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[key];
        return newErrors;
      });
    }
  };

  const handleAssigneeChange = (assigneeIds: string[]) => {
    setForm((prev) => ({ ...prev, assigneeIds }));
    if (errors.assigneeIds) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.assigneeIds;
        return newErrors;
      });
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrors({});

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(form);
      if (!initialValue) {
        setForm({ ...defaultTask });
      }
    } catch (err: any) {
      if (err.errors) {
        setErrors(err.errors);
        if (onError) {
          onError(err.errors);
        }
      } else {
        const errorMessage = err.message || 'Failed to save task';
        setErrors({ _general: [errorMessage] });
        if (onError) {
          onError({ _general: [errorMessage] });
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className="task-form" onSubmit={handleSubmit}>
      {errors._general && errors._general.length > 0 && (
        <div className="form-error">{errors._general[0]}</div>
      )}
      <div className="form-group">
        <label htmlFor="task-title">Title</label>
        <input
          id="task-title"
          type="text"
          value={form.title}
          onChange={(event) => handleChange('title', event.target.value)}
          className={errors.title ? 'input-error' : ''}
          maxLength={200}
        />
        {errors.title && errors.title.length > 0 && (
          <div className="field-error">{errors.title[0]}</div>
        )}
        {form.title.length > 0 && (
          <div className="field-hint">{form.title.length}/200 characters</div>
        )}
      </div>
      <div className="form-group">
        <label htmlFor="task-description">Description</label>
        <textarea
          id="task-description"
          value={form.description || ''}
          onChange={(event) => handleChange('description', event.target.value)}
          className={errors.description ? 'input-error' : ''}
          maxLength={5000}
        />
        {errors.description && errors.description.length > 0 && (
          <div className="field-error">{errors.description[0]}</div>
        )}
        {form.description && form.description.length > 0 && (
          <div className="field-hint">{form.description.length}/5000 characters</div>
        )}
      </div>
      <div className="form-group">
        <label htmlFor="task-status">Status</label>
        <select
          id="task-status"
          value={form.status || 'todo'}
          onChange={(event) => handleChange('status', event.target.value)}
        >
          {statusOptions.map((status) => (
            <option key={status} value={status}>
              {status.replace('_', ' ')}
            </option>
          ))}
        </select>
      </div>
      <div className="form-group">
        <AssigneeSelector
          selectedIds={form.assigneeIds || []}
          onChange={handleAssigneeChange}
          variant="full"
        />
        {errors.assigneeIds && errors.assigneeIds.length > 0 && (
          <div className="field-error">{errors.assigneeIds[0]}</div>
        )}
      </div>
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Saving...' : submitLabel}
      </Button>
    </form>
  );
};
