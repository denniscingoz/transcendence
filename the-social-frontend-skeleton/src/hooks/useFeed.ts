import { useQuery } from "@tanstack/react-query"
import { getFeed } from "../api/feed.api"
import { CursorPageDto, PostDto } from "../types/api"

export function useFeed() {
  return useQuery<CursorPageDto<PostDto>>({
    queryKey: ['posts', 'feed'],
    queryFn: () => getFeed(),
  })
}