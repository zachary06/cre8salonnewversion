import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Plus, MoreHorizontal, Trash2, Edit2, Scissors, ChevronUp, ChevronDown } from 'lucide-react';
import './Services.css';

// Map service keywords to appropriate salon images
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
  if (name.includes('wax') || name.includes('threading') || name.includes('brow') || name.includes('eyebrow')) {
    return 'https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?auto=format&fit=crop&w=400&q=80';
  }
  if (name.includes('lash') || name.includes('eyelash') || name.includes('extension')) {
    return 'https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?auto=format&fit=crop&w=400&q=80';
  }
  if (name.includes('makeup') || name.includes('make up') || name.includes('cosmetic')) {
    return 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=400&q=80';
  }
  if (name.includes('treatment') || name.includes('keratin') || name.includes('perm')) {
    return 'https://images.unsplash.com/photo-1519861531473-9200262188bf?auto=format&fit=crop&w=400&q=80';
  }
  if (name.includes('blowout') || name.includes('blow') || name.includes('dry')) {
    return 'https://images.unsplash.com/photo-1605497788044-5a32c7078486?auto=format&fit=crop&w=400&q=80';
  }
  return 'https://images.unsplash.com/photo-1600948836101-f9ffda59d250?auto=format&fit=crop&w=400&q=80';
};

// Portal dropdown — renders into document.body with fixed positioning
const ServiceMenuPortal = ({ btnRef, onEdit, onDelete, onClose }) => {
  const [pos, setPos] = useState({ top: 0, left: 0 });

  useEffect(() => {
    if (btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect();
      setPos({
        top: rect.bottom + 6,
        left: rect.right - 160,
      });
    }

    const handleClose = (e) => {
      if (!e.target.closest('.service-dropdown-portal')) onClose();
    };
    window.addEventListener('click', handleClose);
    return () => window.removeEventListener('click', handleClose);
  }, []);

  return createPortal(
    <div
      className="dropdown-menu service-dropdown-portal"
      style={{ position: 'fixed', top: pos.top, left: pos.left, zIndex: 9999, minWidth: 160 }}
      onClick={(e) => e.stopPropagation()}
    >
      <button className="dropdown-item" onClick={onEdit}>
        <Edit2 size={14} /> Edit
      </button>
      <div className="dropdown-divider" />
      <button className="dropdown-item danger" onClick={onDelete}>
        <Trash2 size={14} /> Delete
      </button>
    </div>,
    document.body
  );
};

const Services = ({ services, setServices, searchTerm }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [formData, setFormData] = useState({ name: '', price: '', active: true });
  const [activeActionsId, setActiveActionsId] = useState(null);
  const btnRefs = useRef({});

  const handleSubmit = (e) => {
    e.preventDefault();
    const serviceData = {
      id: editingService ? editingService.id : Date.now(),
      name: formData.name,
      price: parseFloat(formData.price),
      active: formData.active,
    };
    if (editingService) {
      setServices(services.map(s => s.id === editingService.id ? serviceData : s));
    } else {
      setServices([...services, serviceData]);
    }
    handleCloseModal();
  };

  const handleDelete = (id) => {
    setServices(services.filter(s => s.id !== id));
    setActiveActionsId(null);
  };

  const handleEdit = (service) => {
    setEditingService(service);
    setFormData({ name: service.name, price: service.price.toString(), active: service.active !== false });
    setIsModalOpen(true);
    setActiveActionsId(null);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingService(null);
    setFormData({ name: '', price: '', active: true });
  };

  const filteredServices = services.filter(s =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') handleCloseModal();
    };
    if (isModalOpen) window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isModalOpen]);

  return (
    <div className="services-page">
      <div className="section-header flex-between mb-32">
        <h1 className="section-title" style={{ marginBottom: 0 }}>Services</h1>
        <div className="members-top-actions">
          <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
            <Plus size={16} strokeWidth={3} />
            <span>Add New Service</span>
          </button>
        </div>
      </div>
      <div className="services-grid-wrapper">
        {filteredServices.length === 0 ? (
          <div className="services-empty card">
            <Scissors size={48} className="text-muted" />
            <p>{searchTerm ? 'No services found matching your search.' : 'No services yet. Add your first service!'}</p>
          </div>
        ) : (
          <div className="services-all-grid">
            {filteredServices.map((service) => {
              if (!btnRefs.current[service.id]) {
                btnRefs.current[service.id] = React.createRef();
              }
              return (
                <div key={service.id} className="card service-card">
                  <div className="service-img-box">
                    <img src={getServiceImage(service.name)} alt={service.name} style={{ filter: service.active === false ? 'grayscale(100%) opacity(0.5)' : 'none' }} />
                    <div className={`service-badge ${service.active === false ? 'inactive-badge' : ''}`}>
                      {service.active === false ? 'Inactive' : 'Active'}
                    </div>
                  </div>
                    <div className="service-info">
                      <div className="svc-details-inner">
                        <h3 className="service-item-title">{service.name}</h3>
                        <div className="service-meta">
                          <span className="s-price">Price: <span className="s-price-val">₱ {service.price.toFixed(2)}</span></span>
                        </div>
                      </div>
                      <div className="service-menu-container">
                        <button
                          ref={btnRefs.current[service.id]}
                          className="service-menu-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveActionsId(activeActionsId === service.id ? null : service.id);
                          }}
                        >
                          <MoreHorizontal size={18} />
                        </button>
                        {activeActionsId === service.id && (
                          <ServiceMenuPortal
                            btnRef={btnRefs.current[service.id]}
                            onEdit={() => handleEdit(service)}
                            onDelete={() => handleDelete(service.id)}
                            onClose={() => setActiveActionsId(null)}
                          />
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
        )}
      </div>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal card">
            <h2>{editingService ? 'Edit Service' : 'Add New Service'}</h2>
            <form onSubmit={handleSubmit} className="mt-24">
              <div className="form-group">
                <label>Service Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Hair Coloring, Facial..."
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Price (₱ )</label>
                <div className="custom-number-wrapper">
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  />
                  <div className="number-controls">
                    <button 
                      type="button" 
                      className="num-btn"
                      onClick={() => {
                        const val = parseFloat(formData.price || 0);
                        setFormData({ ...formData, price: (val + 1).toString() });
                      }}
                    >
                      <ChevronUp size={12} />
                    </button>
                    <button 
                      type="button" 
                      className="num-btn"
                      onClick={() => {
                        const val = parseFloat(formData.price || 0);
                        setFormData({ ...formData, price: Math.max(0, val - 1).toString() });
                      }}
                    >
                      <ChevronDown size={12} />
                    </button>
                  </div>
                </div>
              </div>
              {editingService && (
                <div className="form-group" style={{ flexDirection: 'row', alignItems: 'center', cursor: 'pointer' }} onClick={() => setFormData({ ...formData, active: !formData.active })}>
                  <input
                    type="checkbox"
                    checked={formData.active}
                    onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                    style={{ width: 'auto', cursor: 'pointer', transform: 'scale(1.2)' }}
                    onClick={(e) => e.stopPropagation()}
                  />
                  <label style={{ margin: 0, cursor: 'pointer' }}>Service is Active (visible to customers)</label>
                </div>
              )}
              <div className="modal-actions mt-32">
                <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>Cancel</button>
                <button type="submit" className="btn btn-primary">
                  {editingService ? 'Save Changes' : 'Add Service'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default React.memo(Services);
