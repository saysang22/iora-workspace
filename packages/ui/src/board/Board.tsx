import { useMemo, useState } from 'react';
import { Button } from '../button/Button';
import { Pagination } from '../pagination/Pagination';
import { Table } from '../table/Table';
import { BoardDetail } from './BoardDetail';
import { BoardWrite } from './BoardWrite';
import styles from './Board.module.scss';

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
  initialItems: BoardPost[];
  pageSize?: number;
  thColor?: string;
  thBackground?: string;
  tdColor?: string;
  tdBackground?: string;
  borderColor?: string;
};

const columns = [
  { key: 'no', header: '번호', align: 'center' as const },
  { key: 'title', header: '제목' },
  { key: 'author', header: '작성자', align: 'center' as const },
  { key: 'createdAt', header: '작성일', align: 'center' as const },
  { key: 'views', header: '조회수', align: 'center' as const },
];

export function Board({
  title = '게시판',
  initialItems,
  pageSize = 10,
  thColor,
  thBackground,
  tdColor,
  tdBackground,
  borderColor,
}: BoardProps) {
  const [posts, setPosts] = useState<BoardPost[]>(initialItems);
  const [comments, setComments] = useState<BoardComment[]>([]);
  const [page, setPage] = useState(1);
  const [mode, setMode] = useState<'list' | 'write' | 'detail'>('list');
  const [selectedPostId, setSelectedPostId] = useState<number | null>(null);
  const [editingPostId, setEditingPostId] = useState<number | null>(null);

  const totalPages = Math.max(1, Math.ceil(posts.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;

  const pagedPosts = useMemo(() => posts.slice(startIndex, endIndex), [posts, startIndex, endIndex]);

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
          post.id === editingPostId ? { ...post, title: values.title, content: values.content, attachments: values.attachments } : post,
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

  if (mode === 'write') {
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

  if (mode === 'detail' && selectedPost) {
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

  return (
    <section className={styles.wrapper}>
      <div className={styles.header}>
        <h2 className={styles.title}>{title}</h2>
        <Button
          type="button"
          onClick={() => setMode('write')}
          size="14px"
          background="#2563eb"
          textColor="#ffffff"
          borderColor="#2563eb"
          hoverBackground="#1d4ed8"
          hoverTextColor="#ffffff"
          hoverBorderColor="#1d4ed8"
          round="8px"
          padding="8px 12px"
        >
          글쓰기
        </Button>
      </div>

      <Table
        columns={columns}
        rows={rows}
        rowKeyField="__rowId"
        onRowClick={(_, rowIndex) => handleSelectPost(pagedPosts[rowIndex])}
        thColor={thColor}
        thBackground={thBackground}
        tdColor={tdColor}
        tdBackground={tdBackground}
        borderColor={borderColor}
      />

      <Pagination className={styles.pagination} currentPage={currentPage} totalPages={totalPages} onPageChange={setPage} />
    </section>
  );
}
