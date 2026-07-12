import { BlogPostMeta } from "./types";
import PostCard from "./PostCard";
import { Button } from "@/components/ui/button";

interface PostsGridProps {
  posts: BlogPostMeta[];
  onClearFilter: () => void;
}

export default function PostsGrid({ posts, onClearFilter }: PostsGridProps) {
  return (
    <section>
      {/* Section header — editorial style */}
      <div className="flex items-center justify-between mb-8 pb-5 border-b border-border-soft">
        <h2 className="text-2xl font-medium text-ink-900 tracking-tight">Recent posts</h2>
        <Button variant="outline" size="sm" onClick={onClearFilter} className="flex-shrink-0">
          View all posts →
        </Button>
      </div>

      {/* 3 / 2 / 1 column grid with generous gutters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
        {posts.map((post) => (
          <PostCard key={post._id} post={post} />
        ))}
      </div>
    </section>
  );
}
