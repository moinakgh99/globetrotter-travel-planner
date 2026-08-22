import { Routes, Route } from "react-router-dom";

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
      <Route path="/trips/:id/view" element={<div>Itinerary View</div>} />
      <Route path="/cities" element={<div>City Search</div>} />
      <Route path="/activities" element={<div>Activity Search</div>} />
      <Route path="/trips/:id/budget" element={<div>Trip Budget</div>} />
      <Route path="/trips/:id/calendar" element={<div>Trip Calendar</div>} />
      <Route path="/shared/:id" element={<div>Shared Itinerary</div>} />
      <Route path="/profile" element={<div>Profile</div>} />
      <Route path="/admin" element={<div>Admin</div>} />
    </Routes>
  );
}

export default AppRoutes;
