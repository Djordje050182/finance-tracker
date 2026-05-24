export const todayISO = () => new Date().toISOString().split('T')[0];

export const monthBounds = (offsetMonths = 0) => {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth() + offsetMonths, 1);
  const end = new Date(now.getFullYear(), now.getMonth() + offsetMonths + 1, 0);
  return { start, end };
};

export const daysBetween = (startTimestamp, endTimestamp) =>
  Math.max(1, Math.ceil((endTimestamp - startTimestamp) / (1000 * 60 * 60 * 24))) + 1;
