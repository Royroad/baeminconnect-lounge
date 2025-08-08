import { Navbar, Nav, Container } from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom';

/**
 * 헤더 네비게이션 컴포넌트
 * 로고, 슬로건, 메인 네비게이션 포함
 */
const Header = () => {
  const location = useLocation();

  return (
    <header>
      {/* 로고 및 슬로건 섹션 */}
      <div className="bg-light py-4">
        <Container>
          <div className="text-center">
            <div className="header-logo-container mb-3">
              <img 
                src="/logo_basic.png" 
                alt="배민커넥트 로고" 
                className="header-logo"
              />
            </div>
            <div>
              <h1 className="header-title mb-2">라운지</h1>
              <p className="header-subtitle mb-0 text-muted fs-5">
                라이더님을 위한 편안한 휴식 공간
              </p>
            </div>
          </div>
        </Container>
      </div>

      {/* 네비게이션 메뉴 */}
      <Navbar expand="lg" className="custom-navbar">
        <Container>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto">
              <Nav.Link 
                as={Link} 
                to="/" 
                className={`nav-link-custom ${location.pathname === '/' ? 'active' : ''}`}
              >
                라운지 안내
              </Nav.Link>
              <Nav.Link 
                as={Link} 
                to="/suggestions" 
                className={`nav-link-custom ${location.pathname === '/suggestions' ? 'active' : ''}`}
              >
                서비스 개선 현황
              </Nav.Link>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </header>
  );
};

export default Header;