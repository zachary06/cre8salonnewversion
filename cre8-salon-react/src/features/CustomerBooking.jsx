import React, { useState, useEffect } from 'react';
import { 
  ChevronRight, ChevronLeft, Check, Calendar as CalendarIcon, 
  Clock, User, Scissors, X, Palette, Waves, Smile, Hand, Sparkles, ChevronDown
} from 'lucide-react';
import './Login.css';
import './CustomerBooking.css';
import { format12h, getServiceImage } from '../utils/formatters';
import { useForm } from '../hooks/useForm';

// Redundant getServiceImage removed (now using shared utility)


const CustomDatePicker = ({ value, onChange, isOpen, onOpen, onClose }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date(value || new Date()));

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

    const todayStr = new Date().toLocaleDateString('en-CA');
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
      <div className="pretty-input dropdown-trigger date-trigger" onClick={(e) => { e.stopPropagation(); isOpen ? onClose() : onOpen(); }}>
        <CalendarIcon size={16} className="text-muted mr-8" />
        <span>{displayDate}</span>
        <ChevronDown size={16} className="select-arrow-icon" />
      </div>
      
      {isOpen && (
        <div className="calendar-dropdown" onClick={(e) => e.stopPropagation()}>
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
      )}
    </div>
  );
};


const TIME_SLOTS = [
  '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
  '11:00', '11:30', '13:00', '13:30', '14:00', '14:30',
  '15:00', '15:30', '16:00', '16:30', '17:00', '17:30',
];



const CustomerBooking = ({ services, addAppointment, customers, addCustomer, appointments, onExit }) => {
  const [step, setStep] = useState(1);
  const { values: formData, handleChange, setValues: setFormData } = useForm({
    name: '',
    contact: '',
    email: '',
    date: new Date().toLocaleDateString('en-CA'),
    time: '',
    services: [],
    notes: ''
  });
  const [openPicker, setOpenPicker] = useState(null); // 'date' | null

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (!e.target.closest('.custom-date-picker-container')) {
        setOpenPicker(null);
      }
    };
    window.addEventListener('click', handleOutsideClick);
    return () => window.removeEventListener('click', handleOutsideClick);
  }, []);

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onExit();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onExit]);

  const nextStep = () => {
    if (step === 1 && !formData.name) return alert('Please enter your name');
    if (step === 2 && formData.services.length === 0) return alert('Please select at least one service');
    if (step === 3 && (!formData.date || !formData.time)) return alert('Please select date and time');
    setStep(step + 1);
  };

  const prevStep = () => setStep(step - 1);

  const toggleService = (serviceName) => {
    const updated = formData.services.includes(serviceName)
      ? formData.services.filter(s => s !== serviceName)
      : [...formData.services, serviceName];
    setFormData({ ...formData, services: updated });
  };

  const calculateTotal = () =>
    formData.services.reduce((sum, s) => {
      const svc = services.find(sv => sv.name === s);
      return sum + (svc ? svc.price : 0);
    }, 0);

  const handleSubmit = () => {
    let customerId = customers.find(c => c.name.toLowerCase() === formData.name.toLowerCase())?.id;
    if (!customerId) {
      customerId = Date.now();
      addCustomer({ 
        name: formData.name, 
        contact: formData.contact, 
        email: formData.email, 
        id: customerId 
      });
    }
    addAppointment({
      customerId,
      date: formData.date,
      time: formData.time,
      services: formData.services,
      totalPrice: calculateTotal(),
      notes: formData.notes
    });
    setStep(5);
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="cb-step fade-in">
            <div className="cb-step-head">
              <h2>Your Information</h2>
              <p>Enter your contact details.</p>
            </div>
            <div className="cb-form-group">
              <label htmlFor="cb-name">Full Name <span className="required">*</span></label>
              <input
                id="cb-name"
                name="name"
                placeholder="Your full name"
                value={formData.name}
                onChange={handleChange}
                autoComplete="name"
                required
              />
            </div>
            <div className="cb-form-group">
              <label htmlFor="cb-contact">Contact Number <span className="optional">(Optional)</span></label>
              <input
                id="cb-contact"
                name="contact"
                placeholder="Phone number"
                value={formData.contact}
                onChange={handleChange}
                autoComplete="tel"
              />
            </div>
            <div className="cb-form-group">
              <label htmlFor="cb-email">Email Address <span className="optional">(Optional)</span></label>
              <input
                id="cb-email"
                name="email"
                placeholder="Email address"
                value={formData.email}
                onChange={handleChange}
                autoComplete="email"
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="cb-step fade-in">
            <div className="cb-step-head">
              <h2>Select Services</h2>
              <p>Choose your treatments.</p>
            </div>
            <div className="cb-services-list">
              {services.filter(s => s.active !== false).map(s => {
                const isActive = formData.services.includes(s.name);
                return (
                  <button
                    key={s.id}
                    type="button"
                    className={`cb-service-row ${isActive ? 'active' : ''}`}
                    onClick={() => toggleService(s.name)}
                  >
                    <div className="cb-service-img-sm">
                      <img src={getServiceImage(s.name)} alt={s.name} />
                    </div>
                    <div className="cb-service-info">
                      <span className="cb-svc-name">{s.name}</span>
                      <span className="cb-svc-price">₱ {s.price}</span>
                    </div>
                    <div className="cb-service-check">
                      <Check className="cb-check-icon" size={14} strokeWidth={4} />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="cb-step fade-in">
            <div className="cb-step-head">
              <h2>Date & Time</h2>
              <p>Pick a visit schedule.</p>
            </div>
            <div className="cb-form-group">
              <label htmlFor="cb-date">Preferred Date</label>
              <CustomDatePicker 
                id="cb-date"
                value={formData.date}
                onChange={e => setFormData({...formData, date: e.target.value})}
                isOpen={openPicker === 'date'}
                onOpen={() => setOpenPicker('date')}
                onClose={() => setOpenPicker(null)}
              />
            </div>
            <div className="cb-form-group">
              <label>Available Time Slots</label>
              <div className="cb-time-slots-scroll">
                <div className="cb-time-grid">
                  {TIME_SLOTS.map(t => {
                    const isBooked = appointments?.some(apt => apt.date === formData.date && apt.time === t && apt.status !== 'Cancelled');
                    return (
                      <button
                        key={t}
                        type="button"
                        disabled={isBooked}
                        className={`cb-time-pill ${formData.time === t ? 'active' : ''} ${isBooked ? 'booked' : ''}`}
                        onClick={() => !isBooked && setFormData({ ...formData, time: t })}
                      >
                        {format12h(t)}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="cb-step fade-in">
            <div className="cb-step-head">
              <h2>Confirm Booking</h2>
              <p>Review your appointment.</p>
            </div>
            <div className="cb-summary-card">
              <div className="cb-summary-row">
                <div className="cb-summary-icon"><User size={24} /></div>
                <div>
                  <span className="cb-summary-label">Customer</span>
                  <p className="cb-summary-value">{formData.name}</p>
                  {formData.email && <p className="cb-summary-subtext">{formData.email}</p>}
                </div>
              </div>
              <div className="cb-summary-row">
                <div className="cb-summary-icon"><CalendarIcon size={24} /></div>
                <div>
                  <span className="cb-summary-label">Date & Time</span>
                  <p className="cb-summary-value">{formData.date} &middot; {format12h(formData.time)}</p>
                </div>
              </div>
              <div className="cb-summary-row">
                <div className="cb-summary-icon"><Scissors size={24} /></div>
                <div>
                  <span className="cb-summary-label">Services</span>
                  <div className="cb-summary-tags">
                    {formData.services.map(s => (
                      <span key={s} className="cb-summary-tag">{s}</span>
                    ))}
                  </div>
                </div>
              </div>
              <div className="cb-summary-total">
                <span>Total Due</span>
                <span className="cb-total-amt">₱ {calculateTotal().toFixed(2)}</span>
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="cb-success fade-in">
            <div className="cb-success-glow">
              <Check size={40} strokeWidth={3} />
            </div>
            <h2>You're All Set!</h2>
            <p>Thank you, <strong>{formData.name}</strong>. Your appointment on <strong>{formData.date}</strong> at <strong>{format12h(formData.time)}</strong> is confirmed.</p>
            <button className="btn btn-primary cb-done-btn" onClick={onExit}>Done</button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="login-wrapper cb-layout">
      {/* Background Aurora Blobs from Login.css */}
      <div className="aurora-bg-container">
        <div className="aurora-blob aurora-1"></div>
        <div className="aurora-blob aurora-2"></div>
        <div className="aurora-blob aurora-3"></div>
      </div>
      
      {/* Main Content Area */}
      <div className="login-layout cb-main">
        <div className="login-content" style={{ maxWidth: '600px' }}>
          <div className="glass-card cb-card">
          <div className="cb-card-header">
            <img src={`${import.meta.env.BASE_URL}logo.png`} alt="Logo" className="cb-logo" />
          </div>
          {/* Close Button Inside Card */}
          <button className="cb-card-close" onClick={onExit}>
            <X size={16} />
          </button>


          {/* Step Content */}
          <div className="cb-content">
            {renderStep()}
          </div>

          {/* Footer Actions */}
          {step < 5 && (
            <div className="cb-footer">
              <button
                className="btn cb-back-btn"
                onClick={prevStep}
                style={{ visibility: step === 1 ? 'hidden' : 'visible' }}
              >
                <ChevronLeft size={16} />
                Back
              </button>
              <button
                className="btn btn-primary"
                onClick={step === 4 ? handleSubmit : nextStep}
              >
                {step === 4 ? 'Confirm & Book' : 'Next'}
                {step < 4 && <ChevronRight size={16} />}
              </button>
            </div>
          )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(CustomerBooking);
