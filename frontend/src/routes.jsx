import { createBrowserRouter } from 'react-router-dom';
import Layout from './layout/Layout';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AskQuestionPage from './pages/AskQuestionPage';
import QuestionDetailPage from './pages/QuestionDetailPage';
import ProtectedRoute from './components/ProtectedRoute';

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: 'login',
        element: <LoginPage />,
      },
      {
        path: 'register',
        element: <RegisterPage />,
      },
      {
        path: 'ask',
        element: (
          <ProtectedRoute>
            <AskQuestionPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'question/:id',
        element: <QuestionDetailPage />,
      },
    ],
  },
]);

export default router; 