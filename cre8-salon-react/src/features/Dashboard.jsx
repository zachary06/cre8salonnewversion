import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  MoreHorizontal, ChevronDown, 
  TrendingUp, Calendar as CalendarIcon, 
  Download, ExternalLink, Filter, Eye
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer 
} from 'recharts';
import { useSalonData } from '../hooks/useSalonData';
import { getServiceImage } from '../utils/formatters';
import './Dashboard.css';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const sparklineData = {
  kpi1: [
    { v: 40 }, { v: 60 }, { v: 45 }, { v: 70 }, { v: 55 }, { v: 80 }, { v: 75 }
  ],
  kpi2: [
    { v: 30 }, { v: 25 }, { v: 40 }, { v: 35 }, { v: 50 }, { v: 45 }, { v: 60 }
  ],
  kpi3: [
    { v: 50 }, { v: 55 }, { v: 52 }, { v: 58 }, { v: 54 }, { v: 62 }, { v: 65 }
  ]
};

const Dashboard = ({ setActiveSection }) => {
  const { services, appointments, customers, transactions } = useSalonData();
  const [timeframe, setTimeframe] = useState('Monthly');
  const [showTimeframeDropdown, setShowTimeframeDropdown] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(MONTHS[new Date().getMonth()]);
  const [showMonthDropdown, setShowMonthDropdown] = useState(false);
  const [activeMenu, setActiveMenu] = useState(null);

  // Dynamic KPI Calculations
  const totalSales = useMemo(() => transactions.reduce((sum, tx) => sum + (tx.amount || 0), 0), [transactions]);
  
  // Occupancy (Simplified: % of booked apps vs target 100/mo)
  const occupancy = useMemo(() => Math.min(100, (appointments.length / 100) * 100).toFixed(2), [appointments.length]);
  
  // Returning Client Rate
  const returningRate = useMemo(() => {
    const clientBookingCounts = (appointments || []).reduce((acc, app) => {
      if (app && app.customerId) {
        acc[app.customerId] = (acc[app.customerId] || 0) + 1;
      }
      return acc;
    }, {});
    const returningClients = Object.values(clientBookingCounts).filter(count => count > 1).length;
    return (customers && customers.length > 0) ? ((returningClients / customers.length) * 100).toFixed(0) : 0;
  }, [appointments, customers]);

  // Chart Data Generation
  const chartData = useMemo(() => {
    if (timeframe === 'Yearly') {
      const years = {};
      (transactions || []).forEach(tx => {
        if (tx && tx.date) {
          const y = tx.date.split('-')[0];
          years[y] = (years[y] || 0) + (tx.amount || 0);
        }
      });
      return Object.keys(years).sort().map(y => ({ name: y, value: years[y] }));
    }
    
    if (timeframe === 'Monthly') {
      const months = Array(12).fill(0);
      (transactions || []).forEach(tx => {
        if (tx && tx.date) {
          const m = parseInt(tx.date.split('-')[1]) - 1;
          if (m >= 0 && m < 12) months[m] += (tx.amount || 0);
        }
      });
      return MONTHS.map((name, i) => ({ name, value: months[i] }));
    }

    // Weekly (Last 7 days)
    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const data = Array(7).fill(0).map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return { 
        name: weekDays[d.getDay()], 
        dateStr: d.toISOString().split('T')[0],
        value: 0 
      };
    });
    (transactions || []).forEach(tx => {
      const day = data.find(d => d.dateStr === tx.date);
      if (day) day.value += (tx.amount || 0);
    });
    return data;
  }, [transactions, timeframe]);

  // Dynamic Date Generation for Calendar Strip (Starts from selected month)
  const calendarDays = useMemo(() => {
  const today = new Date();
  const startDay = new Date();
  const monthIdx = MONTHS.indexOf(selectedMonth);
  const calendarDaysArr = [];
  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  for (let i = 0; i < 7; i++) {
    const d = new Date(startDay);
    d.setDate(startDay.getDate() + i);
    
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;
    
    const dayAppointments = (appointments || []).filter(a => a && a.date === dateStr);
    
    calendarDaysArr.push({
      dateStr,
      dayNum: d.getDate(),
      dayName: (i === 0 && monthIdx === today.getMonth()) ? 'Today' : daysOfWeek[d.getDay()],
      isToday: i === 0 && d.toDateString() === today.toDateString(),
      hasAppointments: dayAppointments.length > 0,
      appointmentCount: dayAppointments.length
    });
  }
  return calendarDaysArr;
  }, [selectedMonth, appointments]);

  // Top Services Calculation
  const topServicesData = useMemo(() => {
    const serviceCounts = (appointments || []).reduce((acc, app) => {
      if (app && app.services) {
        (app.services || []).forEach(svcName => {
          acc[svcName] = (acc[svcName] || 0) + 1;
        });
      }
      return acc;
    }, {});

    return Object.entries(serviceCounts)
      .map(([name, count]) => {
        const svcObj = services.find(s => s.name === name);
        return {
          name,
          count,
          price: svcObj ? svcObj.price : 0,
          image: getServiceImage(name)
        };
      })
      .sort((a, b) => b.count - a.count)
      .slice(0, 3);
  }, [appointments, services]);

  // Ref for clicking outside
  const dashboardRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('.dropdown-trigger') && !e.target.closest('.dashboard-dropdown')) {
        setShowTimeframeDropdown(false);
        setShowMonthDropdown(false);
        setActiveMenu(null);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const renderDropdown = (options, onSelect) => (
    <div className="dashboard-dropdown">
      {options.map(opt => (
        <div key={opt} className="dropdown-item" onClick={() => {
          onSelect(opt);
          setActiveMenu(null);
          setShowTimeframeDropdown(false);
          setShowMonthDropdown(false);
        }}>
          {opt}
        </div>
      ))}
    </div>
  );

  const renderIconMenu = () => (
    <div className="dashboard-dropdown icon-menu">
      <div className="dropdown-item"><Eye size={14} /> View Details</div>
      <div className="dropdown-item"><Download size={14} /> Download Report</div>
      <div className="dropdown-divider"></div>
      <div className="dropdown-item"><ExternalLink size={14} /> Share</div>
    </div>
  );

  const renderSparkline = (data, color) => (
    <div className="sparkline-container">
      <AreaChart width={80} height={32} data={data}>
        <Area 
          type="monotone" 
          dataKey="v" 
          stroke={color} 
          fill={color} 
          fillOpacity={0.15} 
          strokeWidth={2}
        />
      </AreaChart>
    </div>
  );

  return (
    <div className="cascal-dashboard" ref={dashboardRef}>
      <div className="dashboard-left">
        {/* KPIs */}
        <div className="kpi-row">
          {[
            { id: 'kpi1', title: 'Online sales', value: `₱ ${totalSales.toLocaleString()}`, trend: '12%', color: '#10b981' },
            { id: 'kpi2', title: 'Occupancy rate', value: `${occupancy}%`, trend: '5%', color: '#3b82f6' },
            { id: 'kpi3', title: 'Returning client rate', value: `${returningRate}%`, trend: '8%', color: '#7c3aed' }
          ].map(kpi => (
            <div key={kpi.id} className="card kpi-card">
              <div className="kpi-header">
                <span className="kpi-title">{kpi.title}</span>
              </div>
              <h2 className="kpi-value">{kpi.value}</h2>
              <div className="kpi-footer">
                <div className="trend-badge positive">
                  <TrendingUp size={12} strokeWidth={3} />
                  <span>{kpi.trend}</span>
                </div>
                {renderSparkline(sparklineData[kpi.id], kpi.color)}
              </div>
            </div>
          ))}
        </div>

        {/* Main Chart */}
        <div className="card main-chart-card">
          <div className="flex-between mb-24">
            <h3 className="card-title">Recent sales</h3>
            <div className="dropdown-trigger-wrapper">
              <div 
                className="dropdown-mock dropdown-trigger" 
                onClick={() => setShowTimeframeDropdown(!showTimeframeDropdown)}
              >
                <span>{timeframe}</span>
                <ChevronDown size={16} />
              </div>
              {showTimeframeDropdown && renderDropdown('timeframe', ['Weekly', 'Monthly', 'Yearly'], setTimeframe)}
            </div>
          </div>
          <div style={{ width: '100%', height: 300, position: 'relative', minWidth: 0 }}>
            <ResponsiveContainer minWidth={0}>
              <AreaChart data={chartData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#7c3aed" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-muted)', fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--text-muted)', fontSize: 12 }} tickFormatter={(value) => timeframe === 'Yearly' ? `${value/1000}k` : `${value/1000}k`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)', borderRadius: '8px', color: 'var(--text-main)' }}
                  itemStyle={{ color: 'var(--text-main)' }}
                  cursor={false}
                />
                <Area type="monotone" dataKey="value" stroke="var(--primary)" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Services */}
        <div className="top-services-section">
          <div className="flex-between mb-16">
            <h3 className="card-title">Top service</h3>
            <button className="text-btn" onClick={() => setActiveSection('services')}>View All</button>
          </div>
          <div className="service-cards-grid">
            {topServicesData.length === 0 ? (
              <p className="text-muted" style={{ padding: '20px' }}>No booking data yet.</p>
            ) : topServicesData.map((svc, idx) => (
              <div key={idx} className="service-card">
                 <div className="service-img-wrapper">
                   <img src={svc.image} alt={svc.name} />
                 </div>
                 <div className="service-info">
                   <h4 className="service-name">{svc.name}</h4>
                   <div className="service-meta">
                     <span className="s-price">Price: <span className="s-price-val">₱ {svc.price.toFixed(2)}</span></span>
                   </div>
                 </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="dashboard-right">
        {/* Calendar Widget */}
        <div className="card right-panel-card">
          <div className="flex-between mb-16">
            <h3 className="card-title">Upcoming appointments</h3>
            <div className="dropdown-trigger-wrapper">
              <div 
                className="dropdown-mock sm dropdown-trigger"
                onClick={() => setShowMonthDropdown(!showMonthDropdown)}
              >
                <CalendarIcon size={12} />
                <span>{selectedMonth}</span>
                <ChevronDown size={12} />
              </div>
              {showMonthDropdown && renderDropdown('month', MONTHS, setSelectedMonth)}
            </div>
          </div>
          <div className="calendar-strip">
            {calendarDays.map((day) => (
              <div key={day.dateStr} className={`cal-day ${day.isToday ? 'active' : ''}`}>
                <span>{day.dayName}</span>
                <span className="date">{day.dayNum}</span>
                {day.hasAppointments && (
                  <span className={`dot ${day.appointmentCount > 2 ? 'blue-mix' : 'orange'}`}></span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Our Services */}
        <div className="card right-panel-card activity-card">
          <div className="flex-between mb-24">
            <h3 className="card-title">Our Services</h3>
            <div className="dropdown-trigger-wrapper">
              <MoreHorizontal 
                size={16} 
                className="text-muted dropdown-trigger" 
                onClick={() => setActiveMenu(activeMenu === 'activity' ? null : 'activity')}
              />
              {activeMenu === 'activity' && renderIconMenu('activity')}
            </div>
          </div>
          
          <div className="activity-list">
            {services.slice(0, 6).map((service, idx) => {
              const colors = ['#7c3aed', '#10b981', '#ef4444', '#f59e0b', '#4f46e5', '#ec4899', '#06b6d4'];
              const color = colors[idx % colors.length];
              return (
                <div key={service.id || idx} className="activity-item">
                  <div className="act-border" style={{backgroundColor: color}}></div>
                  <div className="act-details">
                    <span className="act-title">{service.name}</span>
                    <span className="act-date">Available Service</span>
                  </div>
                  <div className="act-price">₱ {service.price}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(Dashboard);
