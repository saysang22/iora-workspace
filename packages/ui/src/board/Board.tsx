import { useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { Button } from '../button/Button';
import { Pagination } from '../pagination/Pagination';
import { Table } from '../table/Table';
import { BoardDetail } from './BoardDetail';
import { BoardWrite } from './BoardWrite';
import styles from './Board.module.scss';

type BoardColumn = {
  key: string;
  header: ReactNode;
  align?: 'left' | 'center' | 'right';
};

type BoardRow = Record<string, ReactNode | null | undefined>;

export type BoardPost = {
  id: number;
  title: string;
  author: string;
  createdAt: string;
  views: number;
  content: string;
  attachments?: string[];
};

export type BoardComment = {
  id: number;
  postId: number;
  author: string;
  text: string;
  parentId?: number;
};

type BoardProps = {
  title?: string;
  initialItems?: BoardPost[];
  pageSize?: number;
  thColor?: string;
  thBackground?: string;
  tdColor?: string;
  tdBackground?: string;
  borderColor?: string;
  className?: string;
  headerClassName?: string;
  titleClassName?: string;
  actionClassName?: string;
  toolbarClassName?: string;
  paginationClassName?: string;
  tableClassName?: string;
  hideWriteButton?: boolean;
  headerActions?: ReactNode;
  toolbar?: ReactNode;
  listColumns?: BoardColumn[];
  listRows?: BoardRow[];
  listRowKeyField?: string;
  onListRowClick?: (row: BoardRow, rowIndex: number) => void;
  paginationButtonTheme?: {
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
  paginationActiveButtonTheme?: {
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
  paginationDisabledButtonTheme?: {
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
};

const DEFAULT_COLUMNS = [
  { key: 'no', header: '번호', align: 'center' as const },
  { key: 'title', header: '제목' },
  { key: 'author', header: '작성자', align: 'center' as const },
  { key: 'createdAt', header: '작성일', align: 'center' as const },
  { key: 'views', header: '조회수', align: 'center' as const },
];

function joinClassNames(...classNames: Array<string | undefined>) {
  return classNames.filter(Boolean).join(' ');
}

export function Board({
  title = '게시판',
  initialItems = [],
  pageSize = 10,
  thColor,
  thBackground,
  tdColor,
  tdBackground,
  borderColor,
  className,
  headerClassName,
  titleClassName,
  actionClassName,
  toolbarClassName,
  paginationClassName,
  tableClassName,
  hideWriteButton = false,
  headerActions,
  toolbar,
  listColumns,
  listRows,
  listRowKeyField,
  onListRowClick,
  paginationButtonTheme,
  paginationActiveButtonTheme,
  paginationDisabledButtonTheme,
}: BoardProps) {
  const isCustomListMode = Boolean(listColumns?.length && listRows);
  const [posts, setPosts] = useState<BoardPost[]>(initialItems);
  const [comments, setComments] = useState<BoardComment[]>([]);
  const [page, setPage] = useState(1);
  const [mode, setMode] = useState<'list' | 'write' | 'detail'>('list');
  const [selectedPostId, setSelectedPostId] = useState<number | null>(null);
  const [editingPostId, setEditingPostId] = useState<number | null>(null);

  const customRows = listRows ?? [];
  const customColumns = listColumns ?? [];
  const totalCount = isCustomListMode ? customRows.length : posts.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const currentPage = Math.min(page, totalPages);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;

  const pagedPosts = useMemo(() => posts.slice(startIndex, endIndex), [posts, startIndex, endIndex]);
  const pagedCustomRows = useMemo(
    () => customRows.slice(startIndex, endIndex),
    [customRows, startIndex, endIndex],
  );

  const rows = pagedPosts.map((item, index) => ({
    __rowId: String(item.id),
    no: posts.length - startIndex - index,
    title: item.title,
    author: item.author,
    createdAt: item.createdAt,
    views: item.views,
  }));

  const selectedPost = selectedPostId ? posts.find((post) => post.id === selectedPostId) ?? null : null;
  const selectedPostComments = selectedPost ? comments.filter((comment) => comment.postId === selectedPost.id) : [];

  const handleWriteSubmit = (values: { title: string; content: string; attachments: string[] }) => {
    if (editingPostId) {
      setPosts((prev) =>
        prev.map((post) =>
          post.id === editingPostId
            ? { ...post, title: values.title, content: values.content, attachments: values.attachments }
            : post,
        ),
      );
      setEditingPostId(null);
      setMode('detail');
      return;
    }

    const newPost: BoardPost = {
      id: Date.now(),
      title: values.title,
      content: values.content,
      author: '작성자',
      createdAt: new Date().toISOString().slice(0, 10),
      views: 0,
      attachments: values.attachments,
    };

    setPosts((prev) => [newPost, ...prev]);
    setPage(1);
    setMode('list');
  };

  const handleSelectPost = (post: BoardPost) => {
    setPosts((prev) => prev.map((item) => (item.id === post.id ? { ...item, views: item.views + 1 } : item)));
    setSelectedPostId(post.id);
    setMode('detail');
  };

  const handleAddComment = (text: string) => {
    if (!selectedPost) {
      return;
    }

    const newComment: BoardComment = {
      id: Date.now(),
      postId: selectedPost.id,
      author: '사용자',
      text,
    };

    setComments((prev) => [...prev, newComment]);
  };

  const handleAddReply = (parentId: number, text: string) => {
    if (!selectedPost) {
      return;
    }

    const parent = comments.find((comment) => comment.id === parentId);
    if (!parent || parent.parentId) {
      return;
    }

    const newReply: BoardComment = {
      id: Date.now(),
      postId: selectedPost.id,
      author: '사용자',
      text,
      parentId,
    };

    setComments((prev) => [...prev, newReply]);
  };

  const handleEditPost = () => {
    if (!selectedPost) {
      return;
    }

    setEditingPostId(selectedPost.id);
    setMode('write');
  };

  const handleDeletePost = () => {
    if (!selectedPost) {
      return;
    }

    setPosts((prev) => prev.filter((post) => post.id !== selectedPost.id));
    setComments((prev) => prev.filter((comment) => comment.postId !== selectedPost.id));
    setSelectedPostId(null);
    setMode('list');
  };

  const editingPost = editingPostId ? posts.find((post) => post.id === editingPostId) ?? null : null;

  if (!isCustomListMode && mode === 'write') {
    return (
      <BoardWrite
        onCancel={() => {
          setEditingPostId(null);
          setMode('list');
        }}
        onSubmit={handleWriteSubmit}
        initialTitle={editingPost?.title}
        initialContent={editingPost?.content}
        initialAttachments={editingPost?.attachments ?? []}
      />
    );
  }

  if (!isCustomListMode && mode === 'detail' && selectedPost) {
    return (
      <BoardDetail
        post={selectedPost}
        comments={selectedPostComments}
        onBack={() => setMode('list')}
        onAddComment={handleAddComment}
        onAddReply={handleAddReply}
        onEdit={handleEditPost}
        onDelete={handleDeletePost}
      />
    );
  }

  const shouldShowWriteButton = !hideWriteButton && !isCustomListMode;

  return (
    <section className={joinClassNames(styles.wrapper, className)}>
      <div className={joinClassNames(styles.header, headerClassName)}>
        <h2 className={joinClassNames(styles.title, titleClassName)}>{title}</h2>
        <div className={joinClassNames(styles.actions, actionClassName)}>
          {headerActions}
          {shouldShowWriteButton ? (
            <Button
              type='button'
              onClick={() => setMode('write')}
              size='14px'
              background='#2563eb'
              textColor='#ffffff'
              borderColor='#2563eb'
              hoverBackground='#1d4ed8'
              hoverTextColor='#ffffff'
              hoverBorderColor='#1d4ed8'
              round='8px'
              padding='8px 12px'
            >
              글쓰기
            </Button>
          ) : null}
        </div>
      </div>

      {toolbar ? <div className={joinClassNames(styles.toolbar, toolbarClassName)}>{toolbar}</div> : null}

      <Table
        className={tableClassName}
        columns={isCustomListMode ? customColumns : DEFAULT_COLUMNS}
        rows={isCustomListMode ? pagedCustomRows : rows}
        rowKeyField={isCustomListMode ? listRowKeyField : '__rowId'}
        onRowClick={
          isCustomListMode
            ? onListRowClick
            : (_, rowIndex) => handleSelectPost(pagedPosts[rowIndex])
        }
        thColor={thColor}
        thBackground={thBackground}
        tdColor={tdColor}
        tdBackground={tdBackground}
        borderColor={borderColor}
      />

      <Pagination
        className={joinClassNames(styles.pagination, paginationClassName)}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setPage}
        buttonTheme={paginationButtonTheme}
        activeButtonTheme={paginationActiveButtonTheme}
        disabledButtonTheme={paginationDisabledButtonTheme}
      />
    </section>
  );
}
