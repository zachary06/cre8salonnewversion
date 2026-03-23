export const format12h = (t) => {
  if (!t) return '';
  if (t.includes('M')) return t; // Already 12h formatted
  const [h, m] = t.split(':');
  let hour = parseInt(h);
  const period = hour >= 12 ? 'PM' : 'AM';
  hour = hour % 12 || 12;
  return `${hour}:${m} ${period}`;
};

export const formatDate = (dateString) => {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

export const getCustomerName = (customers, id) => {
  if (!customers || !id) return 'Unknown';
  const customer = customers.find(c => c.id === id);
  return customer ? customer.name : 'Unknown';
};

export const getCustomerPhone = (customers, id) => {
  if (!customers || !id) return 'No phone';
  const customer = customers.find(c => c.id === id);
  return customer ? customer.phone : 'No phone';
};
