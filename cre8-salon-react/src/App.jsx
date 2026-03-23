import React, { useState, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './features/Dashboard';
import Customers from './features/Customers';
import Appointments from './features/Appointments';
import CalendarView from './features/CalendarView';
import Payment from './features/Payment';
import Reports from './features/Reports';
import Services from './features/Services';
import DataExport from './features/DataExport';
import CustomerBooking from './features/CustomerBooking';
import Login from './features/Login';
import Topbar from './components/Topbar';
import { useSalonData } from './hooks/useSalonData';
import './App.css';

function App() {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  const [isCustomerMode, setIsCustomerMode] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem('darkMode') === 'true';
  });
  const [currentUser, setCurrentUser] = useState(() => JSON.parse(localStorage.getItem('currentUser')));
  const { 
    customers, appointments, services, transactions, setServices,
    addCustomer, updateCustomer, deleteCustomer, 
    addAppointment, updateAppointmentStatus, deleteAppointment, 
    addTransaction, loadMockData
  } = useSalonData();

  React.useEffect(() => {
    if (isDarkMode) {
      document.body.classList.add('dark-theme');
    } else {
      document.body.classList.remove('dark-theme');
    }
    localStorage.setItem('darkMode', isDarkMode);
  }, [isDarkMode]);

  // Reset search when changing sections
  React.useEffect(() => {
    setSearchTerm('');
  }, [activeSection]);

  const toggleDarkMode = useCallback(() => setIsDarkMode(prev => !prev), []);

  const handleLogin = useCallback((user) => {
    localStorage.setItem('currentUser', JSON.stringify(user));
    setCurrentUser(user);
  }, []);

  const handleLogout = useCallback(() => {
    if (window.confirm('Are you sure you want to logout?')) {
      localStorage.removeItem('currentUser');
      setCurrentUser(null);
    }
  }, []);

  const handleExitCustomerMode = useCallback(() => setIsCustomerMode(false), []);
  const handleSwitchToCustomerMode = useCallback(() => setIsCustomerMode(true), []);
  const handleToggleSidebar = useCallback(() => setIsSidebarOpen(prev => !prev), []);
  const handleCloseSidebar = useCallback(() => setIsSidebarOpen(false), []);
  const handleSearch = useCallback((query) => setSearchTerm(query), []);

  if (!currentUser) return <Login onLogin={handleLogin} isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />;

  if (isCustomerMode) {
    return (
      <CustomerBooking 
        services={services} 
        addAppointment={addAppointment} 
        customers={customers}
        addCustomer={addCustomer}
        appointments={appointments}
        onExit={handleExitCustomerMode}
      />
    );
  }

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return (
          <Dashboard 
            appointments={appointments} 
            customers={customers} 
            services={services} 
            transactions={transactions}
            setActiveSection={setActiveSection} 
          />
        );
      case 'customers':
        return <Customers customers={customers} addCustomer={addCustomer} updateCustomer={updateCustomer} deleteCustomer={deleteCustomer} loadMockData={loadMockData} />;
      case 'calendar-view':
        return <CalendarView appointments={appointments} />;
      case 'appointments':
        return (
          <Appointments 
            appointments={appointments} 
            customers={customers} 
            services={services} 
            addAppointment={addAppointment} 
            updateAppointmentStatus={updateAppointmentStatus} 
            deleteAppointment={deleteAppointment}
            setActiveSection={setActiveSection}
            loadMockData={loadMockData}
          />
        );
      case 'payment':
        return (
          <Payment 
            appointments={appointments} 
            customers={customers} 
            transactions={transactions} 
            addTransaction={addTransaction} 
            setActiveSection={setActiveSection}
            loadMockData={loadMockData} 
          />
        );
      case 'reports':
        return <Reports appointments={appointments} transactions={transactions} services={services} />;
      case 'services':
        return <Services services={services} setServices={setServices} />;
      case 'export':
        return <DataExport customers={customers} appointments={appointments} transactions={transactions} />;
      default:
        return null;
    }
  };

  return (
    <div className="flex">
      <Sidebar 
        activeSection={activeSection} 
        setActiveSection={setActiveSection}
        onLogout={handleLogout}
        onSwitchMode={handleSwitchToCustomerMode}
        isOpen={isSidebarOpen}
        onClose={handleCloseSidebar}
      />
      <div className={`main-content ${isSidebarOpen ? 'sidebar-blurred' : ''}`}>
        <Topbar 
          user={currentUser} 
          onSearch={handleSearch} 
          onLogout={handleLogout}
          isDarkMode={isDarkMode}
          toggleDarkMode={toggleDarkMode}
          onMenuToggle={handleToggleSidebar}
          activeSection={activeSection}
          searchTerm={searchTerm}
        />
        <div className="page-content">
          {activeSection === 'dashboard' && (
            <Dashboard 
              appointments={appointments} 
              customers={customers} 
              services={services} 
              transactions={transactions}
              setActiveSection={setActiveSection} 
            />
          )}
          {activeSection === 'customers' && (
            <Customers 
              customers={customers} 
              addCustomer={addCustomer} 
              updateCustomer={updateCustomer} 
              deleteCustomer={deleteCustomer} 
              loadMockData={loadMockData}
              searchTerm={searchTerm}
            />
          )}
          {activeSection === 'calendar-view' && <CalendarView appointments={appointments} />}
          {activeSection === 'appointments' && (
            <Appointments 
              appointments={appointments} 
              customers={customers} 
              services={services} 
              addAppointment={addAppointment} 
              updateAppointmentStatus={updateAppointmentStatus} 
              deleteAppointment={deleteAppointment}
              setActiveSection={setActiveSection}
              loadMockData={loadMockData}
              searchTerm={searchTerm}
            />
          )}
          {activeSection === 'payment' && (
            <Payment 
              appointments={appointments} 
              customers={customers} 
              transactions={transactions} 
              addTransaction={addTransaction} 
              setActiveSection={setActiveSection}
              loadMockData={loadMockData} 
            />
          )}
          {activeSection === 'reports' && <Reports appointments={appointments} transactions={transactions} services={services} />}
          {activeSection === 'services' && (
            <Services 
              services={services} 
              setServices={setServices} 
              searchTerm={searchTerm}
            />
          )}
          {activeSection === 'export' && <DataExport customers={customers} appointments={appointments} transactions={transactions} />}
        </div>
      </div>
    </div>
  );
}

export default App;
