import React, { useState, useEffect, useRef, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { Plus, Search, Calendar as CalendarIcon, MoreHorizontal, Check, Play, User, Edit2, Trash2, Info, ChevronDown, Filter, AlertTriangle, ChevronLeft, ChevronRight, Clock } from 'lucide-react';
import { format12h, formatDate, getCustomerName } from '../utils/formatters';
import './Appointments.css';

// Generic Portal Dropdown wrapper to prevent clipping in modals
const PortalDropdown = ({ triggerRef, children, isOpen, onClose }) => {
  const [coords, setCoords] = useState({ top: 0, left: 0, width: 0 });

  const updateCoords = () => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setCoords({
        top: rect.bottom,
        left: rect.left,
        width: rect.width
      });
    }
  };

  useEffect(() => {
    if (isOpen) {
      updateCoords();
      window.addEventListener('scroll', updateCoords, true);
      window.addEventListener('resize', updateCoords);
    }
    return () => {
      window.removeEventListener('scroll', updateCoords, true);
      window.removeEventListener('resize', updateCoords);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return createPortal(
    <div 
      className="portal-dropdown-root" 
      style={{ 
        position: 'fixed', 
        top: coords.top + 8, 
        left: coords.left, 
        width: coords.width,
        zIndex: 9999
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {children}
    </div>,
    document.body
  );
};

const Appointments = ({ appointments, customers, services, addAppointment, updateAppointmentStatus, deleteAppointment, loadMockData, searchTerm }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState('All');
  const [activeActionsId, setActiveActionsId] = useState(null);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);

  const [detailsAppointment, setDetailsAppointment] = useState(null);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (!e.target.closest('.dropdown-trigger') && !e.target.closest('.dropdown-menu')) {
        setActiveActionsId(null);
        setShowStatusDropdown(false);
      }
    };

    window.addEventListener('click', handleOutsideClick);
    return () => {
      window.removeEventListener('click', handleOutsideClick);
    };
  }, []);

  const filteredAppointments = useMemo(() => {
    // Generate O(N) lookup map for customers
    const customerLookup = customers.reduce((acc, c) => {
      acc[c.id] = c.name;
      return acc;
    }, {});

    return appointments.filter(apt => {
      const customerName = (customerLookup[apt.customerId] || '').toLowerCase();
      const matchesSearch = customerName.includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === 'All' || apt.status === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [appointments, customers, searchTerm, filterStatus]);

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') setIsModalOpen(false);
    };
    if (isModalOpen) window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isModalOpen]);

  const [selectedMonth, setSelectedMonth] = useState('January'); // Mock month selector

  return (
    <div className="appointments-page">
      <div className="section-header flex-between mb-32">
        <h1 className="section-title">Appointments</h1>
        <div className="header-actions-group" style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          {/* Status Dropdown Filter */}
          <div className="dropdown-trigger-wrapper">
            <div 
              className={`dropdown-mock dropdown-trigger ${filterStatus !== 'All' ? 'active' : ''}`}
              onClick={(e) => {
                e.stopPropagation();
                setShowStatusDropdown(!showStatusDropdown);
              }}
            >
              <Filter size={14} />
              <span>{filterStatus === 'All' ? 'All Status' : filterStatus}</span>
              <ChevronDown size={14} />
            </div>
            {showStatusDropdown && (
              <div className="dropdown-menu" style={{ top: 'calc(100% + 6px)', left: 0 }} onClick={(e) => e.stopPropagation()}>
                {['All', 'Booked', 'Ongoing', 'Done'].map(status => (
                  <div 
                    key={status} 
                    className={`dropdown-item ${filterStatus === status ? 'active' : ''}`}
                    onClick={() => {
                      setFilterStatus(status);
                      setShowStatusDropdown(false);
                    }}
                  >
                    {status}
                  </div>
                ))}
              </div>
            )}
          </div>

          <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
            <Plus size={16} strokeWidth={3} />
            <span>New Appointment</span>
          </button>
        </div>
      </div>

      {/* Timeline List */}
      {filteredAppointments.length > 0 ? (
        <div className="appointments-list-container">
          <div className="apt-list-header">
            <div>Time</div>
            <div>Client Profile</div>
            <div>Services</div>
            <div>Status</div>
            <div>Value</div>
            <div style={{textAlign: 'right'}}>Action</div>
          </div>
          
          {filteredAppointments.map(apt => (
            <div key={apt.id} className="apt-list-row" onClick={() => handleDetails(apt)}>
              {/* Time Column */}
              <div className="apt-row-time">
                <span className="time-text">{format12h(apt.time)}</span>
                <span className="date-text">{formatDate(apt.date)}</span>
              </div>
              
              {/* Client Column */}
              <div className="apt-row-client">
                <div className="client-info">
                  <span className="c-name">{getCustomerName(customers, apt.customerId)}</span>
                  <span className="c-id">#{apt.id.toString().padStart(4, '0')}</span>
                </div>
              </div>

              {/* Services Column */}
              <div className="apt-row-services">
                {(Array.isArray(apt.services) ? apt.services : [apt.service]).map(s => (
                  <span key={s} className="service-pill">{s}</span>
                ))}
              </div>

              {/* Status Column */}
              <div className="apt-row-status">
                <span className={`status-pill pill-${apt.status.toLowerCase()}`}>{apt.status}</span>
              </div>

              {/* Price Column */}
              <div className="apt-row-price">
                ₱ {apt.totalPrice ? apt.totalPrice.toFixed(2) : '0.00'}
              </div>

                  <div className="apt-row-actions" style={{ position: 'relative' }}>
                    {apt.status === 'Booked' && (
                      <button className="row-action-btn" onClick={(e) => { e.stopPropagation(); updateAppointmentStatus(apt.id, 'Ongoing'); }}>
                        <Play size={14} /> Start
                      </button>
                    )}
                    {apt.status === 'Ongoing' && (
                      <button className="row-action-btn row-action-primary" onClick={(e) => { e.stopPropagation(); updateAppointmentStatus(apt.id, 'Done'); }}>
                        <Check size={14} /> Finish
                      </button>
                    )}
                    {apt.status === 'Done' && (
                      <button className="row-action-btn row-action-primary" onClick={(e) => { e.stopPropagation(); /* Checkout handled elsewhere */ }}>
                        Checkout
                      </button>
                    )}
                  </div>
              </div>
          ))}
        </div>
      ) : (
        <div className="appointments-empty">
          <div className="empty-icon-circle">
            <CalendarIcon size={32} strokeWidth={2} />
          </div>
          <h3>Your schedule is clear</h3>
          <p>No appointments match your filters. Add a new schedule to get started.</p>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button className="btn" onClick={loadMockData}>
              Load Sample Data
            </button>
            <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
              <Plus size={16} strokeWidth={3} />
              <span>New Appointment</span>
            </button>
          </div>
        </div>
      )}

      {/* Add Modal */}
      {isModalOpen && (
        <AppointmentModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
          customers={customers}
          services={services}
          appointments={appointments}
          addAppointment={addAppointment}
        />
      )}
      
      {/* Details Modal */}
      {detailsAppointment && (
        <div className="modal-overlay" onClick={() => setDetailsAppointment(null)}>
          <div className="modal card" onClick={(e) => e.stopPropagation()}>
            <div className="flex-between mb-24">
              <h2>Appointment Details</h2>
              <span className={`status-pill pill-${detailsAppointment.status.toLowerCase()}`}>{detailsAppointment.status}</span>
            </div>
            <div className="mt-8">
              <div className="mb-24">
                <p className="text-muted" style={{ fontSize: '13px', marginBottom: '4px' }}>Client Name</p>
                <p style={{ fontSize: '16px', fontWeight: '600' }}>{getCustomerName(customers, detailsAppointment.customerId)}</p>
              </div>
              <div className="grid grid-cols-2 mb-24">
                <div>
                  <p className="text-muted" style={{ fontSize: '13px', marginBottom: '4px' }}>Date</p>
                  <p style={{ fontSize: '15px', fontWeight: '500' }}>{formatDate(detailsAppointment.date)}</p>
                </div>
                <div>
                  <p className="text-muted" style={{ fontSize: '13px', marginBottom: '4px' }}>Time</p>
                  <p style={{ fontSize: '15px', fontWeight: '500' }}>{detailsAppointment.time}</p>
                </div>
              </div>
              <div className="mb-24">
                <p className="text-muted" style={{ fontSize: '13px', marginBottom: '8px' }}>Requested Services</p>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {(Array.isArray(detailsAppointment.services) ? detailsAppointment.services : [detailsAppointment.service]).map(s => (
                    <span key={s} className="service-pill" style={{ background: '#f8fafc', padding: '6px 12px' }}>{s}</span>
                  ))}
                </div>
              </div>
              <div className="mb-24">
                <p className="text-muted" style={{ fontSize: '13px', marginBottom: '4px' }}>Total Cost</p>
                <p style={{ fontSize: '20px', fontWeight: '700', color: '#7c3aed' }}>₱ {detailsAppointment.totalPrice?.toFixed(2)}</p>
              </div>
            </div>
            <div className="modal-actions mt-32 flex-between">
              <button className="btn btn-outline text-red" onClick={() => {
                if (window.confirm("Are you sure you want to remove this appointment?")) {
                  deleteAppointment(detailsAppointment.id);
                  setDetailsAppointment(null);
                }
              }}>
                <Trash2 size={16} /> Delete Appointment
              </button>
              <button className="btn btn-primary" onClick={() => setDetailsAppointment(null)}>Done</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const CustomDatePicker = ({ value, onChange, isOpen, onOpen, onClose }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date(value || new Date()));
  const triggerRef = useRef(null);

  const handlePrevMonth = (e) => {
    e.stopPropagation();
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const handleNextMonth = (e) => {
    e.stopPropagation();
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const handleDateClick = (day) => {
    const y = currentMonth.getFullYear();
    const m = String(currentMonth.getMonth() + 1).padStart(2, '0');
    const d = String(day).padStart(2, '0');
    onChange({ target: { value: `${y}-${m}-${d}` } });
    onClose();
  };

  const daysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

  const renderDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const totalDays = daysInMonth(year, month);
    const startDay = firstDayOfMonth(year, month);
    const days = [];

    for (let i = 0; i < startDay; i++) {
      days.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
    }

    const todayStr = new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD local
    for (let d = 1; d <= totalDays; d++) {
      const m = String(month + 1).padStart(2, '0');
      const dStr = String(d).padStart(2, '0');
      const dateStr = `${year}-${m}-${dStr}`;
      const isToday = dateStr === todayStr;
      const isSelected = dateStr === value;

      days.push(
        <div 
          key={d} 
          className={`calendar-day ${isToday ? 'today' : ''} ${isSelected ? 'selected' : ''}`}
          onClick={() => handleDateClick(d)}
        >
          {d}
        </div>
      );
    }
    return days;
  };

  const displayDate = value
    ? (() => {
        const [y, m, d] = value.split('-');
        return new Date(Number(y), Number(m) - 1, Number(d)).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      })()
    : 'Select Date';

  return (
    <div className="custom-date-picker-container dropdown-trigger-wrapper">
      <div 
        ref={triggerRef}
        className={`pretty-input dropdown-trigger date-trigger ${isOpen ? 'focused' : ''}`} 
        onClick={(e) => { e.stopPropagation(); isOpen ? onClose() : onOpen(); }}
      >
        <CalendarIcon size={16} className="text-muted mr-8" />
        <span>{displayDate}</span>
        <ChevronDown size={16} className="select-arrow-icon" />
      </div>
      
      <PortalDropdown triggerRef={triggerRef} isOpen={isOpen} onClose={onClose}>
        <div className="calendar-dropdown">
          <div className="calendar-nav-header">
            <button type="button" onClick={handlePrevMonth} className="nav-btn"><ChevronLeft size={16} /></button>
            <span className="month-label">
              {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
            </span>
            <button type="button" onClick={handleNextMonth} className="nav-btn"><ChevronRight size={16} /></button>
          </div>
          <div className="calendar-grid-header">
            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => <div key={d}>{d}</div>)}
          </div>
          <div className="calendar-grid">
            {renderDays()}
          </div>
        </div>
      </PortalDropdown>
    </div>
  );
};

const CustomTimePicker = ({ value, onChange, isOpen, onOpen, onClose, appointments, selectedDate }) => {
  const triggerRef = useRef(null);
  // Generate time slots from 8:00 AM to 6:00 PM in 30-min intervals
  const timeSlots = [];
  for (let h = 8; h <= 18; h++) {
    for (const m of ['00', '30']) {
      if (h === 18 && m === '30') break;
      const hour24 = `${h.toString().padStart(2, '0')}:${m}`;
      const period = h >= 12 ? 'PM' : 'AM';
      const hour12 = h % 12 || 12;
      const label = `${hour12}:${m} ${period}`;
      timeSlots.push({ value: hour24, label });
    }
  }

  // Find booked slots for the selected date
  const bookedTimes = new Set(
    (appointments || [])
      .filter(apt => apt.date === selectedDate && apt.status !== 'Cancelled')
      .map(apt => apt.time)
  );

  const getDisplayTime = (val) => {
    if (!val) return 'Select Time';
    const [h, m] = val.split(':');
    let hour = parseInt(h);
    const period = hour >= 12 ? 'PM' : 'AM';
    hour = hour % 12 || 12;
    return `${hour}:${m} ${period}`;
  };

  return (
    <div className="custom-time-picker-container dropdown-trigger-wrapper">
      <div 
        ref={triggerRef}
        className={`pretty-input dropdown-trigger time-trigger ${isOpen ? 'focused' : ''}`} 
        onClick={(e) => { e.stopPropagation(); isOpen ? onClose() : onOpen(); }}
      >
        <Clock size={16} className="text-muted mr-8" />
        <span>{getDisplayTime(value)}</span>
        <ChevronDown size={16} className="select-arrow-icon" />
      </div>
      
      <PortalDropdown triggerRef={triggerRef} isOpen={isOpen} onClose={onClose}>
        <div className="time-slot-dropdown">
          <div className="time-slot-label">Select a time slot</div>
          <div className="time-slot-grid">
            {timeSlots.map(slot => {
              const isSelected = value === slot.value;
              const isBooked = bookedTimes.has(slot.value);
              return (
                <div
                  key={slot.value}
                  className={`time-slot ${isSelected ? 'selected' : ''} ${isBooked ? 'booked' : ''}`}
                  onClick={() => {
                    onChange({ target: { value: slot.value } });
                    onClose();
                  }}
                  title={isBooked ? 'This slot is already booked' : ''}
                >
                  <span>{slot.label}</span>
                  {isBooked && <span className="booked-dot" />}
                </div>
              );
            })}
          </div>
        </div>
      </PortalDropdown>
    </div>
  );
};

// Custom searchable dropdown for customer selection
const CustomSelectDropdown = ({ customers, value, onChange }) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const triggerRef = useRef(null);
  const panelRef = useRef(null);

  const selected = customers.find(c => c.id === value);
  const filtered = customers.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    const handler = (e) => {
      if (triggerRef.current && !triggerRef.current.contains(e.target) && 
          panelRef.current && !panelRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    window.addEventListener('mousedown', handler);
    return () => window.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className="custom-select-dropdown-wrapper">
      <div
        ref={triggerRef}
        className={`pretty-input custom-select-trigger ${open ? 'focused' : ''}`}
        onClick={() => setOpen(o => !o)}
      >
        <User size={16} className="text-muted" style={{ marginRight: 8, flexShrink: 0 }} />
        <span style={{ flex: 1, color: selected ? 'var(--text-main)' : 'var(--text-muted)' }}>
          {selected ? selected.name : 'Choose a customer...'}
        </span>
        <ChevronDown size={16} style={{ color: 'var(--text-muted)', flexShrink: 0, transition: 'transform 0.2s', transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }} />
      </div>

      <PortalDropdown triggerRef={triggerRef} isOpen={open} onClose={() => setOpen(false)}>
        <div ref={panelRef} className="custom-select-panel" style={{ width: triggerRef.current?.offsetWidth }}>
          <div className="custom-select-search">
            <Search size={14} />
            <input
              autoFocus
              placeholder="Search customer..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              onClick={e => e.stopPropagation()}
            />
          </div>
          <div className="custom-select-list">
            {filtered.length === 0 ? (
              <div className="custom-select-empty">No customers found</div>
            ) : filtered.map(c => (
              <div
                key={c.id}
                className={`custom-select-option ${value === c.id ? 'selected' : ''}`}
                onClick={() => { onChange(c.id); setOpen(false); setSearch(''); }}
              >
                <div className="cso-avatar">{c.name.charAt(0).toUpperCase()}</div>
                <span>{c.name}</span>
                {value === c.id && <Check size={14} style={{ marginLeft: 'auto', color: 'var(--primary)' }} />}
              </div>
            ))}
          </div>
        </div>
      </PortalDropdown>
    </div>
  );
};

const AppointmentModal = ({ isOpen, onClose, customers, services, appointments, addAppointment }) => {
  const [formData, setFormData] = useState({
    customerId: '',
    date: new Date().toLocaleDateString('en-CA'),
    time: '09:00',
    services: []
  });
  const [isConflict, setIsConflict] = useState(false);
  const [hasBeenTouched, setHasBeenTouched] = useState(false);
  const [openPicker, setOpenPicker] = useState(null); // 'date' | 'time' | null

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (!e.target.closest('.custom-date-picker-container') && !e.target.closest('.custom-time-picker-container')) {
        setOpenPicker(null);
      }
    };
    window.addEventListener('click', handleOutsideClick);
    return () => window.removeEventListener('click', handleOutsideClick);
  }, []);

  useEffect(() => {
    // Check for double booking
    const conflict = appointments?.some(apt => 
      apt.date === formData.date && 
      apt.time === formData.time &&
      apt.status !== 'Cancelled'
    ) || false;
    setIsConflict(conflict);
  }, [formData.date, formData.time, appointments]);

  const handleDateChange = (e) => {
    setFormData({...formData, date: e.target.value});
    setHasBeenTouched(true);
  };

  const handleTimeChange = (e) => {
    setFormData({...formData, time: e.target.value});
    setHasBeenTouched(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isConflict) {
      if (!window.confirm("Warning: This time slot is already booked. Do you want to double book anyway?")) {
        return;
      }
    }
    const totalPrice = formData.services.reduce((sum, s) => {
      const service = services.find(serv => serv.name === s);
      return sum + (service ? service.price : 0);
    }, 0);
    addAppointment({ ...formData, totalPrice });
    onClose();
  };

  const toggleService = (serviceName) => {
    const updated = formData.services.includes(serviceName)
      ? formData.services.filter(s => s !== serviceName)
      : [...formData.services, serviceName];
    setFormData({ ...formData, services: updated });
  };

  return (
    <div className="modal-overlay" onClick={() => onClose()}>
      <div className="modal card wide" onClick={(e) => e.stopPropagation()}>
        <h2>Schedule Appointment</h2>
        <form onSubmit={handleSubmit} className="apt-form mt-24">
          {(isConflict && hasBeenTouched) && (
            <div className="booking-conflict-warning">
              <AlertTriangle size={18} />
              <span>Double Booking Alert: This time slot is already reserved.</span>
            </div>
          )}
          <div className="form-grid">
            <div className="form-group col-span-full">
              <label>Select Customer</label>
              <CustomSelectDropdown
                customers={customers}
                value={formData.customerId}
                onChange={(id) => setFormData({ ...formData, customerId: id })}
              />
            </div>
            <div className="form-group">
              <label>Date</label>
              <CustomDatePicker 
                value={formData.date}
                onChange={handleDateChange}
                isOpen={openPicker === 'date'}
                onOpen={() => setOpenPicker('date')}
                onClose={() => setOpenPicker(null)}
              />
            </div>
            <div className="form-group">
              <label>Time</label>
              <CustomTimePicker 
                value={formData.time}
                onChange={handleTimeChange}
                isOpen={openPicker === 'time'}
                onOpen={() => setOpenPicker('time')}
                onClose={() => setOpenPicker(null)}
                appointments={appointments}
                selectedDate={formData.date}
              />
            </div>
          </div>

          <div className="form-group mb-32">
            <label>Select Services</label>
            <div className="services-selector">
              {services.map(s => (
                <button 
                  key={s.id}
                  type="button"
                  className={`service-option ${formData.services.includes(s.name) ? 'active' : ''}`}
                  onClick={() => toggleService(s.name)}
                >
                  <span className="option-name">{s.name}</span>
                  <span className="option-price">${s.price}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary">Schedule Appointment</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default React.memo(Appointments);

