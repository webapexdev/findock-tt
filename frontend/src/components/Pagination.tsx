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
      <div className="pagination">
        <div className="pagination__info">
          Showing {startItem}-{endItem} of {total} tasks
        </div>
      </div>
    );
  }

  return (
    <div className="pagination">
      <div className="pagination__info">
        Showing {startItem}-{endItem} of {total} tasks
      </div>
      <div className="pagination__controls">
        <button
          type="button"
          className="pagination__button"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          &laquo;
        </button>
        <div className="pagination__pages">
          {getPageNumbers().map((page, index) => {
            if (page === '...') {
              return (
                <span key={`ellipsis-${index}`} className="pagination__ellipsis">
                  ...
                </span>
              );
            }
            return (
              <button
                key={page}
                type="button"
                className={`pagination__page ${
                  page === currentPage ? 'pagination__page--active' : ''
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
          className="pagination__button"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          &raquo;
        </button>
      </div>
    </div>
  );
};

