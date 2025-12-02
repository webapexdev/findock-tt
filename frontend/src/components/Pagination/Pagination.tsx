import styles from './Pagination.module.css';

type PaginationProps = {
  currentPage: number;
  totalPages: number;
  total: number;
  limit: number;
  onPageChange: (page: number) => void;
};

export const Pagination = ({
  currentPage,
  totalPages,
  total,
  limit,
  onPageChange,
}: PaginationProps) => {
  const startItem = total === 0 ? 0 : (currentPage - 1) * limit + 1;
  const endItem = Math.min(currentPage * limit, total);

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      }
    }

    return pages;
  };

  if (totalPages <= 1) {
    return (
      <div className={styles.container}>
        <div className={styles.info}>
          Showing {startItem}-{endItem} of {total} tasks
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.info}>
        Showing {startItem}-{endItem} of {total} tasks
      </div>
      <div className={styles.controls}>
        <button
          type="button"
          className={styles.button}
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          &laquo;
        </button>
        <div className={styles.pages}>
          {getPageNumbers().map((page, index) => {
            if (page === '...') {
              return (
                <span key={`ellipsis-${index}`} className={styles.ellipsis}>
                  ...
                </span>
              );
            }
            return (
              <button
                key={page}
                type="button"
                className={`${styles.page} ${
                  page === currentPage ? styles.pageActive : ''
                }`}
                onClick={() => onPageChange(page as number)}
              >
                {page}
              </button>
            );
          })}
        </div>
        <button
          type="button"
          className={styles.button}
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          &raquo;
        </button>
      </div>
    </div>
  );
};
