import { AppBar } from "../components/AppBar";
import { BlogCard } from "../components/BlogCard";
import { BlogSkeleton } from "../components/BlogSkeleton";
import { useBlogs } from "../hooks";

export function Blogs() {
  const { blogs, loading } = useBlogs();

  if (loading) {
    return (
      <div>
        <AppBar />
        <div className="flex justify-center">
          <div>
            <BlogSkeleton />
            <BlogSkeleton />
            <BlogSkeleton />
            <BlogSkeleton />
            <BlogSkeleton />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <AppBar />
      <div className="flex justify-center ">
        <div>
          {blogs
            .slice()
            .reverse()
            .map((blog, i) => (
              <BlogCard
                key={i}
                id={blog.id}
                authorName={blog.author?.name}
                title={blog.title}
                content={blog.content}
                publishedDate={convertUTCtoIST(blog.createdAt)}
              />
            ))}
        </div>
      </div>
    </div>
  );
}
export function convertUTCtoIST(utcDate: string | Date): string {
  const date = new Date(utcDate);

  // Convert to IST using 'Asia/Kolkata' timezone
  const options: Intl.DateTimeFormatOptions = {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "numeric",
    minute: "numeric",
    hour12: true,
    timeZone: "Asia/Kolkata",
  };

  // Format the date to IST
  const istDate = date.toLocaleString("en-IN", options);

  return istDate;
}
