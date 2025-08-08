import React from 'react';
import { formatRiderName } from '../utils/maskRiderId';

/**
 * 라이더 정보를 표시하는 카드 컴포넌트
 * @param {Object} props
 * @param {string} props.riderId - 라이더 ID
 * @param {string} props.proposerName - 기존 컬럼명 (임시 지원)
 * @param {string} props.content - 표시할 내용
 * @param {string} props.date - 날짜
 * @param {string} props.className - 추가 CSS 클래스
 */
const RiderCard = ({ riderId, proposerName, content, date, className = '' }) => {
  // rider_id가 없으면 proposer_name을 사용 (하위 호환성)
  const displayId = riderId || proposerName;
  return (
    <div className={`rider-card ${className}`}>
      <div className="rider-info">
        <span className="rider-name">
          {formatRiderName(displayId)}
        </span>
        {date && (
          <span className="rider-date">
            {new Date(date).toLocaleDateString()}
          </span>
        )}
      </div>
      {content && (
        <div className="rider-content">
          {content}
        </div>
      )}
    </div>
  );
};

export default RiderCard;