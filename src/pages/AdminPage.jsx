import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../style/Admin.css'; // Ensure to import the CSS file

function AdminPage() {
  const [weeklyStats, setWeeklyStats] = useState(null);
  const [monthlyStats, setMonthlyStats] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true); // Loading state for fetching statistics
  const navigate = useNavigate();

  useEffect(() => {
    const authToken = localStorage.getItem('authToken');
    const userRole = localStorage.getItem('userRole');
    
    if (!authToken || userRole !== 'ADMIN') {
      navigate('/logout', { state: { flashMessage: 'Access denied: Admins only' } });
      return;
    }
  }, [navigate]);

  useEffect(() => {
    const fetchStatistics = async () => {
      try {
        const token = localStorage.getItem('authToken');

        // Fetch Weekly Statistics
        const weeklyResponse = await fetch('http://localhost:8080/api/weekly-statistics/current', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!weeklyResponse.ok) {
          throw new Error('Failed to fetch weekly statistics');
        }

        const weeklyData = await weeklyResponse.json();
        setWeeklyStats(weeklyData); // Assuming only one entry will be returned

        // Fetch Monthly Statistics
        const monthlyResponse = await fetch('http://localhost:8080/api/monthly-statistics/current', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!monthlyResponse.ok) {
          throw new Error('Failed to fetch monthly statistics');
        }

        const monthlyData = await monthlyResponse.json();
        setMonthlyStats(monthlyData); // Assuming only one entry will be returned
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false); // Set loading to false once the fetching is complete
      }
    };

    fetchStatistics(); // Fetch statistics when the component mounts
  }, [navigate]);

  return (
    <div className="admin-page">
      <nav className="navbar">
        <div className="navbar-title">Admin Dashboard</div>
        <ul className="navbar-links">
          <li><Link to="/admin">Home</Link></li>
          <li><Link to="/admin/departments">Departments</Link></li>
          <li><Link to="/admin/doctors">Doctors</Link></li>
          <li><Link to="/admin/patients">Patients</Link></li>
          <li><Link to="/admin/staff">Staff</Link></li>
          <li><Link to="/admin/appointments">Appointments</Link></li>
          <li><Link to="/logout">Logout</Link></li>
        </ul>
      </nav>

      <div className="container">
        <h1>Statistics Overview</h1>
        {loading && <p>Loading statistics...</p>}
        {error && <p className="error">{error}</p>}

        <div className="stats-container">
          {/* Weekly Statistics */}
          <div className="stats-card">
            <h2>Weekly Statistics</h2>
            {weeklyStats ? (
              <table>
                <thead>
                  <tr>
                    <th>Week</th>
                    <th>Total Appointments</th>
                    <th>Total Income</th>
                    <th>Total Users Registered</th>
                  </tr>
                </thead>
                <tbody>
                  <tr key={weeklyStats.statID}>
                    <td>{weeklyStats.week}</td> {/* Display the week value */}
                    <td>{weeklyStats.totalAppointments}</td>
                    <td>${weeklyStats.totalIncome.toFixed(2)}</td> {/* Format income to 2 decimal places */}
                    <td>{weeklyStats.totalUsersRegistered}</td>
                  </tr>
                </tbody>
              </table>
            ) : (
              <p>No weekly statistics available.</p>
            )}
          </div>

          {/* Monthly Statistics */}
          <div className="stats-card">
            <h2>Monthly Statistics</h2>
            {monthlyStats ? (
              <table>
                <thead>
                  <tr>
                    <th>Month</th>
                    <th>Total Appointments</th>
                    <th>Total Income</th>
                    <th>Total Users Registered</th>
                  </tr>
                </thead>
                <tbody>
                  <tr key={monthlyStats.statID}>
                    <td>{monthlyStats.monthName}</td> {/* Assuming monthName is used for the month */}
                    <td>{monthlyStats.totalAppointments}</td>
                    <td>${monthlyStats.totalIncome.toFixed(2)}</td>
                    <td>{monthlyStats.totalUsersRegistered}</td>
                  </tr>
                </tbody>
              </table>
            ) : (
              <p>No monthly statistics available.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminPage;
