import { useInfiniteQuery } from "@tanstack/react-query"
import { getFeed } from "../api/feed.api"
import { CursorPageDto, PostDto } from "../types/api"

export function useFeed(take = 20) {
  return useInfiniteQuery<CursorPageDto<PostDto>, Error>({
    queryKey: ['posts', 'feed', take],
    queryFn: ({ pageParam, signal }) => getFeed(take, (pageParam ?? null) as string | null, signal),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
  })
}