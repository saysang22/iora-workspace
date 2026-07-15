import { useMemo, useState } from 'react';
import { Button } from '../button/Button';
import { Input } from '../input/Input';
import type { BoardComment, BoardPost } from './Board';
import styles from './BoardDetail.module.scss';

type BoardDetailProps = {
  post: BoardPost;
  comments: BoardComment[];
  onBack?: () => void;
  onAddComment: (text: string) => void;
  onAddReply: (parentId: number, text: string) => void;
  onEdit: () => void;
  onDelete: () => void;
};

export function BoardDetail({
  post,
  comments,
  onBack,
  onAddComment,
  onAddReply,
  onEdit,
  onDelete,
}: BoardDetailProps) {
  const [commentInput, setCommentInput] = useState('');
  const [replyParentId, setReplyParentId] = useState<number | null>(null);
  const [replyInput, setReplyInput] = useState('');

  const rootComments = useMemo(() => comments.filter((comment) => !comment.parentId), [comments]);

  const repliesByParentId = useMemo(() => {
    const map = new Map<number, BoardComment[]>();

    comments
      .filter((comment) => comment.parentId)
      .forEach((reply) => {
        const parentId = reply.parentId as number;
        const current = map.get(parentId) ?? [];
        map.set(parentId, [...current, reply]);
      });

    return map;
  }, [comments]);

  const handleAddComment = () => {
    if (!commentInput.trim()) {
      return;
    }

    onAddComment(commentInput.trim());
    setCommentInput('');
  };

  const handleAddReply = (parentId: number) => {
    if (!replyInput.trim()) {
      return;
    }

    onAddReply(parentId, replyInput.trim());
    setReplyParentId(null);
    setReplyInput('');
  };

  const handleBackClick = () => {
    if (onBack) {
      onBack();
      return;
    }

    if (typeof window !== 'undefined') {
      window.location.href = '/board';
    }
  };

  return (
    <section className={styles.wrapper}>
      <div className={styles.topActions}>
        <Button
          type="button"
          onClick={handleBackClick}
          size="13px"
          background="#ffffff"
          textColor="#1f2937"
          borderColor="#d1d5db"
          hoverBackground="#f3f4f6"
          hoverTextColor="#111827"
          hoverBorderColor="#9ca3af"
          round="8px"
          padding="6px 10px"
        >
          목록
        </Button>
        <div className={styles.editActions}>
          <Button
            type="button"
            onClick={onEdit}
            size="13px"
            background="#ffffff"
            textColor="#1f2937"
            borderColor="#d1d5db"
            hoverBackground="#f3f4f6"
            hoverTextColor="#111827"
            hoverBorderColor="#9ca3af"
            round="8px"
            padding="6px 10px"
          >
            수정
          </Button>
          <Button
            type="button"
            onClick={onDelete}
            size="13px"
            background="#ffffff"
            textColor="#b91c1c"
            borderColor="#fecaca"
            hoverBackground="#fef2f2"
            hoverTextColor="#991b1b"
            hoverBorderColor="#fca5a5"
            round="8px"
            padding="6px 10px"
          >
            삭제
          </Button>
        </div>
      </div>

      <h2 className={styles.title}>{post.title}</h2>
      <p className={styles.meta}>
        {post.author} · {post.createdAt} · 조회 {post.views}
      </p>

      <article className={styles.content} dangerouslySetInnerHTML={{ __html: post.content }} />

      <section className={styles.attachmentSection}>
        <h3 className={styles.attachmentTitle}>첨부파일</h3>
        {post.attachments && post.attachments.length > 0 ? (
          <ul className={styles.attachmentList}>
            {post.attachments.map((name) => (
              <li key={name}>{name}</li>
            ))}
          </ul>
        ) : (
          <p className={styles.attachmentEmpty}>첨부파일 없음</p>
        )}
      </section>

      <section className={styles.commentSection}>
        <h3 className={styles.commentTitle}>댓글</h3>

        <div className={styles.commentInputRow}>
          <Input
            value={commentInput}
            onChange={(event) => setCommentInput(event.target.value)}
            placeholder="댓글을 입력하세요"
            width="100%"
            padding="8px 10px"
            round="8px"
            background="#ffffff"
            textColor="#111827"
            focusBorderColor="#2563eb"
          />
          <Button
            type="button"
            onClick={handleAddComment}
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
            등록
          </Button>
        </div>

        <ul className={styles.commentList}>
          {rootComments.map((comment) => (
            <li key={comment.id} className={styles.commentItem}>
              <p className={styles.commentAuthor}>{comment.author}</p>
              <p className={styles.commentText}>{comment.text}</p>
              <Button
                type="button"
                onClick={() => setReplyParentId(comment.id)}
                size="12px"
                background="#ffffff"
                textColor="#334155"
                borderColor="#d1d5db"
                hoverBackground="#f8fafc"
                hoverTextColor="#111827"
                hoverBorderColor="#9ca3af"
                round="6px"
                padding="4px 8px"
              >
                답글
              </Button>

              {replyParentId === comment.id ? (
                <div className={styles.replyInputRow}>
                  <Input
                    value={replyInput}
                    onChange={(event) => setReplyInput(event.target.value)}
                    placeholder="답글을 입력하세요"
                    width="100%"
                    padding="8px 10px"
                    round="8px"
                    background="#ffffff"
                    textColor="#111827"
                    focusBorderColor="#2563eb"
                  />
                  <Button
                    type="button"
                    onClick={() => handleAddReply(comment.id)}
                    size="12px"
                    background="#2563eb"
                    textColor="#ffffff"
                    borderColor="#2563eb"
                    hoverBackground="#1d4ed8"
                    hoverTextColor="#ffffff"
                    hoverBorderColor="#1d4ed8"
                    round="8px"
                    padding="6px 10px"
                  >
                    저장
                  </Button>
                </div>
              ) : null}

              {(repliesByParentId.get(comment.id) ?? []).map((reply) => (
                <div key={reply.id} className={styles.replyItem}>
                  <p className={styles.commentAuthor}>{reply.author}</p>
                  <p className={styles.commentText}>{reply.text}</p>
                </div>
              ))}
            </li>
          ))}
        </ul>
      </section>
    </section>
  );
}
