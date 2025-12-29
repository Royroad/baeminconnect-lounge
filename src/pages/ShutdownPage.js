import { Container } from 'react-bootstrap';
import { FaInfoCircle, FaHeart } from 'react-icons/fa';

/**
 * 서비스 종료 안내 페이지 컴포넌트
 * 라운지 운영 종료를 사용자에게 안내
 */
const ShutdownPage = () => {
  return (
    <main className="container my-5">
      <Container className="text-center py-5">
        {/* 로고 영역 */}
        <div className="mb-4">
          <img
            src="/logo_cropped.png"
            alt="배민커넥트 로고"
            className="header-logo"
            style={{ maxWidth: '300px', margin: '0 auto' }}
          />
        </div>

        {/* 종료 안내 메시지 */}
        <div className="shutdown-message">
          <FaInfoCircle 
            className="mb-4" 
            style={{ fontSize: '4rem', color: '#2AC1BC' }} 
          />
          
          <h1 className="mb-4" style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#333' }}>
            서비스 종료 안내
          </h1>
          
          <div 
            className="alert alert-info mx-auto" 
            style={{ 
              maxWidth: '600px', 
              fontSize: '1.2rem', 
              lineHeight: '1.8',
              padding: '2rem',
              borderRadius: '15px',
              border: 'none',
              backgroundColor: '#e7f5f4'
            }}
          >
            <p className="mb-3">
              안녕하세요, 배민커넥트 라운지를 이용해 주신 모든 라이더님들께 감사드립니다.
            </p>
            <p className="mb-3">
              <strong>배민커넥트 라운지 운영이 종료</strong>됨에 따라 
              본 웹사이트도 <strong>더 이상 운영하지 않습니다</strong>.
            </p>
            <p className="mb-0">
              그동안 라운지를 사랑해 주신 모든 라이더님들께 진심으로 감사드립니다.
            </p>
          </div>

          {/* 감사 메시지 */}
          <div className="mt-5">
            <FaHeart 
              style={{ fontSize: '2rem', color: '#ff6b6b', marginBottom: '1rem' }} 
            />
            <p style={{ fontSize: '1.1rem', color: '#666', fontStyle: 'italic' }}>
              라이더님들의 소중한 의견과 참여에 감사드립니다.
            </p>
          </div>

          {/* 추가 안내 (필요시) */}
          <div className="mt-4" style={{ fontSize: '0.95rem', color: '#888' }}>
            <p>
              문의사항이 있으시면 배민커넥트 고객센터로 연락 부탁드립니다.
            </p>
          </div>
        </div>
      </Container>
    </main>
  );
};

export default ShutdownPage;

