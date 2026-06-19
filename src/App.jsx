import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout';
import Home from './pages/Home';
import LessonPage from './pages/LessonPage';
import UnitPage from './pages/UnitPage';
import Shop from './pages/Shop';

// Phase 2 — imported but not active yet
// import LoginPage from './pages/LoginPage';
// import ProfilePage from './pages/ProfilePage';
// import AdminDashboard from './pages/admin/AdminDashboard';
// import AdminLessonEditor from './pages/admin/AdminLessonEditor';

// Phase 3 — imported but not active yet
// import AnalyticsDashboard from './pages/admin/AnalyticsDashboard';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ---- Phase 1 Routes (Active) ---- */}
        <Route path="/" element={<AppLayout />}>
          <Route index element={<Home />} />
          <Route path="unit/:unitId" element={<UnitPage />} />
          <Route path="lesson/:lessonId" element={<LessonPage />} />
          <Route path="shop" element={<Shop />} />
        </Route>

        {/* ---- Phase 2 Routes (Uncomment when ready) ---- */}
        {/* <Route path="/login" element={<LoginPage />} /> */}
        {/* <Route path="/profile" element={<ProfilePage />} /> */}
        {/* <Route path="/admin" element={<AdminDashboard />} /> */}
        {/* <Route path="/admin/lesson/:lessonId" element={<AdminLessonEditor />} /> */}
        {/* <Route path="/admin/lesson/new" element={<AdminLessonEditor />} /> */}

        {/* ---- Phase 3 Routes (Uncomment when ready) ---- */}
        {/* <Route path="/admin/analytics" element={<AnalyticsDashboard />} /> */}

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
