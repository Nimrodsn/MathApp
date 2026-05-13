import Image from "next/image";
import ReactMarkdown from "react-markdown";
import rehypeKatex from "rehype-katex";
import remarkMath from "remark-math";

type RiddleReadOnlyBodyProps = {
  title: string;
  contentMarkdown: string;
  imageUrl: string | null;
};

export function RiddleReadOnlyBody({ title, contentMarkdown, imageUrl }: RiddleReadOnlyBodyProps) {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-primary">{title}</h1>
      {imageUrl ? (
        <div className="relative aspect-video w-full overflow-hidden rounded-lg border border-indigo-100 bg-indigo-50/50">
          <Image
            src={imageUrl}
            alt="Illustration for this riddle"
            fill
            className="object-contain"
            sizes="(max-width: 768px) 100vw, 640px"
            unoptimized
            priority
          />
        </div>
      ) : null}
      <div
        className="prose prose-indigo max-w-none rounded-lg bg-indigo-50 p-4 prose-headings:text-primary"
        dir="ltr"
        lang="en"
      >
        <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
          {contentMarkdown}
        </ReactMarkdown>
      </div>
    </div>
  );
}
