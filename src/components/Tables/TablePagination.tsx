'use client';

import { TablePaginationProps } from '@/types/tablesTypes';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { JSX } from 'react';

export default function TablePagination({ currentPage, setCurrentPage, totalItems, rowsPerPage }: TablePaginationProps): JSX.Element {
  const totalPages = Math.ceil(totalItems / rowsPerPage);

  const getVisiblePages = (): (number | string)[] => {
    const pages: (number | string)[] = [];

    for (let i = 1; i <= Math.min(5, totalPages); i++) {
      pages.push(i);
    }

    if (totalPages > 5) {
      pages.push('...');
      pages.push(totalPages);
    }

    return pages;
  };

  return (
    <div className="flex justify-center items-center gap-2 mt-4">
      <button className="pagination-btn" disabled={currentPage === 1} onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}>
        <ChevronLeft className="size-6" />
      </button>

      {getVisiblePages().map((page, index) => (
        <button
          key={index}
          className={`px-3 pagination-btn ${currentPage === page ? 'pagination-btn-active' : ''}`}
          disabled={page === '...'}
          onClick={() => typeof page === 'number' && setCurrentPage(page)}
        >
          {page}
        </button>
      ))}

      <button
        className="pagination-btn"
        disabled={currentPage === totalPages}
        onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
      >
        <ChevronRight className="size-6" />
      </button>
    </div>
  );
}
