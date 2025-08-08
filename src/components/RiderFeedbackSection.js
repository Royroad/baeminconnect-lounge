import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Alert, Badge } from 'react-bootstrap';
import { FaLightbulb, FaCalendarAlt, FaCheckCircle } from 'react-icons/fa';
import { getCompletedImprovements, getSampleCompletedImprovements } from '../services/counselingService';
import { formatRiderName } from '../utils/maskRiderId';

/**
 * 개선 완료 아이템 섹션 컴포넌트
 * 라이더님 제안으로 개선된 실제 아이템들을 표시
 */
const RiderFeedbackSection = () => {
  const [improvements, setImprovements] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchImprovements = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // 실제 데이터 조회 (Supabase 연결 시)
        const data = await getCompletedImprovements(10);
        
        // 데이터가 없으면 샘플 데이터 사용
        if (!data || data.length === 0) {
          const sampleData = getSampleCompletedImprovements();
          setImprovements(sampleData);
        } else {
          setImprovements(data);
        }
      } catch (err) {
        console.error('개선 완료 아이템 로딩 실패:', err);
        setError('데이터를 불러오는 중 오류가 발생했습니다.');
        
        // 오류 발생 시 샘플 데이터 사용
        const sampleData = getSampleCompletedImprovements();
        setImprovements(sampleData);
      } finally {
        setIsLoading(false);
      }
    };

    fetchImprovements();
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
      <section className="rider-feedback-section mb-5">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">로딩 중...</span>
          </div>
        </div>
      </section>
    );
  }

  if (error && improvements.length === 0) {
    return (
      <section className="rider-feedback-section mb-5">
        <Alert variant="warning">
          <p className="mb-0">{error}</p>
        </Alert>
      </section>
    );
  }

  return (
    <section className="rider-feedback-section mb-5">
      <div className="section-header mb-4">
        <h3 className="section-title">
          <FaLightbulb className="title-icon text-warning me-2" />
          라이더님 제안으로 개선된 정책 및 서비스
        </h3>
        <p className="section-description text-muted">
          라이더님들의 소중한 제안으로 실제 개선된 정책 및 서비스들입니다
        </p>
      </div>

      <Row className="g-4">
        {improvements.map((improvement, index) => (
          <Col lg={4} md={6} key={improvement.id || index}>
            <Card className="rider-feedback-card h-100 border-0 shadow-sm">
              <Card.Body className="d-flex flex-column">
                {/* 콘텐츠 영역 (상단) */}
                <div className="case-content flex-grow-1">
                  <div className="improvement-summary mb-3">
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <h6 className="content-label-large mb-0">
                        <FaLightbulb className="me-1 text-primary" />
                        제안 내용
                      </h6>
                      <div className="case-info-top d-flex align-items-center">
                        <small className="text-muted me-2">
                          <FaCalendarAlt className="me-1" />
                          {formatDate(improvement.status_update_date || improvement.visit_date)}
                        </small>
                        <Badge bg={improvement.action_status === '조치완료' ? 'success' : 'warning'} className="status-badge">
                          <FaCheckCircle className="me-1" />
                          {improvement.action_status}
                        </Badge>
                      </div>
                    </div>
                    <p className="problem-text">
                      {improvement.main_content || improvement.counseling_content}
                    </p>
                  </div>

                  {improvement.action_content && (
                    <div className="action-summary mb-3">
                      <h6 className="content-label-large">
                        <FaCheckCircle className="me-1 text-success" />
                        조치 내용
                      </h6>
                      <p className="solution-text">
                        {improvement.action_content}
                      </p>
                    </div>
                  )}

                  {improvement.rider_feedback && (
                    <div className="rider-feedback mb-3">
                      <h6 className="content-label-large">
                        💬 라이더 피드백
                      </h6>
                      <blockquote className="feedback-quote">
                        "{improvement.rider_feedback}"
                      </blockquote>
                    </div>
                  )}
                </div>

                {/* 메타데이터 영역 (하단) */}
                <div className="case-meta mt-auto pt-3 border-top">
                  <div className="d-flex justify-content-center">
                    <h6 className="content-label mb-0 text-center">
                      {formatRiderName(improvement.rider_id)}
                    </h6>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {improvements.length === 0 && (
        <div className="text-center py-5">
          <p className="text-muted">아직 표시할 개선 완료 아이템이 없습니다.</p>
        </div>
      )}
    </section>
  );
};

export default RiderFeedbackSection;
