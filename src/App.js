import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import 'bootstrap/dist/js/bootstrap.bundle.min';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ShutdownPage from './pages/ShutdownPage';

/**
 * 메인 App 컴포넌트
 * 간소화된 안내 페이지만 표시
 */
function App() {
  return (
    <Router>
      <div className="App">
        {/* 모든 라우트를 안내 페이지로 리다이렉트 */}
        <Routes>
          <Route path="/" element={<ShutdownPage />} />
          <Route path="/suggestions" element={<Navigate to="/" replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;