import { useState, useEffect } from 'react';
import { Alert, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaLightbulb, FaTimes, FaArrowRight } from 'react-icons/fa';
import { getCompletedImprovements, getProblemSolvingCases } from '../services/counselingService';
import { formatRiderName } from '../utils/maskRiderId';

/**
 * 개선사항 배너 컴포넌트
 * 최근 라이더 제안으로 개선된 아이템을 메인 화면에 표시
 */
const ImprovementBanner = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [latestImprovement, setLatestImprovement] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // 컴포넌트 마운트 시 최근 개선 아이템 데이터 가져오기
  useEffect(() => {
    const fetchLatestImprovement = async () => {
      try {
        // 두 쿼리를 병렬로 수행하여 지연시간 최소화
        const [improvements, problemSolving] = await Promise.all([
          getCompletedImprovements(1), // rider_feedback 필수, status_update_date DESC
          getProblemSolvingCases(1) // rider_feedback 필수, status_update_date DESC
        ]);

        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

        const topImprovement = (improvements && improvements[0]) || null;
        const topProblem = (problemSolving && problemSolving[0]) || null;

        // 선정 규칙
        // 1) 개선(정책/서비스 개선)의 최상위 1건이 최근 7일 이내면 그 건 노출
        if (topImprovement && topImprovement.status_update_date) {
          const updateDate = new Date(topImprovement.status_update_date);
          if (!isNaN(updateDate) && updateDate >= oneWeekAgo) {
            setLatestImprovement(topImprovement);
            setIsLoading(false);
            return;
          }
        }

        // 2) 아니면 문제해결의 최상위 1건 노출
        if (topProblem) {
          setLatestImprovement(topProblem);
        } else if (topImprovement) {
          // 예외: 문제해결이 없으면 개선 최상위 1건이라도 사용
          setLatestImprovement(topImprovement);
        } else {
          setLatestImprovement(null);
        }
      } catch (error) {
        console.error('최근 개선 아이템 로딩 실패:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLatestImprovement();
  }, []);

  const handleClose = () => {
    setIsVisible(false);
  };

  // 로딩 중이거나 데이터가 없거나 배너가 닫혀있으면 표시하지 않음
  if (!isVisible || isLoading || !latestImprovement) return null;

  const riderNameMasked = formatRiderName(latestImprovement.rider_id);
  const actionContent = latestImprovement.action_content || latestImprovement.main_content || latestImprovement.counseling_content;
  const isImprovement = latestImprovement.visit_purpose === '정책/서비스 개선';
  const titleText = isImprovement
    ? `🎉 ${riderNameMasked} 제안으로 정책 및 서비스가 개선되었습니다!`.replace('라이더님 라이더님', '라이더님')
    : `✅ ${riderNameMasked}이 라운지를 방문하여 문제를 해결했어요!`;

  return (
    <Alert className="improvement-banner d-flex align-items-center justify-content-between">
      <div className="d-flex align-items-center">
        <FaLightbulb className="banner-icon me-3" />
        <div className="banner-content">
          <div className="banner-title">
            {titleText}
          </div>
          <div className="banner-summary">
            {actionContent}
          </div>
        </div>
      </div>
      
      <div className="d-flex align-items-center">
        <Button 
          as={Link} 
          to="/suggestions" 
          variant="outline-dark" 
          size="sm"
          className="me-2 banner-btn"
        >
          더보기 <FaArrowRight size={12} className="ms-1" />
        </Button>
        <Button 
          variant="link" 
          size="sm" 
          onClick={handleClose}
          className="text-muted p-0"
          aria-label="배너 닫기"
        >
          <FaTimes />
        </Button>
      </div>
    </Alert>
  );
};

export default ImprovementBanner; 