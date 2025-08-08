import { supabase } from '../config/supabase';

/**
 * 테이블에서 데이터를 가져오는 함수
 * @param {string} tableName - 테이블명
 * @param {Object} options - 추가 옵션
 * @returns {Promise} Supabase 응답
 */
export const fetchTableData = async (tableName, options = {}) => {
  if (!supabase) {
    console.error('❌ Supabase 클라이언트가 초기화되지 않았습니다');
    return { data: null, error: new Error('Supabase not initialized') };
  }
  
  try {
    let query = supabase.from(tableName).select('*');
    
    // 정렬 옵션이 있는 경우
    if (options.orderBy) {
      query = query.order(options.orderBy.column, { 
        ascending: options.orderBy.ascending ?? true 
      });
    }
    
    // 제한 옵션이 있는 경우
    if (options.limit) {
      query = query.limit(options.limit);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('❌ Supabase 쿼리 에러:', error);
      return { data: null, error };
    }
    
    return { data, error: null };
  } catch (err) {
    console.error('❌ 예상치 못한 에러:', err);
    return { data: null, error: err };
  }
};

/**
 * 특정 rider_id로 데이터 조회
 * @param {string} tableName - 테이블명
 * @param {string} riderId - 라이더 ID
 * @returns {Promise} Supabase 응답
 */
export const fetchDataByRiderId = async (tableName, riderId) => {
  try {
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .eq('rider_id', riderId);
    
    if (error) {
      console.error('Error fetching data by rider ID:', error);
      return { data: null, error };
    }
    
    return { data, error: null };
  } catch (err) {
    console.error('Unexpected error:', err);
    return { data: null, error: err };
  }
};

/**
 * 새 데이터 추가
 * @param {string} tableName - 테이블명
 * @param {Object} newData - 추가할 데이터
 * @returns {Promise} Supabase 응답
 */
export const insertData = async (tableName, newData) => {
  try {
    const { data, error } = await supabase
      .from(tableName)
      .insert([newData])
      .select();
    
    if (error) {
      console.error('Error inserting data:', error);
      return { data: null, error };
    }
    
    return { data, error: null };
  } catch (err) {
    console.error('Unexpected error:', err);
    return { data: null, error: err };
  }
};

/**
 * 데이터 업데이트
 * @param {string} tableName - 테이블명
 * @param {number} id - 업데이트할 레코드 ID
 * @param {Object} updateData - 업데이트할 데이터
 * @returns {Promise} Supabase 응답
 */
export const updateData = async (tableName, id, updateData) => {
  try {
    const { data, error } = await supabase
      .from(tableName)
      .update(updateData)
      .eq('id', id)
      .select();
    
    if (error) {
      console.error('Error updating data:', error);
      return { data: null, error };
    }
    
    return { data, error: null };
  } catch (err) {
    console.error('Unexpected error:', err);
    return { data: null, error: err };
  }
};

/**
 * 데이터 삭제
 * @param {string} tableName - 테이블명
 * @param {number} id - 삭제할 레코드 ID
 * @returns {Promise} Supabase 응답
 */
export const deleteData = async (tableName, id) => {
  try {
    const { data, error } = await supabase
      .from(tableName)
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting data:', error);
      return { data: null, error };
    }
    
    return { data, error: null };
  } catch (err) {
    console.error('Unexpected error:', err);
    return { data: null, error: err };
  }
};