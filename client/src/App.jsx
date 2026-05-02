import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { Services } from './pages/Services';
import { Dashboard } from './pages/Dashboard';
import { OrderSubmission } from './pages/OrderSubmission';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { AdminPanel } from './pages/AdminPanel';
import { Chat } from './pages/Chat';
import { Payments } from './pages/Payments';
import { ProfileSettings } from './pages/ProfileSettings';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/services" element={<Services />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/order-submission" element={<OrderSubmission />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/admin" element={<AdminPanel />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/payments" element={<Payments />} />
          <Route path="/profile" element={<ProfileSettings />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
