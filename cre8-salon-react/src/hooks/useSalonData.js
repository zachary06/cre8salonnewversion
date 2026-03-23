import { useState, useEffect, useCallback, useMemo } from 'react';

const STORAGE_KEYS = {
  customers: 'cre8_customers',
  appointments: 'cre8_appointments',
  transactions: 'cre8_transactions',
  archive: 'cre8_archive',
  services: 'cre8_services'
};

const DEFAULT_SERVICES = [
  { id: 1, name: 'Haircut', price: 30 },
  { id: 2, name: 'Massage', price: 60 },
  { id: 3, name: 'Facial', price: 45 },
  { id: 4, name: 'Manicure', price: 25 },
  { id: 5, name: 'Pedicure', price: 30 },
  { id: 6, name: 'Hair Coloring', price: 80 },
  { id: 7, name: 'Spa Treatment', price: 100 }
];

const MOCK_CUSTOMERS = [
  { id: 1, name: 'Jenny Wilson', email: 'jenny@example.com', phone: '555-0101' },
  { id: 2, name: 'Jane Cooper', email: 'jane@example.com', phone: '555-0102' },
  { id: 3, name: 'Arlene McCoy', email: 'arlene@example.com', phone: '555-0103' },
  { id: 4, name: 'Wade Warren', email: 'wade@example.com', phone: '555-0104' },
  { id: 5, name: 'Cody Fisher', email: 'cody@example.com', phone: '555-0105' },
  { id: 6, name: 'Devon Lane', email: 'devon@example.com', phone: '555-0106' }
];

const MOCK_APPOINTMENTS = [
  { id: 101, customerId: 1, date: '2026-03-18', time: '10:00', services: ['Hair Coloring', 'Haircut'], status: 'Done', totalPrice: 110 },
  { id: 102, customerId: 2, date: '2026-03-18', time: '13:00', services: ['Spa Treatment'], status: 'Done', totalPrice: 100 },
  { id: 103, customerId: 3, date: '2026-03-18', time: '14:30', services: ['Massage'], status: 'Done', totalPrice: 60 },
  { id: 104, customerId: 4, date: '2026-03-19', time: '09:00', services: ['Haircut'], status: 'Booked', totalPrice: 30 },
  { id: 105, customerId: 5, date: '2026-03-19', time: '11:00', services: ['Hair Coloring'], status: 'Booked', totalPrice: 80 },
  { id: 106, customerId: 6, date: '2026-03-20', time: '15:30', services: ['Facial', 'Manicure'], status: 'Booked', totalPrice: 70 },
  { id: 107, customerId: 1, date: '2026-03-17', time: '16:00', services: ['Manicure'], status: 'Done', totalPrice: 25 }
];

const MOCK_TRANSACTIONS = [
  { id: 1, appointmentId: 101, customerName: 'Jenny Wilson', service: 'Hair Coloring, Haircut', amount: 110, date: '2026-03-18', time: '11:15' },
  { id: 2, appointmentId: 99, customerName: 'Cody Fisher', service: 'Manicure', amount: 25, date: '2026-03-17', time: '14:00' },
  { id: 3, appointmentId: 98, customerName: 'Jane Cooper', service: 'Pedicure', amount: 30, date: '2026-03-17', time: '15:30' }
];

export const useSalonData = () => {
  const [customers, setCustomers] = useState(() => {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEYS.customers) || '[]');
    return stored.length > 0 ? stored : MOCK_CUSTOMERS;
  });
  const [appointments, setAppointments] = useState(() => {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEYS.appointments) || '[]');
    return stored.length > 0 ? stored : MOCK_APPOINTMENTS;
  });
  const [transactions, setTransactions] = useState(() => {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEYS.transactions) || '[]');
    return stored.length > 0 ? stored : MOCK_TRANSACTIONS;
  });
  const [services, setServices] = useState(() => {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEYS.services) || '[]');
    return stored.length > 0 ? stored : DEFAULT_SERVICES;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.customers, JSON.stringify(customers));
  }, [customers]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.appointments, JSON.stringify(appointments));
  }, [appointments]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.transactions, JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.services, JSON.stringify(services));
  }, [services]);

  const addCustomer = useCallback((customer) => setCustomers(prev => [...prev, { ...customer, id: Date.now(), createdAt: new Date().toISOString() }]), []);
  const updateCustomer = useCallback((id, updated) => setCustomers(prev => prev.map(c => c.id === id ? { ...c, ...updated } : c)), []);
  const deleteCustomer = useCallback((id) => setCustomers(prev => prev.filter(c => c.id !== id)), []);

  const addAppointment = useCallback((appointment) => setAppointments(prev => [...prev, { ...appointment, id: Date.now(), status: 'Booked', createdAt: new Date().toISOString() }]), []);
  const updateAppointmentStatus = useCallback((id, status) => setAppointments(prev => prev.map(a => a.id === id ? { ...a, status } : a)), []);
  const deleteAppointment = useCallback((id) => setAppointments(prev => prev.filter(a => a.id !== id)), []);

  const addTransaction = useCallback((transaction) => {
    setTransactions(prev => [...prev, { ...transaction, id: Date.now(), paymentDate: new Date().toISOString() }]);
    updateAppointmentStatus(transaction.appointmentId, 'Paid');
  }, [updateAppointmentStatus]);

  const loadMockData = useCallback(() => {
    setCustomers(MOCK_CUSTOMERS);
    setAppointments(MOCK_APPOINTMENTS);
    setTransactions(MOCK_TRANSACTIONS);
  }, []);

  const addService = useCallback((service) => setServices(prev => [...prev, { ...service, id: Date.now() }]), []);
  const updateService = useCallback((id, updated) => setServices(prev => prev.map(s => s.id === id ? { ...s, ...updated } : s)), []);
  const deleteService = useCallback((id) => setServices(prev => prev.filter(s => s.id !== id)), []);

  const contextValue = useMemo(() => ({
    customers,
    appointments,
    transactions,
    services,
    setServices,
    addCustomer,
    updateCustomer,
    deleteCustomer,
    addAppointment,
    updateAppointmentStatus,
    deleteAppointment,
    addTransaction,
    addService,
    updateService,
    deleteService,
    loadMockData
  }), [
    customers, appointments, transactions, services, 
    addCustomer, updateCustomer, deleteCustomer, 
    addAppointment, updateAppointmentStatus, deleteAppointment, 
    addTransaction, addService, updateService, deleteService, loadMockData
  ]);

  return contextValue;
};
