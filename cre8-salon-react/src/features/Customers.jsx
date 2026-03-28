import React, { useState, useEffect, useMemo } from 'react';
import { Plus, LayoutGrid, Menu, MoreVertical, Edit2, Trash2, Info, Search } from 'lucide-react';
import { useForm } from '../hooks/useForm';
import './Customers.css';

const MOCK_ROLES = ["Senior Stylist", "Hair Specialist", "Nail Artist", "Skin Expert", "Color Master"];

const Customers = ({ customers, addCustomer, updateCustomer, deleteCustomer, loadMockData, searchTerm }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const { values: formData, handleChange, setValues: setFormData, resetForm } = useForm({ name: '', email: '', phone: '' });
  const [detailsCustomer, setDetailsCustomer] = useState(null);
  const [activeActionsId, setActiveActionsId] = useState(null);

  // Close the actions pill if user clicks anywhere else
  useEffect(() => {
    const handleOutsideClick = () => {
      setActiveActionsId(null);
    };

    if (activeActionsId !== null) {
      window.addEventListener('click', handleOutsideClick);
    }
    return () => {
      window.removeEventListener('click', handleOutsideClick);
    };
  }, [activeActionsId]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingCustomer) {
      updateCustomer(editingCustomer.id, formData);
    } else {
      addCustomer(formData);
    }
    handleCloseModal();
  };

  const handleEdit = (customer) => {
    setEditingCustomer(customer);
    setFormData({ name: customer.name, email: customer.email, phone: customer.phone });
    setIsModalOpen(true);
    setActiveActionsId(null);
  };
  
  const handleDetails = (customer) => {
    setDetailsCustomer(customer);
    setActiveActionsId(null);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingCustomer(null);
    resetForm();
  };
  
  const toggleActions = (e, id) => {
    e.stopPropagation(); // Prevent the window click listener from immediately closing it
    setActiveActionsId(prev => prev === id ? null : id);
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to remove this member?")) {
      deleteCustomer(id);
      setActiveActionsId(null);
    }
  };

  const filteredCustomers = useMemo(() => {
    const searchLower = searchTerm.toLowerCase();
    return customers.filter(c => 
      c.name.toLowerCase().includes(searchLower) ||
      c.email?.toLowerCase().includes(searchLower) ||
      c.phone.includes(searchTerm)
    );
  }, [customers, searchTerm]);

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') {
        handleCloseModal();
        setDetailsCustomer(null);
      }
    };
    if (isModalOpen || detailsCustomer) window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isModalOpen, detailsCustomer]);

  return (
    <div className="customers-page">
      <div className="section-header flex-between mb-32">
        <div className="flex-center gap-16">
          <h1 className="section-title" style={{marginBottom: 0, fontSize: '24px'}}>Clients</h1>
        </div>
        <div className="members-top-actions">
          <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
            <Plus size={16} strokeWidth={3} />
            <span>Add New</span>
          </button>
        </div>
      </div>


      <div className="members-list-card card">
        {/* Table Header */}
        <div className="members-header-row">
          <div className="col-name">Name</div>
          <div className="col-mail">Mail</div>
          <div className="col-phone">Contact</div>
          <div className="col-actions">Actions</div>
        </div>

        {/* Table Body */}
        <div className="members-list-body">
          {filteredCustomers.map((customer) => (
            <div key={customer.id} className="member-row">
              {/* Added a decorative purple left-border hint on hover directly via CSS based on reference */}
              <div className="col-name member-identity">
                <div className="member-name-block">
                  <span className="member-name">{customer.name}</span>
                </div>
              </div>
              
              <div className="col-mail member-text-muted">
                {customer.email || `${customer.name.replace(/\s+/g, '').toLowerCase()}@cre8salon.com`}
              </div>
              
              
              <div className="col-phone member-text-muted">
                {customer.phone || 'N/A'}
              </div>
              
              <div className="col-actions action-col-container">
                <button className="member-action-trigger" onClick={(e) => toggleActions(e, customer.id)}>
                  <MoreVertical size={16} />
                </button>
                
                {activeActionsId === customer.id && (
                  <div className="dropdown-menu" onClick={(e) => e.stopPropagation()} style={{ top: '100%', right: '30px', marginTop: '4px', zIndex: 10, width: '120px' }}>
                    <button className="dropdown-item" onClick={() => handleEdit(customer)}>
                      <Edit2 size={14} /> Edit
                    </button>
                    <button className="dropdown-item text-red" onClick={() => handleDelete(customer.id)}>
                      <Trash2 size={14} /> Delete
                    </button>
                    <button className="dropdown-item" onClick={() => handleDetails(customer)}>
                      <Info size={14} /> Details
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
          {filteredCustomers.length === 0 && (
             <div className="empty-state p-24 text-center text-muted" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
                <p>{searchTerm ? 'No clients found matching your search.' : 'No members available. Add someone or load sample data.'}</p>
                {!searchTerm && <button className="btn" onClick={loadMockData}>Load Sample Data</button>}
             </div>
          )}
        </div>
      </div>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal card">
            <h2>{editingCustomer ? 'Edit Member' : 'Add New Member'}</h2>
            <form onSubmit={handleSubmit} className="mt-24">
              <div className="form-group">
                <label htmlFor="customer-name">Full Name <span className="required">*</span></label>
                <input 
                  id="customer-name"
                  name="name"
                  type="text" 
                  placeholder="Your full name"
                  required 
                  value={formData.name}
                  onChange={handleChange}
                  autoComplete="name"
                />
              </div>
              <div className="form-group">
                <label htmlFor="customer-email">Email Address <span className="optional">(Optional)</span></label>
                <input 
                  id="customer-email"
                  name="email"
                  type="email" 
                  placeholder="Email address"
                  value={formData.email}
                  onChange={handleChange}
                  autoComplete="email"
                />
              </div>
              <div className="form-group">
                <label htmlFor="customer-phone">Contact Number <span className="optional">(Optional)</span></label>
                <input 
                  id="customer-phone"
                  name="phone"
                  type="tel" 
                  placeholder="Phone number"
                  value={formData.phone}
                  onChange={handleChange}
                  autoComplete="tel"
                />
              </div>
              <div className="modal-actions mt-32">
                <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>Cancel</button>
                <button type="submit" className="btn btn-primary">
                  {editingCustomer ? 'Save Changes' : 'Add Member'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {detailsCustomer && (
        <div className="modal-overlay" onClick={() => setDetailsCustomer(null)}>
          <div className="modal card" onClick={(e) => e.stopPropagation()}>
            <div className="flex-between mb-24">
              <h2>Member Details</h2>
            </div>
            <div className="mt-8">
              <div className="mb-24">
                <p className="text-muted" style={{ fontSize: '13px', marginBottom: '4px' }}>Full Name</p>
                <p style={{ fontSize: '16px', fontWeight: '600' }}>{detailsCustomer.name}</p>
              </div>
              <div className="mb-24">
                <p className="text-muted" style={{ fontSize: '13px', marginBottom: '4px' }}>Email Address</p>
                <p style={{ fontSize: '16px', fontWeight: '500' }}>{detailsCustomer.email || 'N/A'}</p>
              </div>
              <div className="mb-24">
                <p className="text-muted" style={{ fontSize: '13px', marginBottom: '4px' }}>Contact Number</p>
                <p style={{ fontSize: '16px', fontWeight: '500' }}>{detailsCustomer.phone}</p>
              </div>
              <div className="mb-24">
                <p className="text-muted" style={{ fontSize: '13px', marginBottom: '4px' }}>Member Since</p>
                <p style={{ fontSize: '16px', fontWeight: '500' }}>
                  {detailsCustomer.createdAt ? new Date(detailsCustomer.createdAt).toLocaleDateString() : 'Unknown'}
                </p>
              </div>
            </div>
            <div className="modal-actions mt-32">
              <button className="btn btn-primary" onClick={() => setDetailsCustomer(null)}>Done</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default React.memo(Customers);
