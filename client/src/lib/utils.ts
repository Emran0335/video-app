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
  const diff = now.getTime() - then.getTime();

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const weeks = Math.floor(days / 7);
  const months = Math.floor(days / 30);
  const years = Math.floor(months / 12);

  if (years > 0) {
    if (years === 1) {
      return `${years} year ago`;
    }
    return `${years} years ago`;
  } else if (months > 0) {
    if (months === 1) {
      return `${months} month ago`;
    }
    return `${months} months ago`;
  } else if (weeks > 0) {
    if (weeks === 1) {
      return `${weeks} week ago`;
    }
    return `${weeks} weeks ago`;
  } else if (days > 0) {
    if (days === 1) {
      return `${days} day ago`;
    }
    return `${days} days ago`;
  } else if (hours > 0) {
    if (hours === 1) {
      return `${hours} hour ago`;
    }
    return `${hours} hours ago`;
  } else if (minutes > 0) {
    if (minutes === 1) {
      return `${minutes} minute ago`;
    }
    return `${minutes} minutes ago`;
  } else {
    return `Just now`;
  }
};
