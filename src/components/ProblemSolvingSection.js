import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Badge, Alert } from 'react-bootstrap';
import { FaCheckCircle, FaComments, FaCalendarAlt } from 'react-icons/fa';
import { getProblemSolvingCases, getSampleProblemSolvingCases } from '../services/counselingService';
import { formatRiderName } from '../utils/maskRiderId';

/**
 * 문제해결 사례 섹션 컴포넌트
 * 상담을 통해 해결된 문제사례들을 표시
 */
const ProblemSolvingSection = () => {
  const [cases, setCases] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCases = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // 실제 데이터 조회 (Supabase 연결 시) - 최신순 최대 12건
        const data = await getProblemSolvingCases(12);
        
        // 데이터가 없으면 샘플 데이터 사용
        if (!data || data.length === 0) {
          const sampleData = getSampleProblemSolvingCases();
          setCases(sampleData.slice(0, 12));
        } else {
          setCases(data);
        }
      } catch (err) {
        console.error('문제해결 사례 로딩 실패:', err);
        setError('데이터를 불러오는 중 오류가 발생했습니다.');
        
        // 오류 발생 시 샘플 데이터 사용
        const sampleData = getSampleProblemSolvingCases();
        setCases(sampleData.slice(0, 12));
      } finally {
        setIsLoading(false);
      }
    };

    fetchCases();
  }, []);

  /**
   * 날짜 포맷팅
   * @param {string} dateString - 날짜 문자열
   * @returns {string} 포맷된 날짜
   */
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('ko-KR', {
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  if (isLoading) {
    return (
      <section className="problem-solving-section mb-5">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">로딩 중...</span>
          </div>
        </div>
      </section>
    );
  }

  if (error && cases.length === 0) {
    return (
      <section className="problem-solving-section mb-5">
        <Alert variant="warning">
          <p className="mb-0">{error}</p>
        </Alert>
      </section>
    );
  }

  return (
    <section className="problem-solving-section mb-5">
      <div className="section-header mb-4">
        <h3 className="section-title">
          <FaCheckCircle className="title-icon text-success me-2" />
          문제해결 사례
        </h3>
        <p className="section-description text-muted">
          라운지 상담을 통해 해결된 실제 사례들을 확인해보세요
        </p>
      </div>

      <Row className="g-4">
        {cases.map((caseItem, index) => (
          <Col lg={6} key={caseItem.id || index}>
            <Card className="problem-solving-card h-100 border-0 shadow-sm">
              <Card.Body className="d-flex flex-column">
                {/* 콘텐츠 영역 (상단) */}
                <div className="case-content flex-grow-1">
                  <div className="problem-description mb-3">
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <h6 className="content-label-large mb-0">
                        <FaComments className="me-1 text-primary" />
                        상담 내용
                      </h6>
                      <div className="case-info-top d-flex align-items-center">
                        <small className="text-muted me-2">
                          <FaCalendarAlt className="me-1" />
                          {formatDate(caseItem.status_update_date || caseItem.visit_date)}
                        </small>
                        <Badge bg="success" className="status-badge">
                          <FaCheckCircle className="me-1" />
                          해결
                        </Badge>
                      </div>
                    </div>
                    <p className="problem-text">
                      {caseItem.main_content || caseItem.counseling_content}
                    </p>
                  </div>

                  {caseItem.action_content && (
                    <div className="solution-description mb-3">
                      <h6 className="content-label-large">
                        <FaCheckCircle className="me-1 text-success" />
                        해결 방법
                      </h6>
                      <p className="solution-text">
                        {caseItem.action_content}
                      </p>
                    </div>
                  )}

                  {caseItem.rider_feedback && (
                    <div className="rider-feedback mb-3">
                      <h6 className="content-label-large">
                        💬 라이더 피드백
                      </h6>
                      <blockquote className="feedback-quote">
                        "{caseItem.rider_feedback}"
                      </blockquote>
                    </div>
                  )}
                </div>

                {/* 메타데이터 영역 (하단) */}
                <div className="case-meta mt-auto pt-3 border-top">
                  <div className="d-flex justify-content-center">
                    <h6 className="content-label mb-0 text-center">
                      {formatRiderName(caseItem.rider_id)}
                    </h6>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {cases.length === 0 && (
        <div className="text-center py-5">
          <p className="text-muted">아직 표시할 문제해결 사례가 없습니다.</p>
        </div>
      )}
    </section>
  );
};

export default ProblemSolvingSection;
