import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { LoginPage } from './app/(auth)/page';
import { RegisterPage } from './app/(auth)/register/page';
import { RootLayout } from './app/layout';
import { HomePage } from './app/page';
import { ChatPage } from './app/dashboard/[conversationId]/page';
import { NewConversationPage } from './app/dashboard/new/[recipientId]/page';
import { DashboardLayout } from './app/dashboard/layout';
import { ConversationPlaceholder } from './app/dashboard/page';
import { GuestRoute } from './shared/components/GuestRoute';
import { ProtectedRoute } from './shared/components/ProtectedRoute';
import { AuthUnauthorizedBridge } from './shared/components/AuthUnauthorizedBridge';

export default function App() {
  return (
    <BrowserRouter>
      <AuthUnauthorizedBridge />
      <RootLayout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route
            path="/login"
            element={
              <GuestRoute>
                <LoginPage />
              </GuestRoute>
            }
          />
          <Route
            path="/register"
            element={
              <GuestRoute>
                <RegisterPage />
              </GuestRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<ConversationPlaceholder />} />
            <Route path="new/:recipientId" element={<NewConversationPage />} />
            <Route path=":conversationId" element={<ChatPage />} />
          </Route>
        </Routes>
      </RootLayout>
    </BrowserRouter>
  );
}
