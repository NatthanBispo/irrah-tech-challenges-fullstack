import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { LoginPage } from './app/(auth)/page';
import { RootLayout } from './app/layout';
import { HomePage } from './app/page';
import { ChatPage } from './app/dashboard/[conversationId]/page';
import { ConversationsPage } from './app/dashboard/page';
import { GuestRoute } from './shared/components/GuestRoute';
import { ProtectedRoute } from './shared/components/ProtectedRoute';

export default function App() {
  return (
    <BrowserRouter>
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
            path="/dashboard"
            element={
              <ProtectedRoute>
                <ConversationsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/:conversationId"
            element={
              <ProtectedRoute>
                <ChatPage />
              </ProtectedRoute>
            }
          />
        </Routes>
      </RootLayout>
    </BrowserRouter>
  );
}
