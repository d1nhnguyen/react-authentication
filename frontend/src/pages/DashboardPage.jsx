import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { authAPI } from '../api/auth';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const DashboardPage = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Fetch user data
  const { data, isLoading, error } = useQuery({
    queryKey: ['user'],
    queryFn: authAPI.getMe,
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: authAPI.signout,
    onSuccess: () => {
      logout();
      queryClient.clear();
      navigate('/login');
    },
    onError: (error) => {
      console.error('Logout error:', error);
      // Even if API fails, clear local state
      logout();
      queryClient.clear();
      navigate('/login');
    },
  });

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  if (isLoading) {
    return (
      <div className="dashboard-container">
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading user data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-container">
        <div className="error-container">
          <h2>Error loading user data</h2>
          <p>{error.response?.data?.message || 'Something went wrong'}</p>
          <button onClick={handleLogout} className="logout-btn">
            Logout
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Dashboard</h1>
        <button
          onClick={handleLogout}
          disabled={logoutMutation.isPending}
          className="logout-btn"
        >
          {logoutMutation.isPending ? 'Logging out...' : 'Logout'}
        </button>
      </div>

      <div className="user-card">
        <h2>Welcome, {data?.user?.displayName}!</h2>
        <div className="user-info">
          <div className="info-item">
            <span className="label">Username:</span>
            <span className="value">{data?.user?.username}</span>
          </div>
          <div className="info-item">
            <span className="label">Email:</span>
            <span className="value">{data?.user?.email}</span>
          </div>
          <div className="info-item">
            <span className="label">Display Name:</span>
            <span className="value">{data?.user?.displayName}</span>
          </div>
          <div className="info-item">
            <span className="label">Account Created:</span>
            <span className="value">
              {new Date(data?.user?.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>

      <div className="dashboard-content">
        <div className="info-box">
          <h3>🔐 Authentication Status</h3>
          <p>You are successfully authenticated with JWT tokens.</p>
          <ul>
            <li>✅ Access token stored in memory</li>
            <li>✅ Refresh token stored in HTTP-only cookie</li>
            <li>✅ Protected route accessed successfully</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;