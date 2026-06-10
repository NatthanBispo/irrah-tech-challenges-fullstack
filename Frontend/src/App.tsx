import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { LoginPage } from './app/(auth)/page';
import { HomePage } from './app/page';
import { ConversationsPage } from './app/dashboard/page';
import { ChatPage } from './app/dashboard/[conversationId]/page';
import { RootLayout } from './app/layout';

export default function App() {
  return (
    <BrowserRouter>
      <RootLayout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/dashboard" element={<ConversationsPage />} />
          <Route path="/dashboard/:conversationId" element={<ChatPage />} />
        </Routes>
      </RootLayout>
    </BrowserRouter>
  );
}
