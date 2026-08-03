import {
  Navigate,
  Route,
  Routes,
} from 'react-router-dom';

import { CustomerLayout } from '../layouts/CustomerLayout';
import { CreateJobPage } from '../pages/CreateJobPage';
import { DashboardPage } from '../pages/DashboardPage';
import { JobDetailPage } from '../pages/JobDetailPage';
import { JobsPage } from '../pages/JobsPage';
import { LocationsPage } from '../pages/LocationsPage';
import { LoginPage } from '../pages/LoginPage';
import { ProfilePage } from '../pages/ProfilePage';
import { RegisterPage } from '../pages/RegisterPage';

export function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/register"
        element={<RegisterPage />}
      />
      <Route element={<CustomerLayout />}>
        <Route
          index
          element={<Navigate to="/dashboard" replace />}
        />
        <Route
          path="/dashboard"
          element={<DashboardPage />}
        />
        <Route path="/jobs" element={<JobsPage />} />
        <Route
          path="/jobs/new"
          element={<CreateJobPage />}
        />
        <Route
          path="/jobs/:jobId"
          element={<JobDetailPage />}
        />
        <Route
          path="/locations"
          element={<LocationsPage />}
        />
        <Route
          path="/profile"
          element={<ProfilePage />}
        />
      </Route>
    </Routes>
  );
}
