export const statusLabels: Record<string, string> = {
  todo: "Por hacer",
  in_progress: "En progreso",
  done: "Completada",
};

export const priorityLabels: Record<string, string> = {
  low: "Baja",
  medium: "Media",
  high: "Alta",
};

export const TAG_COLORS = [
  {
    bg: "bg-blue-100 dark:bg-blue-900/30",
    text: "text-blue-700 dark:text-blue-300",
  },
  {
    bg: "bg-purple-100 dark:bg-purple-900/30",
    text: "text-purple-700 dark:text-purple-300",
  },
  {
    bg: "bg-green-100 dark:bg-green-900/30",
    text: "text-green-700 dark:text-green-300",
  },
  {
    bg: "bg-amber-100 dark:bg-amber-900/30",
    text: "text-amber-700 dark:text-amber-300",
  },
  {
    bg: "bg-rose-100 dark:bg-rose-900/30",
    text: "text-rose-700 dark:text-rose-300",
  },
  {
    bg: "bg-teal-100 dark:bg-teal-900/30",
    text: "text-teal-700 dark:text-teal-300",
  },
];

export const getTagColor = (tagId: string) => {
  const index = tagId.charCodeAt(0) % TAG_COLORS.length;
  return TAG_COLORS[index];
};
