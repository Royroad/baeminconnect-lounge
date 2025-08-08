import { supabase } from '../config/supabase';

/**
 * 라이더 제안 관련 데이터를 관리하는 서비스
 * Supabase 데이터베이스와의 모든 상호작용을 담당
 */

// 데모 모드 확인
const isDemo = !supabase;

// 데모용 샘플 데이터 (실제 VOC 현황 반영)
const DEMO_DATA = {
  statistics: {
    totalSuggestions: 13,
    completedImprovements: 3,
    inProgress: 7,
    newThisMonth: 13
  },
  improvements: [
    {
      id: 1,
      title: "기피지역 서비스 확대",
      rider_id: "김라이더", 
      completed_date: "2025-07-16",
      description: "기피지역 서비스 불편으로 인한 개선 요청 사항",
      effect_description: "기피지역 추가 및 라이더 교육 강화",
      feedback: "해당 지역 라이더분들의 서비스 만족도가 크게 향상되었습니다!",
      department: "서비스운영팀"
    },
    {
      id: 2,
      title: "기피지역 라이더 인지도 개선",
      rider_id: "이라이더",
      completed_date: "2025-07-11",
      description: "기피지역에 대한 라이더 인지 부족 문제 해결",
      effect_description: "라이더 앱 내 기피지역 공지 및 교육 자료 제공",
      feedback: "신규 및 기존 라이더 모두에게 도움이 되고 있습니다.",
      department: "서비스운영팀"
    },
    {
      id: 3,
      title: "마스터 등급 프로모션 기준 명확화",
      rider_id: "박라이더",
      completed_date: "2025-07-04",
      description: "등급 프로모션 기준이 모호하여 발생하는 문의 해결",
      effect_description: "프로모션 기준 공개 및 프로세스 간소화",
      feedback: "등급 시스템에 대한 이해도와 만족도가 향상되었습니다.",
      department: "고객지원팀"
    }
  ],
  progressItems: [
    {
      id: 1,
      title: "배민라이더스쿨 이벤트 시스템 개선",
      rider_id: "최라이더",
      progress_percentage: 60,
      current_status: "보상 프로세스 개선 중",
      expected_completion: "2025-07-04",
      department: "교육지원팀"
    },
    {
      id: 2,
      title: "오배달 프로세스 간소화",
      rider_id: "정라이더",
      progress_percentage: 40,
      current_status: "30분 귀책인 오배달 미비가미정쟁 개선 중",
      expected_completion: "2025-08-15",
      department: "고객지원팀"
    },
    {
      id: 3,
      title: "민감한 업소 관리 프로세스 개선",
      rider_id: "신라이더",
      progress_percentage: 40,
      current_status: "업소 분류 기준 수립 중",
      expected_completion: "2025-08-30",
      department: "업소관리팀"
    },
    {
      id: 4,
      title: "비위생 업소 구분 시스템",
      rider_id: "한라이더",
      progress_percentage: 10,
      current_status: "진행 대기 중",
      expected_completion: "2025-09-30",
      department: "업소관리팀"
    }
  ],
  pendingReviews: [
    { id: 1, title: "알림음 관련 개선", rider_id: "강라이더", created_at: "2025-01-15" },
    { id: 2, title: "조리대기 시간 최적화", rider_id: "조라이더", created_at: "2025-01-14" },
    { id: 3, title: "서울외지역 서비스 개선", rider_id: "윤라이더", created_at: "2025-01-13" },
    { id: 4, title: "업소 접수 시스템 개선", rider_id: "장라이더", created_at: "2025-01-12" }
  ],
  contributors: [
    { name: "김라이더", contributions: 3, implemented: 2 },
    { name: "이라이더", contributions: 2, implemented: 1 },
    { name: "박라이더", contributions: 2, implemented: 1 }
  ]
};

// ========================================
// 통계 데이터 가져오기
// ========================================

/**
 * 제안함 통계 정보를 가져옵니다
 * @returns {Object} 통계 객체 (총 제안수, 완료수, 진행중, 신규)
 */
export const getSuggestionsStatistics = async () => {
  // 데모 모드일 때는 더미 데이터 반환
  if (isDemo) {
    return DEMO_DATA.statistics;
  }
  
  try {
    // 총 제안 수
    const { count: totalSuggestions } = await supabase
      .from('suggestions')
      .select('*', { count: 'exact', head: true });

    // 완료된 개선 수
    const { count: completedImprovements } = await supabase
      .from('improvements')
      .select('*', { count: 'exact', head: true });

    // 진행 중인 항목 수
    const { count: inProgress } = await supabase
      .from('progress_items')
      .select('*', { count: 'exact', head: true });

    // 이번 달 신규 제안 수
    const currentMonth = new Date();
    currentMonth.setDate(1); // 이번 달 1일
    
    const { count: newThisMonth } = await supabase
      .from('suggestions')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', currentMonth.toISOString());

    return {
      totalSuggestions: totalSuggestions || 0,
      completedImprovements: completedImprovements || 0,
      inProgress: inProgress || 0,
      newThisMonth: newThisMonth || 0
    };
  } catch (error) {
    console.error('통계 데이터 가져오기 실패:', error);
    return {
      totalSuggestions: 0,
      completedImprovements: 0,
      inProgress: 0,
      newThisMonth: 0
    };
  }
};

// ========================================
// 개선 완료 아이템 관리
// ========================================

/**
 * 완료된 개선 아이템들을 가져옵니다
 * @param {number} limit 가져올 아이템 수 (기본값: 10)
 * @returns {Array} 완료된 개선 아이템 배열
 */
export const getCompletedImprovements = async (limit = 10) => {
  // 데모 모드일 때는 더미 데이터 반환
  if (isDemo) {
    return DEMO_DATA.improvements.slice(0, limit);
  }
  
  try {
    const { data, error } = await supabase
      .from('improvements')
      .select('*')
      .order('completed_date', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('완료된 개선 아이템 가져오기 실패:', error);
    return [];
  }
};

/**
 * 최근 완료된 개선 아이템 하나를 가져옵니다 (배너용)
 * @returns {Object|null} 최근 완료된 개선 아이템
 */
export const getLatestImprovement = async () => {
  // 데모 모드일 때는 더미 데이터 반환
  if (isDemo) {
    return DEMO_DATA.improvements[0];
  }
  
  try {
    const { data, error } = await supabase
      .from('improvements')
      .select('*')
      .order('completed_date', { ascending: false })
      .limit(1)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('최근 개선 아이템 가져오기 실패:', error);
    return null;
  }
};

// ========================================
// 진행 중인 아이템 관리
// ========================================

/**
 * 현재 진행 중인 아이템들을 가져옵니다
 * @returns {Array} 진행 중인 아이템 배열
 */
export const getInProgressItems = async () => {
  // 데모 모드일 때는 더미 데이터 반환
  if (isDemo) {
    return DEMO_DATA.progressItems;
  }
  
  try {
    const { data, error } = await supabase
      .from('progress_items')
      .select('*')
      .order('last_updated', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('진행 중인 아이템 가져오기 실패:', error);
    return [];
  }
};

// ========================================
// 검토 중인 제안 관리
// ========================================

/**
 * 검토 중인 제안들을 가져옵니다
 * @param {number} limit 가져올 제안 수 (기본값: 10)
 * @returns {Array} 검토 중인 제안 배열
 */
export const getPendingReviews = async (limit = 10) => {
  // 데모 모드일 때는 더미 데이터 반환
  if (isDemo) {
    return DEMO_DATA.pendingReviews.slice(0, limit);
  }
  
  try {
    const { data, error } = await supabase
      .from('suggestions')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('검토 중인 제안 가져오기 실패:', error);
    return [];
  }
};

// ========================================
// 기여자 랭킹 관리
// ========================================

/**
 * 상위 기여자들을 가져옵니다
 * @param {number} limit 가져올 기여자 수 (기본값: 3)
 * @returns {Array} 기여자 랭킹 배열
 */
export const getTopContributors = async (limit = 3) => {
  // 데모 모드일 때는 더미 데이터 반환
  if (isDemo) {
    return DEMO_DATA.contributors.slice(0, limit);
  }
  
  try {
    // 제안자별 제안 수와 채택 수를 계산
    const { data: suggestionCounts, error: suggestionError } = await supabase
      .from('suggestions')
          .select('rider_id')
    .not('rider_id', 'is', null);

    const { data: implementedCounts, error: implementedError } = await supabase
      .from('improvements')
          .select('rider_id')
    .not('rider_id', 'is', null);

    if (suggestionError || implementedError) {
      throw suggestionError || implementedError;
    }

    // 기여자별 통계 계산
    const contributorStats = {};

    // 총 제안 수 계산
    suggestionCounts.forEach(item => {
      const name = item.rider_id;
      if (!contributorStats[name]) {
        contributorStats[name] = { contributions: 0, implemented: 0 };
      }
      contributorStats[name].contributions++;
    });

    // 채택된 제안 수 계산
    implementedCounts.forEach(item => {
      const name = item.rider_id;
      if (contributorStats[name]) {
        contributorStats[name].implemented++;
      }
    });

    // 배열로 변환하고 정렬
    const contributors = Object.entries(contributorStats)
      .map(([name, stats]) => ({
        name,
        contributions: stats.contributions,
        implemented: stats.implemented
      }))
      .sort((a, b) => b.implemented - a.implemented || b.contributions - a.contributions)
      .slice(0, limit);

    return contributors;
  } catch (error) {
    console.error('기여자 랭킹 가져오기 실패:', error);
    return [];
  }
};

// ========================================
// 새로운 제안 추가
// ========================================

/**
 * 새로운 제안을 추가합니다
 * @param {Object} suggestion 제안 객체
 * @returns {Object} 추가된 제안 객체
 */
export const addNewSuggestion = async (suggestion) => {
  // 데모 모드일 때는 더미 응답 반환
  if (isDemo) {
    return {
      id: Date.now(),
      title: suggestion.title,
      description: suggestion.description,
      rider_id: suggestion.proposer_name,
      status: 'pending',
      priority: suggestion.priority || 'medium',
      created_at: new Date().toISOString()
    };
  }
  
  try {
    const { data, error } = await supabase
      .from('suggestions')
      .insert([{
        title: suggestion.title,
        description: suggestion.description,
        rider_id: suggestion.proposer_name,
        status: 'pending',
        priority: suggestion.priority || 'medium',
        created_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('새로운 제안 추가 실패:', error);
    throw error;
  }
};