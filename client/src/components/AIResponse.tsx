import ReactMarkdown from 'react-markdown';
import rehypeKatex from 'rehype-katex';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';

interface AIResponseProps {
  content: string;
}

export const AIResponse: React.FC<AIResponseProps> = ({ content }) => (
  <div className="ai-response">
    <ReactMarkdown
      remarkPlugins={[remarkGfm, remarkMath]}
      rehypePlugins={[rehypeKatex]}
    >
      {content}
    </ReactMarkdown>
  </div>
);
