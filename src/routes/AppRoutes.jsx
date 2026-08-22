import React from "react";
import { Routes, Route, useParams, useLocation, useNavigate } from "react-router-dom";
import ProtectedRoute from "../components/ProtectedRoute";
import Navbar from "../components/Navbar";
import LoginSignup from "../pages/LoginSignup";
import Dashboard from "../pages/Dashboard";
import CitySearch from "../pages/CitySearch";
import CreateTrip from "../pages/CreateTrip";
import MyTrips from "../pages/MyTrips";
import Profile from "../pages/Profile";
import TripPlannerWizard from "../pages/TripPlannerWizard";
import ItineraryBuilder from "../pages/IternaryBuilder";
import TripBudget from "../pages/TripBudget";

function TripPlannerWizardWrapper() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  
  const { tripName, startDate, endDate } = location.state || {};

  return (
    <div>
      <Navbar />
      <TripPlannerWizard 
        tripId={id} 
        tripName={tripName} 
        startDate={startDate} 
        endDate={endDate}
        onItineraryGenerated={() => {
          navigate(`/trips/${id}/itinerary`);
        }}
      />
    </div>
  );
}

function ItineraryBuilderWrapper() {
  const { id } = useParams();
  return (
    <div>
      <Navbar />
      <ItineraryBuilder tripId={id} />
    </div>
  );
}

function TripBudgetWrapper() {
  const { id } = useParams();
  return (
    <div>
      <Navbar />
      <TripBudget tripId={id || "trip-1"} />
    </div>
  );
}

function LayoutWrapper({ children }) {
  return (
    <div>
      <Navbar />
      {children}
    </div>
  );
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<ProtectedRoute><LayoutWrapper><Dashboard /></LayoutWrapper></ProtectedRoute>} />
      <Route path="/login" element={<LoginSignup />} />
      <Route path="/trips/create" element={<ProtectedRoute><LayoutWrapper><CreateTrip /></LayoutWrapper></ProtectedRoute>} />
      <Route path="/trips" element={<ProtectedRoute><LayoutWrapper><MyTrips /></LayoutWrapper></ProtectedRoute>} />
      <Route path="/trips/:id/plan" element={<ProtectedRoute><TripPlannerWizardWrapper /></ProtectedRoute>} />
      <Route path="/trips/:id/itinerary" element={<ProtectedRoute><ItineraryBuilderWrapper /></ProtectedRoute>} />
      <Route path="/trips/:id/view" element={<ProtectedRoute><ItineraryBuilderWrapper /></ProtectedRoute>} />
      <Route path="/cities" element={<ProtectedRoute><LayoutWrapper><CitySearch /></LayoutWrapper></ProtectedRoute>} />
      <Route path="/activities" element={<div>Activity Search</div>} />
      <Route path="/trips/:id/budget" element={<ProtectedRoute><TripBudgetWrapper /></ProtectedRoute>} />
      <Route path="/trips/:id/calendar" element={<div>Trip Calendar</div>} />
      <Route path="/shared/:id" element={<div>Shared Itinerary</div>} />
      <Route path="/profile" element={<ProtectedRoute><LayoutWrapper><Profile /></LayoutWrapper></ProtectedRoute>} />
      <Route path="/admin" element={<div>Admin</div>} />
    </Routes>
  );
}

export default AppRoutes;
