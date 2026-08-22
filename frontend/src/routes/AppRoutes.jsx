import { Routes, Route, useParams, useLocation, useNavigate } from "react-router-dom";
import CreateTrip from "../pages/CreateTrip";
import ItineraryBuilder from "../pages/IternaryBuilder";
import TripBudget from "../pages/TripBudget";
import TripPlannerWizard from "../pages/TripPlannerWizard";

// Wrapper for the Wizard to pull state from React Router
function TripPlannerWizardWrapper() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  
  const { tripName, startDate, endDate } = location.state || {};

  return (
    <TripPlannerWizard 
      tripId={id} 
      tripName={tripName} 
      startDate={startDate} 
      endDate={endDate}
      onItineraryGenerated={() => {
        // Navigate to Itinerary Builder when AI generation completes
        navigate(`/trips/${id}/itinerary`);
      }}
    />
  );
}

// Wrapper for ItineraryBuilder to extract tripId from URL
function ItineraryBuilderWrapper() {
  const { id } = useParams();
  return <ItineraryBuilder tripId={id} />;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<div>Dashboard</div>} />
      <Route path="/login" element={<div>Login</div>} />
      <Route path="/trips/create" element={<CreateTrip/>} />
      <Route path="/trips" element={<div>My Trips</div>} />
      
      {/* AI Planner Wizard Flow */}
      <Route path="/trips/:id/plan" element={<TripPlannerWizardWrapper/>} />
      
      <Route
        path="/trips/:id/itinerary"
        element={<ItineraryBuilderWrapper/>}
      />
      <Route path="/trips/:id/view" element={<div>Itinerary View</div>} />
      <Route path="/cities" element={<div>City Search</div>} />
      <Route path="/activities" element={<div>Activity Search</div>} />
      <Route path="/trips/budget" element={<TripBudget/>} />
      <Route path="/trips/:id/calendar" element={<div>Trip Calendar</div>} />
      <Route path="/shared/:id" element={<div>Shared Itinerary</div>} />
      <Route path="/profile" element={<div>Profile</div>} />
      <Route path="/admin" element={<div>Admin</div>} />
    </Routes>
  );
}

export default AppRoutes;
