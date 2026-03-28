import React, { useState, useMemo, useCallback } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area, PieChart, Pie, Cell
} from 'recharts';
import { TrendingUp, ChevronDown, ArrowUpRight, Calendar, Scissors, DollarSign } from 'lucide-react';
import { getServiceImage } from '../utils/formatters';
import './Reports.css';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

// Redundant getServiceImage removed (now using shared utility)


// Reusable filter dropdown
const FilterDropdown = ({ options, value, onChange }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="report-filter-wrapper" style={{ position: 'relative' }}>
      <div className="dropdown-mock" onClick={(e) => { e.stopPropagation(); setOpen(!open); }} style={{ cursor: 'pointer' }}>
        <span>{value}</span>
        <ChevronDown size={16} />
      </div>
      {open && (
        <div className="dropdown-menu" style={{ top: 'calc(100% + 6px)', right: 0, minWidth: '130px', zIndex: 50 }} onClick={(e) => e.stopPropagation()}>
          {options.map(opt => (
            <button key={opt} className={`dropdown-item ${value === opt ? 'active' : ''}`} onClick={() => { onChange(opt); setOpen(false); }}>
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const Reports = ({ appointments = [], transactions = [], services = [] }) => {
  const [salesPeriod, setSalesPeriod] = useState('Monthly');
  const [clientPeriod, setClientPeriod] = useState('Monthly');
  const [aptPeriod, setAptPeriod] = useState('Monthly');

  const periodOptions = ['Weekly', 'Monthly', 'Yearly'];

  // --- Computed KPIs ---
  const totalRevenue = useMemo(() => transactions.reduce((sum, t) => sum + (t.amount || 0), 0), [transactions]);
  const totalAppointments = appointments.length;
  const completedApts = appointments.filter(a => a.status === 'Done' || a.status === 'Paid').length;
  const bookedApts = appointments.filter(a => a.status === 'Booked').length;
  const cancelledApts = appointments.filter(a => a.status === 'Cancelled').length;
  const pendingApts = appointments.filter(a => a.status !== 'Done' && a.status !== 'Paid' && a.status !== 'Cancelled').length;

  // --- Build month-bucket data from appointments ---
  const buildMonthData = useCallback((period) => {
    if (period === 'Yearly') {
      const years = {};
      appointments.forEach(a => {
        const y = a.date?.split('-')[0] || '?';
        years[y] = (years[y] || 0) + (a.totalPrice || 0);
      });
      return Object.entries(years).map(([name, value]) => ({ name, value: Math.round(value) }));
    }
    if (period === 'Weekly') {
      const result = [];
      const today = new Date();
      for (let i = 6; i >= 0; i--) {
        const d = new Date(today); d.setDate(today.getDate() - i);
        const key = d.toISOString().split('T')[0];
        const day = d.toLocaleDateString('en-US', { weekday: 'short' });
        const val = appointments.filter(a => a.date === key).reduce((s, a) => s + (a.totalPrice || 0), 0);
        result.push({ name: day, value: Math.round(val) });
      }
      return result;
    }
    const monthMap = {};
    MONTHS.forEach(m => monthMap[m] = 0);
    appointments.forEach(a => {
      const monthIdx = parseInt(a.date?.split('-')[1] || '1') - 1;
      monthMap[MONTHS[monthIdx]] += (a.totalPrice || 0);
    });
    return MONTHS.map(m => ({ name: m, value: Math.round(monthMap[m]) })).filter(d => d.value > 0 || MONTHS.indexOf(d.name) <= new Date().getMonth());
  }, [appointments]);

  const salesChartData = useMemo(() => buildMonthData(salesPeriod), [buildMonthData, salesPeriod]);

  // Bar chart: appointment counts by period
  const buildBarData = useCallback((period) => {
    if (period === 'Yearly') {
      const years = {};
      appointments.forEach(a => { const y = a.date?.split('-')[0] || '?'; years[y] = (years[y] || 0) + 1; });
      return Object.entries(years).map(([name, value]) => ({ name, value }));
    }
    if (period === 'Weekly') {
      const result = [];
      const today = new Date();
      for (let i = 6; i >= 0; i--) {
        const d = new Date(today); d.setDate(today.getDate() - i);
        const key = d.toISOString().split('T')[0];
        const day = d.toLocaleDateString('en-US', { weekday: 'short' });
        result.push({ name: day, value: appointments.filter(a => a.date === key).length });
      }
      return result;
    }
    const monthMap = {};
    MONTHS.forEach(m => monthMap[m] = 0);
    appointments.forEach(a => {
      const monthIdx = parseInt(a.date?.split('-')[1] || '1') - 1;
      monthMap[MONTHS[monthIdx]] += 1;
    });
    return MONTHS.map(m => ({ name: m, value: monthMap[m] })).filter((_, i) => i <= new Date().getMonth());
  }, [appointments]);

  const barChartData = useMemo(() => buildBarData(clientPeriod), [buildBarData, clientPeriod]);

  // Pie chart: appointment statuses
  const pieData = useMemo(() => [
    { name: 'Completed', value: completedApts, color: '#7c3aed' },
    { name: 'Booked', value: bookedApts, color: '#10b981' },
    { name: 'Pending', value: pendingApts, color: '#f59e0b' },
    { name: 'Cancelled', value: cancelledApts, color: '#f1f5f9' },
  ].filter(p => p.value > 0), [completedApts, bookedApts, pendingApts, cancelledApts]);

  // Top services: count how many times each service appears in completed appointments
  const topServices = useMemo(() => {
    const counts = {};
    const revenue = {};
    appointments.forEach(apt => {
      (apt.services || []).forEach(svcName => {
        counts[svcName] = (counts[svcName] || 0) + 1;
        const svcObj = services.find(s => s.name === svcName);
        revenue[svcName] = (revenue[svcName] || 0) + (svcObj ? svcObj.price : 0);
      });
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
      .map(([name, count]) => ({ name, count, revenue: revenue[name] || 0 }));
  }, [appointments, services]);

  const totalRevStr = `₱ ${totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  return (
    <div className="cascal-reports">

      {/* KPI Row */}
      <div className="reports-top-row">
        <div className="card reports-kpi-card">
          <div className="kpi-header">
            <div className="kpi-icon-wrapper bg-indigo-light"><TrendingUp size={20} /></div>
            <div className="kpi-title-row">
              <span className="kpi-title">Total Revenue</span>
            </div>
          </div>
          <h2 className="kpi-value">{totalRevStr}</h2>
          <div className="kpi-trend">
            <span className="trend-up"><TrendingUp size={12} strokeWidth={3}/> Live</span>
            <span className="trend-text">From all transactions</span>
          </div>
        </div>

        <div className="card reports-kpi-card">
          <div className="kpi-header">
            <div className="kpi-icon-wrapper bg-orange-light"><Calendar size={20} /></div>
            <div className="kpi-title-row"><span className="kpi-title">Total Appointments</span></div>
          </div>
          <h2 className="kpi-value">{totalAppointments}</h2>
          <div className="kpi-trend">
            <span className="trend-up">{completedApts} completed</span>
            <span className="trend-text">{bookedApts} still booked</span>
          </div>
        </div>

        <div className="card reports-kpi-card">
          <div className="kpi-header">
            <div className="kpi-icon-wrapper bg-green-light"><Scissors size={20} /></div>
            <div className="kpi-title-row"><span className="kpi-title">Services Available</span></div>
          </div>
          <h2 className="kpi-value">{services.length}</h2>
          <div className="kpi-trend">
            <span className="trend-up">Active menu</span>
            <span className="trend-text">In services list</span>
          </div>
        </div>

        <div className="card reports-kpi-card">
          <div className="kpi-header">
            <div className="kpi-icon-wrapper bg-pink-light"><DollarSign size={20} /></div>
            <div className="kpi-title-row"><span className="kpi-title">Avg. Revenue / Apt</span></div>
          </div>
          <h2 className="kpi-value">{totalAppointments ? `₱ ${(totalRevenue / totalAppointments).toFixed(2)}` : '₱ 0.00'}</h2>
          <div className="kpi-trend">
            <span className="trend-up">Per appointment</span>
            <span className="trend-text">Based on transactions</span>
          </div>
        </div>
      </div>

      {/* Middle Row */}
      <div className="reports-middle-row">
        {/* Top Services */}
        <div className="card total-sales-card">
          <div className="flex-between mb-16">
            <h3 className="card-title">Top Services</h3>
          </div>
          <h2 className="kpi-value mb-12">{totalRevStr}</h2>
          <div className="kpi-trend mb-24">
            <span className="trend-up"><TrendingUp size={12} strokeWidth={3}/> Based on bookings</span>
          </div>
          <div className="sales-subcards-grid">
            {topServices.length > 0 ? topServices.map((svc) => (
              <div className="sales-subcard" key={svc.name}>
                <div className="subcard-img">
                  <img src={getServiceImage(svc.name)} alt={svc.name} />
                </div>
                <div className="subcard-info">
                  <span className="sc-val">₱ {svc.revenue.toLocaleString()}</span>
                  <span className="sc-name">{svc.name}</span>
                </div>
                <ArrowUpRight size={16} className="sc-arrow" />
              </div>
            )) : (
              <div style={{ color: '#94a3b8', fontSize: 13, gridColumn: '1 / -1', padding: '16px 0' }}>
                No appointment data yet.
              </div>
            )}
          </div>
        </div>

        {/* Sales Overview Chart */}
        <div className="card overview-chart-card">
          <div className="flex-between mb-24">
            <h3 className="card-title">Total Sales Overview</h3>
            <FilterDropdown options={periodOptions} value={salesPeriod} onChange={setSalesPeriod} />
          </div>
          <div className="chart-container" style={{ width: '100%', height: 260, minWidth: 0 }}>
            <ResponsiveContainer minWidth={0}>
              <AreaChart data={salesChartData} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorOverview" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-muted)', fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--text-muted)', fontSize: 12 }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)', borderRadius: '8px', color: 'var(--text-main)' }}
                  itemStyle={{ color: 'var(--text-main)' }}
                  cursor={false}
                  formatter={(v) => [`₱ ${v}`, 'Revenue']} 
                />
                <Area type="monotone" dataKey="value" stroke="var(--primary)" strokeWidth={3} fillOpacity={1} fill="url(#colorOverview)" dot={{ r: 4, fill: "var(--bg-card)", stroke: "var(--primary)", strokeWidth: 2 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="reports-bottom-row">
        {/* Appointments Bar Chart */}
        <div className="card bar-chart-card">
          <div className="flex-between mb-24">
            <h3 className="card-title">Appointments Over Time</h3>
            <FilterDropdown options={periodOptions} value={clientPeriod} onChange={setClientPeriod} />
          </div>
          <div style={{ width: '100%', height: 260, minWidth: 0 }}>
            <ResponsiveContainer minWidth={0}>
              <BarChart data={barChartData} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-muted)', fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--text-muted)', fontSize: 12 }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)', borderRadius: '8px', color: 'var(--text-main)' }}
                  itemStyle={{ color: 'var(--text-main)' }}
                  cursor={false}
                  formatter={(v) => [v, 'Appointments']} 
                />
                <Bar dataKey="value" fill="var(--primary)" radius={[6, 6, 6, 6]} barSize={12} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Appointment Status Donut */}
        <div className="card donut-chart-card">
          <div className="flex-between mb-24">
            <h3 className="card-title">Appointment Status</h3>
            <FilterDropdown options={periodOptions} value={aptPeriod} onChange={setAptPeriod} />
          </div>
          <div className="donut-content">
            <div className="donut-chart-wrapper" style={{ width: '220px', height: '220px', minWidth: 0 }}>
              <ResponsiveContainer minWidth={0}>
                <PieChart>
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)', borderRadius: '8px', color: 'var(--text-main)' }}
                    itemStyle={{ color: 'var(--text-main)' }}
                  />
                  <Pie data={pieData.length > 0 ? pieData : [{ name: 'No Data', value: 1, color: '#e2e8f0' }]}
                    cx="50%" cy="50%" innerRadius={70} outerRadius={90} paddingAngle={2} dataKey="value" stroke="none">
                    {(pieData.length > 0 ? pieData : [{ color: '#e2e8f0' }]).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="donut-inner-text">
                <span className="dit-label">Total</span>
                <span className="dit-val">{totalAppointments}</span>
              </div>
            </div>
            <div className="donut-legend">
              {pieData.map((item, index) => (
                <div className="legend-item" key={index}>
                  <div className="legend-indicator" style={{ backgroundColor: item.color }}></div>
                  <span className="legend-name">{item.name}</span>
                  <span className="legend-val">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(Reports);
