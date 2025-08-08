import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import 'bootstrap/dist/js/bootstrap.bundle.min';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import MainPage from './pages/MainPage';
import SuggestionsPage from './pages/SuggestionsPage';

/**
 * 메인 App 컴포넌트
 * 라우팅을 설정하고 공통 레이아웃(헤더, 푸터)을 제공
 */
function App() {
  return (
    <Router>
      <div className="App">
        {/* 공통 헤더 */}
        <Header />

        {/* 라우팅 컨텐츠 */}
        <Routes>
          <Route path="/" element={<MainPage />} />
          <Route path="/suggestions" element={<SuggestionsPage />} />
        </Routes>

        {/* 공통 푸터 */}
        <Footer />
      </div>
    </Router>
  );
}

export default App;