import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './Login';
import RoleSelection from './RoleSelection';
import RegisterAdmin from './RegisterAdmin'; 
import RegisterCustomer from './RegisterCustomer'; 
import Dashboard from './Dashboard';
import UserManagement from './UserManagement';
import UserDashboard from './UserDashboard';
import ElectronicOrder from './ElectronicOrder';
import PlasticOrder from './PlasticOrder';
import SolarOrder from './SolarOrder';
import AgroOrder from './AgroOrder';
import BatteryOrder from './BatteryOrder';
import OilOrder from './OilOrder';
import AdminOrders from './AdminOrders';
import QRManagement from './QRManagement';
import CustomerVerify from './CustomerVerify';
import CoPartner from './CoPartner';
import PartnerDashboard from './PartnerDashboard';
import CoPartnerScan from './CoPartnerScan';
import ForgotPassword from './ForgotPassword';
import { AuthProvider } from './AuthContext';
import ProtectedRoute from './ProtectedRoute'; 

function App() {
  return (
    <AuthProvider>
    <Router>
      <Routes>
        {/* --- PUBLIC ROUTES --- */}
        <Route path="/" element={<Login />} />
        <Route path="/select-role" element={<RoleSelection />} />
        <Route path="/register-admin" element={<RegisterAdmin />} />
        <Route path="/register-customer" element={<RegisterCustomer />} />
        <Route path="/verify-product" element={<CustomerVerify />} />

        {/* --- අලුත් Forgot Password පේජ් එකේ පාර (Path) මෙතනට දාන්න --- */}
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* --- PROTECTED ROUTES (Role-based Protection) --- */}
        
        {/* 1. Admin පේජ් (ADMIN ට පමණි) */}
        <Route path="/dashboard" element={<ProtectedRoute allowedRole="ADMIN"><Dashboard /></ProtectedRoute>} />
        <Route path="/user-management" element={<ProtectedRoute allowedRole="ADMIN"><UserManagement /></ProtectedRoute>} />
        <Route path="/admin-orders" element={<ProtectedRoute allowedRole="ADMIN"><AdminOrders /></ProtectedRoute>} />
        <Route path="/qr-management" element={<ProtectedRoute allowedRole="ADMIN"><QRManagement /></ProtectedRoute>} />
        <Route path="/co-partner" element={<ProtectedRoute allowedRole="ADMIN"><CoPartner /></ProtectedRoute>} />

        {/* 2. Customer පේජ් (CUSTOMER ට පමණි) */}
        <Route path="/user-dashboard" element={<ProtectedRoute allowedRole="CUSTOMER"><UserDashboard /></ProtectedRoute>} />
        <Route path="/electronic-order" element={<ProtectedRoute allowedRole="CUSTOMER"><ElectronicOrder /></ProtectedRoute>} />
        <Route path="/plastic-order" element={<ProtectedRoute allowedRole="CUSTOMER"><PlasticOrder /></ProtectedRoute>} />
        <Route path="/solar-order" element={<ProtectedRoute allowedRole="CUSTOMER"><SolarOrder /></ProtectedRoute>} />
        <Route path="/agro-order" element={<ProtectedRoute allowedRole="CUSTOMER"><AgroOrder /></ProtectedRoute>} />
        <Route path="/battery-order" element={<ProtectedRoute allowedRole="CUSTOMER"><BatteryOrder /></ProtectedRoute>} />
        <Route path="/oil-order" element={<ProtectedRoute allowedRole="CUSTOMER"><OilOrder /></ProtectedRoute>} />

        {/* 3. Co-partner පේජ් (PARTNER ට පමණි) */}
        <Route path="/partner-dashboard" element={<ProtectedRoute allowedRole="PARTNER"><PartnerDashboard /></ProtectedRoute>} />
        <Route path="/co-partner/scan" element={<ProtectedRoute allowedRole="PARTNER"><CoPartnerScan /></ProtectedRoute>} />
         
      </Routes>
    </Router>
    </AuthProvider>
  );
}

export default App;