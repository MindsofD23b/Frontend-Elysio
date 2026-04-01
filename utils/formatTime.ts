export function formatTime(isoString: string) {
    const date = new Date(isoString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();

    if (diff < 60 * 1000) {
        return "Just now";
    } else if (diff < 60 * 60 * 1000) {
        const minutes = Math.floor(diff / (60 * 1000));
        return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
    } else if (diff < 24 * 60 * 60 * 1000) {
        const hours = Math.floor(diff / (60 * 60 * 1000));
        return `${hours} hour${hours > 1 ? "s" : ""} ago`;
    } else {
        return date.toLocaleDateString();
    }
}
