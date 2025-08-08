import { supabase } from '../config/supabase';

/**
 * 문제해결 사례 조회
 * 필터링 조건: 방문목적='문제해결' AND 조치상태='해결' AND 모든 주요 컬럼 값 존재
 * 필수 컬럼: 주요 내용, 조치 내용, 라이더 피드백(공개용), 아이디, 상태 업데이트일
 * @param {number} limit - 조회할 최대 개수
 * @returns {Promise<Array>} 문제해결 사례 목록
 */
export const getProblemSolvingCases = async (limit = 10) => {
  try {
    if (!supabase) {
      console.error('❌ Supabase 클라이언트가 초기화되지 않았습니다');
      return [];
    }

    // 모든 필수 컬럼 값이 존재하는 완전한 해결 사례만 노출
    const { data, error } = await supabase
      .from('rider_voc_cases') // 통합 테이블명
      .select('*')
      .eq('visit_purpose', '문제해결') // 방문목적 필터
      .eq('action_status', '해결') // 조치상태: '해결'만
      .not('main_content', 'is', null) // 주요 내용 필수
      .not('main_content', 'eq', '') // 빈 문자열 제외
      .not('action_content', 'is', null) // 조치 내용 필수
      .not('action_content', 'eq', '') // 빈 문자열 제외
      .not('rider_feedback', 'is', null) // 라이더 피드백 필수
      .not('rider_feedback', 'eq', '') // 빈 문자열 제외
      .not('rider_id', 'is', null) // 라이더 ID 필수
      .not('rider_id', 'eq', '') // 빈 문자열 제외
      .not('status_update_date', 'is', null) // 상태 업데이트일 필수
      .order('status_update_date', { ascending: false }) // 해결날짜 순으로 정렬
      .limit(limit);

    if (error) {
      console.error('❌ 문제해결 사례 조회 오류:', error);
      return [];
    }

    return data || [];
  } catch (err) {
    console.error('❌ 예상치 못한 오류:', err);
    return [];
  }
};

/**
 * 개선 완료 아이템 조회 (기존 getRiderFeedbacks 대체)
 * 필터링 조건: 방문목적='정책/서비스 개선' AND 조치상태 IN ('조치완료', '일부 조치완료') AND 라이더피드백 존재
 * @param {number} limit - 조회할 최대 개수  
 * @returns {Promise<Array>} 개선 완료 아이템 목록
 */
export const getCompletedImprovements = async (limit = 6) => {
  try {
    if (!supabase) {
      console.error('❌ Supabase 클라이언트가 초기화되지 않았습니다');
      return [];
    }

    const { data, error } = await supabase
      .from('rider_voc_cases') // 통합 테이블명
      .select('*')
      .eq('visit_purpose', '정책/서비스 개선') // 방문목적 필터
      .in('action_status', ['조치완료', '일부 조치완료']) // 조치상태 필터
      .not('rider_feedback', 'is', null) // 라이더 피드백이 있는 것만
      .not('rider_feedback', 'eq', '') // 빈 문자열 제외
      .not('status_update_date', 'is', null) // 상태 업데이트일 필수
      .order('status_update_date', { ascending: false }) // 완료날짜 순으로 정렬
      .limit(limit);

    if (error) {
      console.error('❌ 개선 완료 아이템 조회 오류:', error);
      return [];
    }

    return data || [];
  } catch (err) {
    console.error('❌ 예상치 못한 오류:', err);
    return [];
  }
};

/**
 * 배너용 개선 완료 아이템 조회
 * 필터링 조건: 방문목적='정책/서비스 개선' AND 조치상태 IN ('조치완료', '일부 조치완료') AND 상태 업데이트일 존재
 * @param {number} limit - 조회할 최대 개수  
 * @returns {Promise<Array>} 배너용 개선 완료 아이템 목록
 */
export const getCompletedImprovementsForBanner = async (limit = 20) => {
  try {
    if (!supabase) {
      console.error('❌ Supabase 클라이언트가 초기화되지 않았습니다');
      return [];
    }

    const { data, error } = await supabase
      .from('rider_voc_cases')
      .select('*')
      .eq('visit_purpose', '정책/서비스 개선')
      .in('action_status', ['조치완료', '일부 조치완료'])
      .not('status_update_date', 'is', null)
      .order('status_update_date', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('❌ 배너용 개선 아이템 조회 오류:', error);
      return [];
    }

    return data || [];
  } catch (err) {
    console.error('❌ 예상치 못한 오류:', err);
    return [];
  }
};

/**
 * VOC 통계 조회
 * @returns {Promise<Object>} VOC 통계 정보
 */
export const getVocStatistics = async () => {
  try {
    if (!supabase) {
      console.error('❌ Supabase 클라이언트가 초기화되지 않았습니다');
      return {
        totalCases: 0,
        problemSolvingCases: 0,
        improvementCases: 0,
        thisMonthCases: 0
      };
    }

    // 현재 월 계산
    const now = new Date();
    const thisMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    const [totalResult, problemSolvingResult, improvementResult, thisMonthResult] = await Promise.all([
      supabase.from('rider_voc_cases').select('id', { count: 'exact' }),
      supabase.from('rider_voc_cases').select('id', { count: 'exact' })
        .eq('visit_purpose', '문제해결')
        .eq('action_status', '해결')
        .not('rider_feedback', 'is', null),
      supabase.from('rider_voc_cases').select('id', { count: 'exact' })
        .eq('visit_purpose', '정책/서비스 개선')
        .in('action_status', ['조치완료', '일부 조치완료'])
        .not('rider_feedback', 'is', null),
      supabase.from('rider_voc_cases').select('id', { count: 'exact' }).gte('visit_date', `${thisMonth}-01`)
    ]);

    return {
      totalCases: totalResult.count || 0,
      problemSolvingCases: problemSolvingResult.count || 0,
      improvementCases: improvementResult.count || 0,
      thisMonthCases: thisMonthResult.count || 0
    };
  } catch (err) {
    console.error('❌ VOC 통계 조회 오류:', err);
    return {
      totalCases: 0,
      problemSolvingCases: 0,
      improvementCases: 0,
      thisMonthCases: 0
    };
  }
};

// 샘플 데이터 (개발/테스트용) - 새 테이블 구조에 맞게 업데이트
export const getSampleProblemSolvingCases = () => [
  {
    id: 1,
    rider_id: 'BC231234',
    visit_purpose: '문제해결',
    main_content: '시스템 오류로 인한 수단 변경 불가', // 상담 내용 (K열)
    action_status: '해결',
    action_content: '시스템 오류 확인 후 수단 변경 기능 즉시 복구', // 해결 방법 (M열)
    status_update_date: '2024-01-15', // 해결날짜 (N열)
    rider_feedback: '오류로 수단 변경이 어려운 상태였는데 상담을 통해 오류를 바로 해결해줘서 고마워요.' // 라이더 피드백 (Q열)
  },
  {
    id: 2,
    rider_id: 'BC457890',
    visit_purpose: '문제해결',
    main_content: '정산 내역 불일치 및 누락 배달료',
    action_status: '해결',
    action_content: '정산 내역 재검토 후 누락된 배달료 추가 지급',
    status_update_date: '2024-01-18',
    rider_feedback: '정산에 문제가 있었는데 빠르게 확인해서 해결해주셔서 감사합니다. 신뢰가 생겨요.'
  },
  {
    id: 3,
    rider_id: 'BC789012',
    visit_purpose: '문제해결',
    main_content: '계정 로그인 오류 및 인증 문제',
    action_status: '해결',
    action_content: '계정 보안 설정 재설정 및 로그인 기능 복구',
    status_update_date: '2024-01-20',
    rider_feedback: '앱에 로그인이 안돼서 일을 못할뻔했는데 바로 해결해주셔서 다행이에요.'
  }
];

export const getSampleCompletedImprovements = () => [
  {
    id: 4,
    rider_id: 'BC345678',
    visit_purpose: '정책/서비스 개선',
    main_content: '배달 경로 추천 알고리즘 개선 요청', // 제안 내용
    action_status: '조치완료',
    action_content: '경로 추천 알고리즘 업데이트 및 AI 기반 최적화 도입', // 조치 내용
    status_update_date: '2024-02-15', // 완료날짜
    rider_feedback: '경로 추천 기능이 많이 개선됐네요. 배달 시간이 확실히 단축됐어요.'
  },
  {
    id: 5,
    rider_id: 'BC567890',
    visit_purpose: '정책/서비스 개선',
    main_content: '라운지 운영시간 연장 요청',
    action_status: '조치완료',
    action_content: '라운지 운영시간을 기존 22시에서 24시로 연장',
    status_update_date: '2024-02-01',
    rider_feedback: '라운지 운영 시간이 연장돼서 휴식하기가 훨씬 편해졌습니다. 감사해요!'
  },
  {
    id: 6,
    rider_id: 'BC678901',
    visit_purpose: '정책/서비스 개선',
    main_content: '기피지역 추가 수당 및 인센티브 개선',
    action_status: '일부 조치완료',
    action_content: '기피지역 수당 20% 인상 및 야간 추가 수당 신설',
    status_update_date: '2024-02-10',
    rider_feedback: '기피지역 수당이 개선돼서 일하는 보람이 생겼어요. 추가 개선도 기대됩니다!'
  }
];
