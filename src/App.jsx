import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Provider } from "react-redux";
import store from "./store/page";

import HackingInterface from "./components/Main";
import SignUp from "./components/SignUp";

// Admin
import AdminDashboard from "./dashboardAdmin/AdminDashboard";
import Products from "./dashboardAdmin/products/Products";
import Tribe from "./dashboardAdmin/tribe/Tribe";
import AdminMessages from "./dashboardAdmin/messages/Messages";

// Student
import StudentDashboard from "./dashboardStudent/StudentDashboard";
import StudentMessage from "./dashboardStudent/message/StudentMessage";

// Communication
import CommunicationDashboard from "./dashboardCommunication/CommunicationDashboard";
import CommunicationMessages from "./dashboardCommunication/message/CommunicationMessage";

export default function App() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <Routes>
          {/* Landing Page */}
          <Route path="/" element={<HackingInterface />} />
          <Route path="/signup" element={<SignUp />} />
  
          {/* Admin */}
          <Route path="/admin-dashboard" element={<AdminDashboard />}>
            <Route path="messages" element={<AdminMessages />} />
            <Route path="products" element={<Products />} />
            <Route path="tribe" element={<Tribe />} />
          </Route>

          {/* Communication */}
          <Route path="/communication-dashboard" element={<CommunicationDashboard />} />
          <Route
            path="/communication-dashboard/:username"
            element={<CommunicationDashboard />}
          >
            <Route path="communication-messages" element={<CommunicationMessages />} />
          </Route>

          {/* Student */}
          <Route path="/student-dashboard" element={<StudentDashboard />} />
          <Route path="/student-dashboard/:username" element={<StudentDashboard />}>
            <Route path="message" element={<StudentMessage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </Provider>
  );
}


