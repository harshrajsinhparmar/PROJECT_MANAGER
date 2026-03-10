import React, { useEffect } from "react"
import SignUpPage from './Components/SignupPage'
import { BrowserRouter, Routes, Route, useParams } from "react-router-dom"
import DashBoard from "./Components/DashBoard"
import LoginPage from "./Components/LoginPage"
import Projects from "./Components/Projects"
import Details from "./Components/Details"
import { GuestGuard, LoginGuard, ProjectGuard } from "./Components/Guards"
import EditProfile from "./Components/EditProfile";
import { useSelector } from "react-redux";
function App() {
  const mode = useSelector((state) => state.registration.mode);
  useEffect(() => {
    document.body.className = mode;
  }, [mode]);
  return (<>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<SignUpPage />} />

        <Route element={<GuestGuard />} >
          <Route path="/login" element={<LoginPage />} />
        </Route>

        <Route element={<LoginGuard />} >
          <Route path="/dashboard" element={<DashBoard />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/profile" element={<EditProfile />} />
          <Route element={<ProjectGuard />} >
            <Route path="/projects/:id" element={<Details />} />
          </Route>
        </Route>

        <Route path="/*" element={<h1>404 NOT FOUND</h1>} />
      </Routes>

    </BrowserRouter >
  </>
  )
}

export default App
