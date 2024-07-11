"use client";

import QuoteSkeleton from "./quote-skeleton";
import { Masonry } from "react-plock";

export default function QuotesMasonary() {
  return (
    <Masonry
      items={Array.from({ length: 7 }).map((_, i) => i)}
      config={{
        columns: [1, 2, 3],
        gap: [8, 8, 8],
        media: [600, 850, 1024],
      }}
      render={(index) => <QuoteSkeleton key={index} />}
    />
  );
}

export const ContentCardSkeletonList = () => {
  return (
    <div className="w-full columns-1 md:columns-2 lg:columns-3 2xl:columns-4 bg-green-500">
      {Array.from({ length: 8 }).map((_, i) => (
        <QuoteSkeleton key={i} />
      ))}
    </div>
  );
};
