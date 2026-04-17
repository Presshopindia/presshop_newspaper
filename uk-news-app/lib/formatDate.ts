import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

export function formatDate(date: string) {
  return dayjs(date).format("MMM D, YYYY");
}

export function timeAgo(date: string) {
  return dayjs(date).fromNow();
}
