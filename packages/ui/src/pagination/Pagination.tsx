import type { ReactNode } from 'react';
import { Button } from '../button/Button';
import styles from './Pagination.module.scss';

type PaginationTheme = {
  size?: string;
  background?: string;
  textColor?: string;
  borderColor?: string;
  hoverBackground?: string;
  hoverTextColor?: string;
  hoverBorderColor?: string;
  round?: string;
  padding?: string;
};

type PaginationProps = {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  groupSize?: number;
  className?: string;
  previousLabel?: ReactNode;
  nextLabel?: ReactNode;
  buttonTheme?: PaginationTheme;
  activeButtonTheme?: PaginationTheme;
  disabledButtonTheme?: PaginationTheme;
};

const DEFAULT_BUTTON_THEME: Required<PaginationTheme> = {
  size: '14px',
  background: '#ffffff',
  textColor: '#1f2937',
  borderColor: '#d1d5db',
  hoverBackground: '#f3f4f6',
  hoverTextColor: '#111827',
  hoverBorderColor: '#9ca3af',
  round: '8px',
  padding: '6px 10px',
};

const DEFAULT_ACTIVE_THEME: Required<PaginationTheme> = {
  ...DEFAULT_BUTTON_THEME,
  background: '#2563eb',
  textColor: '#ffffff',
  borderColor: '#2563eb',
  hoverBackground: '#1d4ed8',
  hoverTextColor: '#ffffff',
  hoverBorderColor: '#1d4ed8',
};

const DEFAULT_DISABLED_THEME: Required<PaginationTheme> = {
  ...DEFAULT_BUTTON_THEME,
  textColor: '#9ca3af',
  hoverTextColor: '#9ca3af',
};

function mergeTheme(base: Required<PaginationTheme>, override?: PaginationTheme): Required<PaginationTheme> {
  return {
    size: override?.size ?? base.size,
    background: override?.background ?? base.background,
    textColor: override?.textColor ?? base.textColor,
    borderColor: override?.borderColor ?? base.borderColor,
    hoverBackground: override?.hoverBackground ?? base.hoverBackground,
    hoverTextColor: override?.hoverTextColor ?? base.hoverTextColor,
    hoverBorderColor: override?.hoverBorderColor ?? base.hoverBorderColor,
    round: override?.round ?? base.round,
    padding: override?.padding ?? base.padding,
  };
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  groupSize = 5,
  className = '',
  previousLabel = '이전',
  nextLabel = '다음',
  buttonTheme,
  activeButtonTheme,
  disabledButtonTheme,
}: PaginationProps) {
  const resolvedButtonTheme = mergeTheme(DEFAULT_BUTTON_THEME, buttonTheme);
  const resolvedActiveTheme = mergeTheme(DEFAULT_ACTIVE_THEME, activeButtonTheme);
  const resolvedDisabledTheme = mergeTheme(DEFAULT_DISABLED_THEME, disabledButtonTheme);
  const safeTotalPages = Math.max(1, totalPages);
  const safeCurrentPage = Math.min(Math.max(1, currentPage), safeTotalPages);
  const pageGroupStart = Math.floor((safeCurrentPage - 1) / groupSize) * groupSize + 1;
  const pageGroupEnd = Math.min(pageGroupStart + groupSize - 1, safeTotalPages);
  const pageNumbers = Array.from({ length: pageGroupEnd - pageGroupStart + 1 }, (_, index) => pageGroupStart + index);
  const mergedClassName = [styles.container, className].filter(Boolean).join(' ');

  return (
    <div className={mergedClassName}>
      <Button
        type='button'
        onClick={() => onPageChange(Math.max(1, safeCurrentPage - 1))}
        disabled={safeCurrentPage === 1}
        size={safeCurrentPage === 1 ? resolvedDisabledTheme.size : resolvedButtonTheme.size}
        background={safeCurrentPage === 1 ? resolvedDisabledTheme.background : resolvedButtonTheme.background}
        textColor={safeCurrentPage === 1 ? resolvedDisabledTheme.textColor : resolvedButtonTheme.textColor}
        borderColor={safeCurrentPage === 1 ? resolvedDisabledTheme.borderColor : resolvedButtonTheme.borderColor}
        hoverBackground={safeCurrentPage === 1 ? resolvedDisabledTheme.hoverBackground : resolvedButtonTheme.hoverBackground}
        hoverTextColor={safeCurrentPage === 1 ? resolvedDisabledTheme.hoverTextColor : resolvedButtonTheme.hoverTextColor}
        hoverBorderColor={safeCurrentPage === 1 ? resolvedDisabledTheme.hoverBorderColor : resolvedButtonTheme.hoverBorderColor}
        round={resolvedButtonTheme.round}
        padding={resolvedButtonTheme.padding}
      >
        {previousLabel}
      </Button>

      {pageNumbers.map((pageNumber) => {
        const theme = pageNumber === safeCurrentPage ? resolvedActiveTheme : resolvedButtonTheme;

        return (
          <Button
            key={pageNumber}
            type='button'
            onClick={() => onPageChange(pageNumber)}
            size={theme.size}
            background={theme.background}
            textColor={theme.textColor}
            borderColor={theme.borderColor}
            hoverBackground={theme.hoverBackground}
            hoverTextColor={theme.hoverTextColor}
            hoverBorderColor={theme.hoverBorderColor}
            round={theme.round}
            padding={theme.padding}
          >
            {pageNumber}
          </Button>
        );
      })}

      <Button
        type='button'
        onClick={() => onPageChange(Math.min(safeTotalPages, safeCurrentPage + 1))}
        disabled={safeCurrentPage === safeTotalPages}
        size={safeCurrentPage === safeTotalPages ? resolvedDisabledTheme.size : resolvedButtonTheme.size}
        background={safeCurrentPage === safeTotalPages ? resolvedDisabledTheme.background : resolvedButtonTheme.background}
        textColor={safeCurrentPage === safeTotalPages ? resolvedDisabledTheme.textColor : resolvedButtonTheme.textColor}
        borderColor={safeCurrentPage === safeTotalPages ? resolvedDisabledTheme.borderColor : resolvedButtonTheme.borderColor}
        hoverBackground={safeCurrentPage === safeTotalPages ? resolvedDisabledTheme.hoverBackground : resolvedButtonTheme.hoverBackground}
        hoverTextColor={safeCurrentPage === safeTotalPages ? resolvedDisabledTheme.hoverTextColor : resolvedButtonTheme.hoverTextColor}
        hoverBorderColor={safeCurrentPage === safeTotalPages ? resolvedDisabledTheme.hoverBorderColor : resolvedButtonTheme.hoverBorderColor}
        round={resolvedButtonTheme.round}
        padding={resolvedButtonTheme.padding}
      >
        {nextLabel}
      </Button>
    </div>
  );
}
