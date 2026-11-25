export function getDeadlineInfo(dateLimiteModification, dateLivraison = null) {
  if (!dateLimiteModification) {
    return {
      isOpen: false,
      label: 'No deadline set',
      deadlineDate: null,
      deliveredDate: dateLivraison ? new Date(dateLivraison) : null,
      remainingText: '',
    };
  }

  const deadlineDate = new Date(dateLimiteModification);
  const nowMs = Date.now();
  const diffMs = deadlineDate.getTime() - nowMs;
  const isOpen = diffMs > 0;

  let remainingText = 'Expired';
  if (isOpen) {
    const totalMinutes = Math.floor(diffMs / (1000 * 60));
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    remainingText = `${hours}h ${minutes}m remaining`;
  }

  return {
    isOpen,
    label: isOpen ? 'Edit window open (< 24h)' : 'Edit window expired',
    deadlineDate,
    deliveredDate: dateLivraison ? new Date(dateLivraison) : null,
    remainingText,
  };
}