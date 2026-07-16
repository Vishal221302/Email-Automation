import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Button from './Button';

const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
  className = ''
}) => {
  if (totalPages <= 1) return null;

  return (
    <div className={`flex items-center justify-between px-4 py-3.5 bg-transparent border-t border-slate-100 dark:border-slate-800/60 ${className}`}>
      {/* Mobile view */}
      <div className="flex flex-1 justify-between sm:hidden">
        <Button
          variant="outline"
          size="sm"
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(currentPage + 1)}
        >
          Next
        </Button>
      </div>

      {/* Desktop view */}
      <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Showing Page <span className="font-semibold text-slate-700 dark:text-slate-200">{currentPage}</span> of{' '}
            <span className="font-semibold text-slate-700 dark:text-slate-200">{totalPages}</span>
          </p>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage === 1}
            onClick={() => onPageChange(currentPage - 1)}
            className="p-1.5"
            icon={ChevronLeft}
          />
          
          {Array.from({ length: totalPages }).map((_, index) => {
            const pageNum = index + 1;
            const isCurrent = pageNum === currentPage;
            return (
              <Button
                key={pageNum}
                variant={isCurrent ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => onPageChange(pageNum)}
                className={`w-8 h-8 p-0 rounded-md font-semibold text-xs ${
                  isCurrent ? 'bg-primary text-white' : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                {pageNum}
              </Button>
            );
          })}

          <Button
            variant="outline"
            size="sm"
            disabled={currentPage === totalPages}
            onClick={() => onPageChange(currentPage + 1)}
            className="p-1.5"
            icon={ChevronRight}
          />
        </div>
      </div>
    </div>
  );
};

export default Pagination;
