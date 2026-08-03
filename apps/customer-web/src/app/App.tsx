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
import { SessionPage } from '../pages/SessionPage';

export function App() {
  return (
    <Routes>
      <Route path="/session" element={<SessionPage />} />
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
      </Route>
    </Routes>
  );
}
