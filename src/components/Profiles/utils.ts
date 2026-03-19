export function fmt(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(n >= 10_000 ? 0 : 1)}K`
  return String(n)
}

export function timeAgo(dateString: string): string {
  const secs = Math.floor((Date.now() - new Date(dateString).getTime()) / 1000)
  if (secs < 60) return "vừa xong"
  if (secs < 3600) return `${Math.floor(secs / 60)} phút trước`
  if (secs < 86400) return `${Math.floor(secs / 3600)} giờ trước`
  if (secs < 604800) return `${Math.floor(secs / 86400)} ngày trước`
  return new Date(dateString).toLocaleDateString("vi-VN")
}
