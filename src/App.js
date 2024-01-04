import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Home from "./components/Home";
import Chat from "./components/Chat";
import Login from "./components/Login";
import withAuthProtection from "./components/WithAuthProtection";
import Settings from "./components/Settings";
import Menu from "./components/Menu";
import Alerts from './components/Alerts';
import { Container } from "react-bootstrap";

function App() {
  const HomeWithProtection = withAuthProtection(Home);
  const ChatWithProtection = withAuthProtection(Chat);
  const SettingsWithProtection = withAuthProtection(Settings);
  const AlertsWithProtection = withAuthProtection(Alerts);

  return (
    <Router>
      <Menu />
      <Container>
        <Routes>
          <Route exact path="/" element={<HomeWithProtection />} />
          <Route exact path="/login" element={<Login />} />
          <Route exact path="/chat" element={<ChatWithProtection />} />
          <Route exact path="/settings" element={<SettingsWithProtection />} />
          <Route exact path='/alerts' element={<AlertsWithProtection />} />
        </Routes>
      </Container>
    </Router>
  );
}
export default App;
