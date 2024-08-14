import { Link } from "react-router-dom";

interface BlogCardProps {
  authorName: string;
  id: number;
  title: string;
  content: string;
  publishedDate: string;
}

export const BlogCard = ({
  id,
  authorName,
  title,
  content,
  publishedDate,
}: BlogCardProps) => {
  return (
    <Link to={`/blog/${id}`}>
      <div className="border-b border-slate-200 pb-4 p-4 w-screen max-w-screen-md cursor-pointer">
        <div className="flex">
          <div className="flex justify-center flex-col pl-1 pb-2">
            <Avatar name={authorName} />
          </div>
          <div className="font-extralight pl-2">{authorName} .</div>
          <div className="pl-2 font-thin text-slate-500">{publishedDate}</div>
        </div>

        <div className="text-xl font-semibold">{title}</div>
        <div className="text-md font-thin">
          {content.length >= 100 ? content.slice(0, 100) + "..." : content}
        </div>
        <div className="text-slate-400 text-sm font-thin pt-4">
          {`${Math.ceil(content.length / 100)} minutes read`}
        </div>
      </div>
    </Link>
  );
};
export function Avatar({
  name,
  size = "small",
}: {
  name: string;
  size?: "small" | "big";
}) {
  return (
    <div
      className={`relative inline-flex items-center justify-center overflow-hidden bg-gray-600 rounded-full ${
        size === "small" ? "w-6 h-6" : "w-10 h-10"
      }`}
    >
      <span
        className={`${
          size === "small" ? "text-xs" : "text-md"
        } font-extralight text-gray-600 dark:text-gray-300`}
      >
        {name[0]}
      </span>
    </div>
  );
}
