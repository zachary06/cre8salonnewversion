import React, { useState, useMemo } from 'react';
import { CreditCard, History, CheckCircle2, Receipt, AlertCircle, ShoppingBag, MoreHorizontal, TrendingUp, DollarSign, Search } from 'lucide-react';
import { formatDate, format12h, getCustomerName, getCustomerPhone } from '../utils/formatters';
import './Payment.css';

const Payment = ({ appointments, customers, transactions, addTransaction, setActiveSection, loadMockData }) => {
  const [activeTab, setActiveTab] = useState('Pending');
  const [searchTerm, setSearchTerm] = useState('');
  const [detailsAppointment, setDetailsAppointment] = useState(null);
  const [detailsTransaction, setDetailsTransaction] = useState(null);

  const customerMap = useMemo(() => {
    return customers.reduce((acc, c) => {
      acc[c.id] = c;
      return acc;
    }, {});
  }, [customers]);

  const pendingPayments = useMemo(() => {
    const searchLower = searchTerm.toLowerCase();
    return appointments.filter(a => {
      if (a.status !== 'Done') return false;
      const customer = customerMap[a.customerId];
      return customer ? customer.name.toLowerCase().includes(searchLower) : false;
    });
  }, [appointments, customerMap, searchTerm]);
  
  const completedPayments = useMemo(() => {
    const searchLower = searchTerm.toLowerCase();
    return transactions.filter(t => 
       t.customerName.toLowerCase().includes(searchLower) ||
       t.service.toLowerCase().includes(searchLower)
    );
  }, [transactions, searchTerm]);

  // Summary logic
  const totalRevenue = useMemo(() => transactions.reduce((sum, t) => sum + t.amount, 0), [transactions]);
  const pendingCount = pendingPayments.length;
  const totalTxns = transactions.length;



  const handlePayment = (apt) => {
    if (window.confirm(`Process payment of ₱${apt.totalPrice.toFixed(2)} for ${getCustomerName(customers, apt.customerId)}?`)) {
      addTransaction({
        appointmentId: apt.id,
        customerId: apt.customerId,
        customerName: getCustomerName(customers, apt.customerId),
        service: Array.isArray(apt.services) ? apt.services.join(', ') : apt.service,
        amount: apt.totalPrice,
        date: new Date().toISOString().split('T')[0],
        time: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
      });
    }
  };

  return (
    <div className="payment-page fade-in">

      {/* Top Row: KPIs - matching Reports style */}
      <div className="reports-top-row mb-32">
        <div className="card reports-kpi-card">
          <div className="kpi-header">
            <div className="kpi-icon-wrapper bg-indigo-light">
              <DollarSign size={20} />
            </div>
            <div className="kpi-title-row">
              <span className="kpi-title">Total Revenue</span>
            </div>
          </div>
          <h2 className="kpi-value">₱ {totalRevenue.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</h2>
          <div className="kpi-trend">
            <span className="trend-up"><TrendingUp size={12} strokeWidth={3}/> 12.5%</span>
            <span className="trend-text">vs last month</span>
          </div>
        </div>

        <div className="card reports-kpi-card">
          <div className="kpi-header">
            <div className="kpi-icon-wrapper bg-orange-light">
              <AlertCircle size={20} />
            </div>
            <div className="kpi-title-row">
              <span className="kpi-title">Invoices Pending</span>
            </div>
          </div>
          <h2 className="kpi-value">{pendingCount}</h2>
          <div className="kpi-trend">
            <span className="trend-up" style={{color: '#94a3b8'}}>Stable</span>
            <span className="trend-text">Awaiting checkout</span>
          </div>
        </div>

        <div className="card reports-kpi-card">
          <div className="kpi-header">
            <div className="kpi-icon-wrapper bg-green-light">
              <History size={20} />
            </div>
            <div className="kpi-title-row">
              <span className="kpi-title">Transactions</span>
            </div>
          </div>
          <h2 className="kpi-value">{totalTxns}</h2>
          <div className="kpi-trend">
            <span className="trend-up"><TrendingUp size={12} strokeWidth={3}/> +24</span>
            <span className="trend-text">This period</span>
          </div>
        </div>

        <div className="card reports-kpi-card">
          <div className="kpi-header">
            <div className="kpi-icon-wrapper bg-pink-light">
              <ShoppingBag size={20} />
            </div>
            <div className="kpi-title-row">
              <span className="kpi-title">Average Value</span>
            </div>
          </div>
          <h2 className="kpi-value">₱ {totalTxns > 0 ? (totalRevenue / totalTxns).toFixed(2) : '0.00'}</h2>
          <div className="kpi-trend">
            <span className="trend-up"><TrendingUp size={12} strokeWidth={3}/> 5.2%</span>
            <span className="trend-text">Per customer</span>
          </div>
        </div>
      </div>

      {/* Control Bar - Matching Appointments Style */}
      <div className="apt-controls-bar mb-24 flex-between">
        <div className="apt-filters">
          {['Pending', 'Completed'].map(tab => (
            <button 
              key={tab}
              className={`apt-filter-btn ${activeTab === tab ? 'active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab === 'Pending' ? `Pending (${pendingCount})` : 'Transaction History'}
            </button>
          ))}
        </div>
      </div>

      <div className="payment-content">
        {activeTab === 'Pending' ? (
          <div className="appointments-list-container">
            <div className="apt-list-header">
              <div>Time</div>
              <div>Client Profile</div>
              <div>Services</div>
              <div>Status</div>
              <div>Value</div>
              <div style={{textAlign: 'right'}}>Action</div>
            </div>
            
            {pendingPayments.length > 0 ? (
              pendingPayments.map(apt => (
                <div key={apt.id} className="apt-list-row" onClick={() => setDetailsAppointment(apt)}>
                  <div className="apt-row-time">
                    <span className="time-text">{format12h(apt.time)}</span>
                    <span className="date-text">{formatDate(apt.date)}</span>
                  </div>
                  
                  <div className="apt-row-client">
                    <div className="client-info">
                      <span className="c-name">{getCustomerName(customers, apt.customerId)}</span>
                      <span className="c-phone">{getCustomerPhone(customers, apt.customerId)}</span>
                    </div>
                  </div>

                  <div className="apt-row-services">
                    {(Array.isArray(apt.services) ? apt.services : [apt.service]).map(s => (
                      <span key={s} className="service-pill">{s}</span>
                    ))}
                  </div>

                  <div className="apt-row-status">
                    <span className="status-pill pill-done">Completed</span>
                  </div>

                  <div className="apt-row-price">₱ {apt.totalPrice.toFixed(2)}</div>

                  <div className="apt-row-actions">
                    <button className="row-action-btn row-action-primary" onClick={(e) => { e.stopPropagation(); handlePayment(apt); }}>
                      <CreditCard size={14} /> Checkout
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="appointments-empty card">
                <div className="empty-icon-circle"><CheckCircle2 size={32} /></div>
                <h3>Nothing to bill</h3>
                <p>No pending services require payment at the moment.</p>
                <button className="btn btn-primary mt-16" onClick={loadMockData}>
                  Load Sample Data
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="appointments-list-container">
            <div className="apt-list-header">
              <div>Date & Time</div>
              <div>Client Name</div>
              <div>Services Provided</div>
              <div>Status</div>
              <div>Amount</div>
              <div style={{textAlign: 'right'}}>Invoice</div>
            </div>

            {completedPayments.length > 0 ? (
              completedPayments.slice().reverse().map(txn => (
                <div key={txn.id} className="apt-list-row" onClick={() => setDetailsTransaction(txn)}>
                  <div className="apt-row-time">
                    <span className="time-text">{format12h(txn.time)}</span>
                    <span className="date-text">{formatDate(txn.date)}</span>
                  </div>
                  
                  <div className="apt-row-client">
                    <div className="client-info">
                      <span className="c-name">{txn.customerName}</span>
                      <span className="c-phone">{customers.find(c => c.name === txn.customerName)?.phone || 'N/A'}</span>
                    </div>
                  </div>

                  <div className="apt-row-services">
                    <span className="text-sm">{txn.service}</span>
                  </div>

                  <div className="apt-row-status">
                    <span className="status-pill pill-paid">Paid</span>
                  </div>

                  <div className="apt-row-price">₱ {txn.amount.toFixed(2)}</div>

                  <div className="apt-row-actions" style={{justifyContent: 'flex-end'}}>
                    <button className="btn-icon" onClick={(e) => e.stopPropagation()}>
                      <Receipt size={18} />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="appointments-empty card">
                <div className="empty-icon-circle"><History size={32} /></div>
                <h3>No History</h3>
                <p>Recorded transactions will appear here.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Appointment Details Modal (Pending) */}
      {detailsAppointment && (
        <div className="modal-overlay" onClick={() => setDetailsAppointment(null)}>
          <div className="modal card" onClick={(e) => e.stopPropagation()}>
            <div className="flex-between mb-24">
              <h2>Pending Appointment Details</h2>
              <span className={`status-pill pill-${detailsAppointment.status.toLowerCase()}`}>{detailsAppointment.status}</span>
            </div>
            <div className="mt-8">
              <div className="mb-24">
                <p className="text-muted" style={{ fontSize: '13px', marginBottom: '4px' }}>Client Name</p>
                <p style={{ fontSize: '16px', fontWeight: '600' }}>{getCustomerName(customers, detailsAppointment.customerId)}</p>
                <p className="text-muted" style={{ fontSize: '12px' }}>{getCustomerPhone(customers, detailsAppointment.customerId)}</p>
              </div>
              <div className="grid grid-cols-2 mb-24">
                <div>
                  <p className="text-muted" style={{ fontSize: '13px', marginBottom: '4px' }}>Date</p>
                  <p style={{ fontSize: '15px', fontWeight: '500' }}>{formatDate(detailsAppointment.date)}</p>
                </div>
                <div>
                  <p className="text-muted" style={{ fontSize: '13px', marginBottom: '4px' }}>Time</p>
                  <p style={{ fontSize: '15px', fontWeight: '500' }}>{format12h(detailsAppointment.time)}</p>
                </div>
              </div>
              <div className="mb-24">
                <p className="text-muted" style={{ fontSize: '13px', marginBottom: '8px' }}>Services</p>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {(Array.isArray(detailsAppointment.services) ? detailsAppointment.services : [detailsAppointment.service]).map(s => (
                    <span key={s} className="service-pill" style={{ padding: '6px 12px' }}>{s}</span>
                  ))}
                </div>
              </div>
              <div className="mb-24">
                <p className="text-muted" style={{ fontSize: '13px', marginBottom: '4px' }}>Amount to Pay</p>
                <p style={{ fontSize: '20px', fontWeight: '700', color: 'var(--text-main)' }}>₱ {detailsAppointment.totalPrice?.toFixed(2)}</p>
              </div>
            </div>
            <div className="modal-actions mt-32">
              <button className="btn btn-primary" style={{ width: '100%' }} onClick={() => setDetailsAppointment(null)}>Done</button>
            </div>
          </div>
        </div>
      )}

      {/* Transaction Details Modal (History) */}
      {detailsTransaction && (
        <div className="modal-overlay" onClick={() => setDetailsTransaction(null)}>
          <div className="modal card" onClick={(e) => e.stopPropagation()}>
            <div className="flex-between mb-24">
              <h2>Transaction Details</h2>
              <span className="status-pill pill-paid">Paid</span>
            </div>
            <div className="mt-8">
              <div className="mb-24">
                <p className="text-muted" style={{ fontSize: '13px', marginBottom: '4px' }}>Transaction ID</p>
                <p style={{ fontSize: '16px', fontWeight: '600' }}>TXN-{detailsTransaction.appointmentId}-{detailsTransaction.id}</p>
              </div>
              <div className="mb-24">
                <p className="text-muted" style={{ fontSize: '13px', marginBottom: '4px' }}>Customer</p>
                <p style={{ fontSize: '16px', fontWeight: '600' }}>{detailsTransaction.customerName}</p>
              </div>
              <div className="grid grid-cols-2 mb-24">
                <div>
                  <p className="text-muted" style={{ fontSize: '13px', marginBottom: '4px' }}>Date</p>
                  <p style={{ fontSize: '15px', fontWeight: '500' }}>{formatDate(detailsTransaction.date)}</p>
                </div>
                <div>
                  <p className="text-muted" style={{ fontSize: '13px', marginBottom: '4px' }}>Time</p>
                  <p style={{ fontSize: '15px', fontWeight: '500' }}>{format12h(detailsTransaction.time)}</p>
                </div>
              </div>
              <div className="mb-24">
                <p className="text-muted" style={{ fontSize: '13px', marginBottom: '8px' }}>Services Provided</p>
                <p style={{ fontSize: '15px', fontWeight: '500' }}>{detailsTransaction.service}</p>
              </div>
              <div className="mb-24">
                <p className="text-muted" style={{ fontSize: '13px', marginBottom: '4px' }}>Amount Paid</p>
                <p style={{ fontSize: '24px', fontWeight: '800', color: '#10b981' }}>₱ {detailsTransaction.amount.toFixed(2)}</p>
              </div>
            </div>
            <div className="modal-actions mt-32">
              <button className="btn btn-primary" style={{ width: '100%' }} onClick={() => setDetailsTransaction(null)}>Done</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default React.memo(Payment);
