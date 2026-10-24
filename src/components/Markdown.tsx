import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import java from 'highlight.js/lib/languages/java';
import javascript from 'highlight.js/lib/languages/javascript';
import typescript from 'highlight.js/lib/languages/typescript';
import json from 'highlight.js/lib/languages/json';
import xml from 'highlight.js/lib/languages/xml';
import sql from 'highlight.js/lib/languages/sql';
import bash from 'highlight.js/lib/languages/bash';

// Langages chargés explicitement (bundle léger). Un bloc sans langage ou inconnu reste en texte brut.
const highlight = [rehypeHighlight, { languages: { java, javascript, typescript, json, xml, sql, bash }, aliases: { javascript: ['js'], typescript: ['ts'], bash: ['sh', 'shell'], xml: ['html'] }, detect: false }] as never;

/** Markdown sans HTML brut (react-markdown n'interprète pas le HTML) : un JSON importé ne peut pas injecter de script. */
export default function Md({ children }: { children: string }) {
  return (
    <div className="md">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[highlight]}
        components={{
          a: ({ node: _n, ...p }) => <a {...p} target="_blank" rel="noopener noreferrer" />,
          img: ({ node: _n, ...p }) => <img {...p} loading="lazy" />,
        }}
      >
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
