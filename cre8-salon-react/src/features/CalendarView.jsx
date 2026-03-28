import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Filter, Plus, Clock, ChevronDown } from 'lucide-react';
import { useSalonData } from '../hooks/useSalonData';
import './CalendarView.css';

const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const CalendarView = () => {
  const { appointments, customers } = useSalonData();
  const [currentDate, setCurrentDate] = useState(new Date()); // Default to current date (2026)
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isMonthDropdownOpen, setIsMonthDropdownOpen] = useState(false);
  const [selectedServiceFilter, setSelectedServiceFilter] = useState('All');
  
  // Year state for the month picker grid
  const [pickerYear, setPickerYear] = useState(currentDate.getFullYear());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const handleMonthSelect = (mIndex) => {
    setCurrentDate(new Date(pickerYear, mIndex, 1));
    setIsMonthDropdownOpen(false);
  };

  const handleYearChange = (delta) => {
    setPickerYear(prev => prev + delta);
  };

  const calendarDays = useMemo(() => {
    const customerMap = customers.reduce((acc, c) => {
      acc[c.id] = c.name;
      return acc;
    }, {});

    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const startingDay = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1; 

    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    const days = [];

    // Previous month padding
    for (let i = 0; i < startingDay; i++) {
      const d = daysInPrevMonth - startingDay + i + 1;
      days.push({ date: d, isPrevMonth: true, events: [] });
    }

    // Current month cells
    for (let i = 1; i <= daysInMonth; i++) {
      const cellDateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      
      // Find events for this day
      const dayEvents = appointments
        .filter(a => a.date === cellDateStr)
        .filter(a => {
          if (selectedServiceFilter === 'All') return true;
          
          const servicesText = a.services.join(' ').toLowerCase();
          if (selectedServiceFilter === 'Haircut & Styling') {
            return servicesText.includes('cut') || servicesText.includes('style');
          }
          if (selectedServiceFilter === 'Coloring') {
            return servicesText.includes('color');
          }
          if (selectedServiceFilter === 'Treatments') {
            return servicesText.includes('treatment') || servicesText.includes('massage') || servicesText.includes('facial') || servicesText.includes('care') || servicesText.includes('cure');
          }
          return true;
        })
        .map(a => {
          const custName = customerMap[a.customerId] || 'Unknown';
          let type = 'purple';
          // Basic heuristic for colors based on service name
          if (a.services.some(s => s.toLowerCase().includes('cut') || s.toLowerCase().includes('style'))) type = 'pink';
          if (a.services.some(s => s.toLowerCase().includes('massage') || s.toLowerCase().includes('facial') || s.toLowerCase().includes('spa') || s.toLowerCase().includes('care'))) type = 'green';

          return {
            id: a.id,
            title: custName,
            service: a.services.join(', '),
            time: a.time,
            type: type,
            customerId: a.customerId
          };
        });

      days.push({ date: i, events: dayEvents, fullDateStr: cellDateStr, hasPopover: dayEvents.length > 3 });
    }

    // Next month padding to fill multiple of 7
    const totalCells = days.length;
    const targetCells = totalCells <= 35 ? 35 : 42; 
    const paddingNeeded = targetCells - totalCells;
    
    for (let i = 1; i <= paddingNeeded; i++) {
      days.push({ date: i, isNextMonth: true, events: [] });
    }

    return days;
  }, [year, month, appointments, customers, selectedServiceFilter]);

  const currentMonthLabel = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });

  return (
    <div className="cascal-calendar-view">
      {/* Header Area */}
      <div className="calendar-header" style={{ position: 'relative', zIndex: 50, display: 'flex', justifyContent: 'space-between' }}>
        <div className="cal-left-placeholder"></div>
        
        <div className="cal-nav-center" style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)' }}>
          <button className="cal-nav-arrow" onClick={prevMonth}>
            <ChevronLeft size={16}/>
          </button>
          
          <div className="month-dropdown-wrapper">
            <h2 className="cal-month-title" onClick={() => {
              setPickerYear(year);
              setIsMonthDropdownOpen(!isMonthDropdownOpen);
            }}>
              {currentMonthLabel}
              <ChevronDown size={18} className={`month-chevron ${isMonthDropdownOpen ? 'open' : ''}`} />
            </h2>
            
            {isMonthDropdownOpen && (
              <div className="month-picker-popover">
                <div className="picker-year-nav">
                  <button type="button" onClick={() => handleYearChange(-1)}><ChevronLeft size={16} /></button>
                  <span>{pickerYear}</span>
                  <button type="button" onClick={() => handleYearChange(1)}><ChevronRight size={16} /></button>
                </div>
                <div className="month-grid-selection">
                  {months.map((mName, idx) => {
                    const isSelected = year === pickerYear && month === idx;
                    return (
                      <button 
                        key={mName}
                        className={`month-grid-item ${isSelected ? 'active' : ''}`}
                        onClick={() => handleMonthSelect(idx)}
                      >
                        {mName.substring(0, 3)}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
          
          <button className="cal-nav-arrow" onClick={nextMonth}>
            <ChevronRight size={16}/>
          </button>
        </div>
        
        <div className="cal-actions-right" style={{position: 'relative', marginLeft: 'auto'}}>
          <button 
            className={`cal-filter-btn ${isFilterOpen ? 'active' : ''}`}
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            style={selectedServiceFilter !== 'All' ? {background: '#7c3aed', color: 'white', borderColor: '#7c3aed'} : {}}
          >
            <Filter size={16} />
          </button>
          
          {isFilterOpen && (
            <div className="dropdown-menu" style={{top: '100%', right: 0, marginTop: '8px', width: '200px'}}>
              <div className="dropdown-label">Filter by Service</div>
              <button 
                className={`dropdown-item ${selectedServiceFilter === 'All' ? 'active' : ''}`}
                onClick={() => { setSelectedServiceFilter('All'); setIsFilterOpen(false); }}
              >All Services</button>
              <button 
                className={`dropdown-item ${selectedServiceFilter === 'Haircut & Styling' ? 'active' : ''}`}
                onClick={() => { setSelectedServiceFilter('Haircut & Styling'); setIsFilterOpen(false); }}
              >Haircut & Styling</button>
              <button 
                className={`dropdown-item ${selectedServiceFilter === 'Coloring' ? 'active' : ''}`}
                onClick={() => { setSelectedServiceFilter('Coloring'); setIsFilterOpen(false); }}
              >Coloring</button>
              <button 
                className={`dropdown-item ${selectedServiceFilter === 'Treatments' ? 'active' : ''}`}
                onClick={() => { setSelectedServiceFilter('Treatments'); setIsFilterOpen(false); }}
              >Treatments</button>
            </div>
          )}
        </div>
      </div>

      {/* Grid Area */}
      <div className="calendar-grid-container card">
        <div className="calendar-days-header">
          {daysOfWeek.map(day => (
            <div key={day} className="cal-day-name">{day}</div>
          ))}
        </div>
        
        <div className="calendar-grid">
          {calendarDays.map((dayObj, index) => (
            <div key={index} className={`cal-cell ${dayObj.isPrevMonth || dayObj.isNextMonth ? 'faded' : ''}`}>
              <span className="cal-date-number">{dayObj.date}</span>
              
              <div className="cal-events-container">
                {dayObj.events.slice(0,3).map(event => (
                  <div key={event.id} className={`cal-event-card type-${event.type}`}>
                    <div className="evt-title">{event.title}</div>
                    <div className="evt-service">{event.service}</div>
                    <div className="evt-time">
                      <Clock size={10} /> {event.time}
                    </div>
                  </div>
                ))}
                {dayObj.events.length > 3 && (
                  <div className="evt-more">+{dayObj.events.length - 3} more</div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default React.memo(CalendarView);
