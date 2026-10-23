import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

/** Markdown sans HTML brut (react-markdown n'interprète pas le HTML) : un JSON importé ne peut pas injecter de script. */
export default function Md({ children }: { children: string }) {
  return (
    <div className="md">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={{ a: ({ node: _n, ...p }) => <a {...p} target="_blank" rel="noopener noreferrer" /> }}>
        {children}
      </ReactMarkdown>
    </div>
  );
}

export function fenced(language: string, source: string): string {
  const longest = (source.match(/`+/g) ?? []).reduce((m, s) => Math.max(m, s.length), 0);
  const fence = '`'.repeat(Math.max(3, longest + 1));
  return `${fence}${language}\n${source}\n${fence}`;
}
