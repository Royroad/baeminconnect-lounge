import React from 'react';
import { Alert, Button } from 'react-bootstrap';
import { FaExternalLinkAlt } from 'react-icons/fa';
import ProblemSolvingSection from '../components/ProblemSolvingSection';
import RiderFeedbackSection from '../components/RiderFeedbackSection';

/**
 * 라이더 제안함 페이지 컴포넌트
 * 라이더분들의 제안과 개선 현황을 체계적으로 관리하고 표시
 */
const SuggestionsPage = () => {

  return (
    <main className="container my-5">
      {/* 페이지 제목 */}
      <div className="text-center mb-5">
        <h1 className="section-title">라이더 서비스 개선 현황</h1>
        <p className="text-muted fs-5">라이더님들의 소중한 의견이 실제 서비스 개선으로 이어지고 있습니다</p>
      </div>

      {/* 문제해결 사례 섹션 */}
      <ProblemSolvingSection />

      {/* 라이더 피드백 섹션 */}
      <RiderFeedbackSection />

      {/* 새로운 제안하기 */}
      <section className="text-center">
        <Alert variant="light" className="suggestion-cta">
          <h4 className="mb-3">🤝 서비스 경험 개선, 라이더님과 함께 만들어갑니다!</h4>
          <p className="mb-4">불편하셨던 점이나 개선 아이디어가 있으시면 언제든 편하게 말씀해 주세요</p>

          <div className="suggestion-methods">
            <Button variant="outline-dark" size="lg" className="me-3 mb-2">
              <FaExternalLinkAlt className="me-2" />
              카카오톡 채널(@배민커넥트)
            </Button>
            <Button variant="outline-dark" size="lg" className="me-3 mb-2">
              현장 제안함 이용
            </Button>
            <Button variant="outline-dark" size="lg" className="mb-2">
              배민커넥트 앱 피드백
            </Button>
          </div>
        </Alert>
      </section>


    </main>
  );
};

export default SuggestionsPage; 