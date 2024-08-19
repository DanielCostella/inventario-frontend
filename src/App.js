import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Switch, Redirect } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('authToken'));

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  return (
    <Router>
      <Switch>
        <Route path="/login">
          {isAuthenticated ? <Redirect to="/dashboard" /> : <Login onLogin={handleLogin} />}
        </Route>
        <Route path="/dashboard">
          {isAuthenticated ? <Dashboard /> : <Redirect to="/login" />}
        </Route>
        <Redirect from="/" to="/login" />
      </Switch>
    </Router>
  );
}

export default App;