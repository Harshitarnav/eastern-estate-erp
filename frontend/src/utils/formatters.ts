export const formatCurrency = (amount: number | string | null | undefined) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
  }).format(Number(amount) || 0);
};

export const formatDate = (date: string | Date) => {
  return new Date(date).toLocaleDateString('en-IN');
};
