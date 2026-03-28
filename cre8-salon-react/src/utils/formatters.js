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

export const getServiceImage = (serviceName) => {
  const name = (serviceName || '').toLowerCase();
  if (name.includes('hair') && (name.includes('cut') || name.includes('trim') || name.includes('style'))) {
    return 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=400&q=80';
  }
  if (name.includes('color') || name.includes('dye') || name.includes('highlight') || name.includes('bleach')) {
    return 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=400&q=80';
  }
  if (name.includes('facial') || name.includes('face') || name.includes('skin') || name.includes('peel')) {
    return 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=400&q=80';
  }
  if (name.includes('massage') || name.includes('relax') || name.includes('spa')) {
    return 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=400&q=80';
  }
  if (name.includes('nail') || name.includes('mani') || name.includes('pedi')) {
    return 'https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=400&q=80';
  }
  return 'https://images.unsplash.com/photo-1600948836101-f9ffda59d250?auto=format&fit=crop&w=400&q=80';
};
