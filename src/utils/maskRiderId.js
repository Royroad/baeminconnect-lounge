/**
 * Rider ID를 마스킹 처리하는 유틸리티 함수
 * @param {string} riderId - 마스킹할 rider ID
 * @returns {string} 마스킹된 rider ID (예: 'BC96****')
 */
export const maskRiderId = (riderId) => {
  if (!riderId || typeof riderId !== 'string') {
    return '****';
  }
  
  // 3글자 이하인 경우 전체 마스킹
  if (riderId.length <= 3) {
    return '*'.repeat(riderId.length);
  }
  
  // 4글자 이상인 경우: 왼쪽 4글자만 보이고 나머지는 '*'로 마스킹
  // 4글자인 경우에도 마지막 1글자는 마스킹
  if (riderId.length === 4) {
    return riderId.substring(0, 3) + '*';
  }
  
  // 5글자 이상인 경우: 왼쪽 4글자만 보이고 나머지는 '*'로 마스킹
  const visiblePart = riderId.substring(0, 4);
  const maskedPart = '*'.repeat(riderId.length - 4);
  
  return `${visiblePart}${maskedPart}`;
};

/**
 * 마스킹된 rider ID와 함께 라이더님 텍스트를 반환
 * @param {string} riderId - 마스킹할 rider ID
 * @returns {string} 마스킹된 형태의 라이더 표시명 (예: 'BC96**** 라이더님')
 */
export const formatRiderName = (riderId) => {
  const maskedId = maskRiderId(riderId);
  return `${maskedId} 라이더님`;
};

/**
 * 여러 rider ID를 한번에 마스킹 처리
 * @param {Array} riderIds - 마스킹할 rider ID 배열
 * @returns {Array} 마스킹된 rider ID 배열
 */
export const maskMultipleRiderIds = (riderIds) => {
  if (!Array.isArray(riderIds)) {
    return [];
  }
  
  return riderIds.map(riderId => maskRiderId(riderId));
};