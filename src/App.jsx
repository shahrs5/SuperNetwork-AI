import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import LandingPage from './components/LandingPage'
import SignUp from './components/Auth/SignUp'
import Login from './components/Auth/Login'
import ProtectedRoute from './components/ProtectedRoute'
import Onboarding from './components/Onboarding/Onboarding'
import Dashboard from './components/Dashboard/Dashboard'
import ProfileDetail from './components/Profile/ProfileDetail'
import MessageInbox from './components/Messages/MessageInbox'
import MessageThread from './components/Messages/MessageThread'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/login" element={<Login />} />

        <Route
          path="/onboarding"
          element={
            <ProtectedRoute>
              <Onboarding />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile/:userId"
          element={
            <ProtectedRoute>
              <ProfileDetail />
            </ProtectedRoute>
          }
        />

        <Route
          path="/messages"
          element={
            <ProtectedRoute>
              <MessageInbox />
            </ProtectedRoute>
          }
        />

        <Route
          path="/messages/:threadId"
          element={
            <ProtectedRoute>
              <MessageThread />
            </ProtectedRoute>
          }
        />

        {/* Catch all - redirect to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  )
}

export default App
