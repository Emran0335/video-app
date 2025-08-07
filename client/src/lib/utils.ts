export const formatDuration = (duration: number) => {
  const hours = Math.floor(duration / 3600);
  const minutes = Math.floor((duration % 3600) / 60);
  const seconds = duration % 60;

  const pad = (num: number) => String(num).padStart(2, "0");

  if (hours > 0) {
    return `${hours}:${pad(minutes)}:${pad(seconds)}`;
  } else {
    return `${minutes}:${pad(seconds)}`;
  }
};

export const getTimeDistanceToNow = (date: Date) => {
  const now = new Date();
  const then = new Date(date);
  const diffInSeconds = Math.floor((now.getTime() - then.getTime()) / 1000);

  const units = [
    { label: "year", seconds: 31536000 },     // 365 days
    { label: "month", seconds: 2592000 },     // 30 days
    { label: "week", seconds: 604800 },
    { label: "day", seconds: 86400 },
    { label: "hour", seconds: 3600 },
    { label: "minute", seconds: 60 },
    { label: "second", seconds: 1 },
  ];

  for (const unit of units) {
    const value = Math.floor(diffInSeconds / unit.seconds);
    if (value >= 1) {
      return value === 1 ? `1 ${unit.label} ago` : `${value} ${unit.label}s ago`;
    }
  }

  return "Just now";
};

export const formatDate = (timestamp: Date) => {
  const date = new Date(timestamp);
  const days = date.getDate();
  const months = date.getMonth() + 1;

  const day = days < 10 ? "0" + days : days;
  const month = months < 10 ? "0" + months : months;

  return day + "/" + month + "/" + date.getFullYear();
};
