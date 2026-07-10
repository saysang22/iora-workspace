import { useState } from 'react';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Button } from '../button/Button';
import { Input } from '../input/Input';
import styles from './BoardWrite.module.scss';

type BoardWriteProps = {
  onCancel: () => void;
  onSubmit: (values: { title: string; content: string; attachments: string[] }) => void;
  contentPlaceholder?: string;
  initialTitle?: string;
  initialContent?: string;
  initialAttachments?: string[];
};

export function BoardWrite({
  onCancel,
  onSubmit,
  contentPlaceholder = '내용을 입력하세요.',
  initialTitle = '',
  initialContent = '',
  initialAttachments = [],
}: BoardWriteProps) {
  const [title, setTitle] = useState(initialTitle);
  const [attachments, setAttachments] = useState<string[]>(initialAttachments);
  const [isEditorEmpty, setIsEditorEmpty] = useState(true);

  const editor = useEditor({
    extensions: [StarterKit],
    content: initialContent,
    editorProps: {
      attributes: {
        'aria-label': '내용 입력',
        role: 'textbox',
      },
    },
    onCreate: ({ editor: currentEditor }) => {
      setIsEditorEmpty(currentEditor.isEmpty);
    },
    onUpdate: ({ editor: currentEditor }) => {
      setIsEditorEmpty(currentEditor.isEmpty);
    },
  });

  const handleSubmit = () => {
    const content = editor?.getHTML() ?? '';
    if (!title.trim()) {
      return;
    }

    onSubmit({ title: title.trim(), content, attachments });
  };

  const handleAttachmentChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) {
      return;
    }

    setAttachments(Array.from(files).map((file) => file.name));
  };

  return (
    <section className={styles.wrapper}>
      <h2 className={styles.title}>게시글 작성</h2>

      <Input
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        placeholder="제목을 입력하세요"
        width="100%"
        padding="10px 12px"
        round="8px"
        background="#ffffff"
        textColor="#111827"
        focusBorderColor="#2563eb"
      />

      <div className={styles.editor}>
        {isEditorEmpty ? <span className={styles.editorPlaceholder}>{contentPlaceholder}</span> : null}
        <EditorContent editor={editor} />
      </div>

      <div className={styles.attachments}>
        <label className={styles.attachmentLabel} htmlFor="board-attachments">
          첨부파일
        </label>
        <input id="board-attachments" type="file" multiple onChange={handleAttachmentChange} />
        {attachments.length > 0 ? (
          <ul className={styles.attachmentList}>
            {attachments.map((name) => (
              <li key={name}>{name}</li>
            ))}
          </ul>
        ) : null}
      </div>

      <div className={styles.actions}>
        <Button
          type="button"
          onClick={onCancel}
          size="14px"
          background="#ffffff"
          textColor="#1f2937"
          borderColor="#d1d5db"
          hoverBackground="#f3f4f6"
          hoverTextColor="#111827"
          hoverBorderColor="#9ca3af"
          round="8px"
          padding="8px 12px"
        >
          취소
        </Button>
        <Button
          type="button"
          onClick={handleSubmit}
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
          저장
        </Button>
      </div>
    </section>
  );
}
