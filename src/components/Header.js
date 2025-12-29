import { Container } from 'react-bootstrap';

/**
 * 헤더 컴포넌트
 * 로고, 슬로건 포함 (서비스 종료로 네비게이션 제거)
 */
const Header = () => {

  return (
    <header>
      {/* 로고 및 슬로건 섹션 */}
      <div className="bg-light py-4">
        <Container>
          <div className="text-center">
            <div className="header-logo-container mb-3">
              {(() => {
                const LOGO_VERSION = '2';
                return (
                  <img
                    src={`/logo_cropped.png?v=${LOGO_VERSION}`}
                    alt="배민커넥트 로고"
                    className="header-logo"
                  />
                );
              })()}
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

      {/* 네비게이션 메뉴 - 서비스 종료로 인해 제거 */}
    </header>
  );
};

export default Header;