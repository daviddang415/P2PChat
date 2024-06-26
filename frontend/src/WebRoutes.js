import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Home } from './pages/Home';
import { Webchat } from './pages/Webchat';

export const WebRoutes = () => {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Home />}></Route>
                <Route path="/webchat" element={<Webchat />}></Route>
            </Routes>
        </Router>
    )
}