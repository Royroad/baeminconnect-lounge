import { Container } from 'react-bootstrap';

/**
 * 간단한 안내 페이지
 * 라운지 운영 종료로 인한 자연스러운 fade out
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
            style={{ maxWidth: '300px', margin: '0 auto', opacity: 0.7 }}
          />
        </div>

        {/* 간단한 안내 메시지 */}
        <div className="shutdown-message" style={{ opacity: 0.8 }}>
          <h2 className="mb-4" style={{ fontSize: '1.8rem', fontWeight: 'normal', color: '#666' }}>
            배민커넥트 라운지
          </h2>
          
          <p style={{ fontSize: '1.1rem', color: '#888', lineHeight: '1.8', maxWidth: '500px', margin: '0 auto' }}>
            라운지 운영이 종료되어 본 페이지는 더 이상 업데이트되지 않습니다.
          </p>

          <div className="mt-4" style={{ fontSize: '0.9rem', color: '#aaa' }}>
            <p>문의: 카카오톡 채널(@배민커넥트)</p>
          </div>
        </div>
      </Container>
    </main>
  );
};

export default ShutdownPage;

