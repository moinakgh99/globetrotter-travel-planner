import { Routes, Route } from "react-router-dom";
import ActivitySearch from "../pages/ActivitySearch/ActivitySearch.tsx";
import ItineraryView from "../pages/ItineraryView/ItineraryView.tsx";
import TripCalendar from "../pages/TripCalendar/TripCalendar.tsx";

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<div>Dashboard</div>} />
      <Route path="/login" element={<div>Login</div>} />
      <Route path="/trips/create" element={<div>Create Trip</div>} />
      <Route path="/trips" element={<div>My Trips</div>} />
      <Route
        path="/trips/:id/itinerary"
        element={<div>Itinerary Builder</div>}
      />
      <Route path="/trips/:id/view" element={<ItineraryView />} />
      <Route path="/cities" element={<div>City Search</div>} />
      <Route path="/activities" element={<ActivitySearch />} />
      <Route path="/trips/:id/budget" element={<div>Trip Budget</div>} />
      <Route path="/trips/:id/calendar" element={<TripCalendar />} />
      <Route path="/shared/:id" element={<div>Shared Itinerary</div>} />
      <Route path="/profile" element={<div>Profile</div>} />
      <Route path="/admin" element={<div>Admin</div>} />
    </Routes>
  );
}

export default AppRoutes;
