import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import store from './app/store';
import Login from './pages/auth/Login';
import Unauthorized from './pages/common/Unauthorized';
import ProtectedRoute from './components/ProtectedRoute';
import AppLayout from './components/layouts/AppLayout';
import AdminDashboard from './pages/dashboards/AdminDashboard';
import TeacherDashboard from './pages/dashboards/TeacherDashboard';
import StudentDashboard from './pages/dashboards/StudentDashboard';
import RoleList from './pages/roles/RoleList';
import RolePermissionManager from './pages/roles/RolePermissionManager';

import Settings from './pages/admin/Settings';
import Programs from './pages/admin/Programs';
import ProgramForm from './pages/admin/ProgramForm';
import Courses from './pages/admin/Courses';
import CourseForm from './pages/admin/CourseForm';
import Inquiries from './pages/admin/Inquiries';
import Banners from './pages/admin/Banners';
import BannerForm from './pages/admin/BannerForm';
import ServicePartners from './pages/admin/ServicePartners';
import ServicePartnerForm from './pages/admin/ServicePartnerForm';

import './index.css';
import { SettingsProvider } from './context/SettingsContext';

// Allow all known roles to access the main app shell.
// Fine‑grained access to specific pages can be added per‑route later if needed.
const allowedPanelRoles = ['super_admin', 'admin', 'teacher', 'student'];

function App() {
    return (
        <Provider store={store}>
            <SettingsProvider>
                <Router>
                    <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/unauthorized" element={<Unauthorized />} />
                    <Route
                        path="/app/*"
                        element={
                            <ProtectedRoute allowedRoles={allowedPanelRoles}>
                                <AppLayout>
                                    <Routes>
                                        <Route path="dashboard" element={<AdminDashboard />} />

                                       
                                        <Route path="roles" element={<RoleList />} />
                                        <Route path="roles/:id" element={<RolePermissionManager />} />

                                        <Route path="programs" element={<Programs />} />
                                        <Route path="programs/new" element={<ProgramForm />} />
                                        <Route path="programs/:id/edit" element={<ProgramForm />} />
                                        <Route path="courses" element={<Courses />} />
                                        <Route path="courses/new" element={<CourseForm />} />
                                        <Route path="courses/:id/edit" element={<CourseForm />} />

                                        <Route path="banners" element={<Banners />} />
                                        <Route path="banners/new" element={<BannerForm />} />
                                        <Route path="banners/:id/edit" element={<BannerForm />} />

                                        <Route path="service-partners" element={<ServicePartners />} />
                                        <Route path="service-partners/new" element={<ServicePartnerForm />} />
                                        <Route path="service-partners/:id/edit" element={<ServicePartnerForm />} />

                                        <Route path="inquiries" element={<Inquiries />} />

                                        <Route path="settings" element={<Settings />} />
                                        <Route path="teacher-dashboard" element={<TeacherDashboard />} />
                                        <Route path="student-dashboard" element={<StudentDashboard />} />
                                        <Route path="*" element={<Navigate to="/app/dashboard" replace />} />
                                        </Routes>
                                    </AppLayout>
                                </ProtectedRoute>
                            }
                        />
                        <Route path="/" element={<Navigate to="/login" replace />} />
                        <Route path="*" element={<Navigate to="/login" replace />} />
                    </Routes>
                </Router>
            </SettingsProvider>
        </Provider>
    );
}

export default App;
