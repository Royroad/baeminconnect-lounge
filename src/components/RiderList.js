import React, { useState, useEffect } from 'react';
import { fetchTableData } from '../services/supabase';
import RiderCard from './RiderCard';

/**
 * 라이더 목록을 표시하는 컴포넌트
 * @param {Object} props
 * @param {string} props.tableName - 조회할 테이블명
 */
const RiderList = ({ tableName = 'posts' }) => {
  const [riders, setRiders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadRiders = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const { data, error: fetchError } = await fetchTableData(tableName, {
          orderBy: { column: 'created_at', ascending: false },
          limit: 50
        });
        
        if (fetchError) {
          setError(fetchError.message);
          return;
        }
        

        
        setRiders(data || []);
      } catch (err) {
        setError('데이터를 불러오는 중 오류가 발생했습니다.');
        console.error('Error loading riders:', err);
      } finally {
        setLoading(false);
      }
    };

    loadRiders();
  }, [tableName]);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner">로딩 중...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="error-message">
          오류: {error}
        </div>
      </div>
    );
  }

  if (riders.length === 0) {
    return (
      <div className="empty-container">
        <div className="empty-message">
          표시할 데이터가 없습니다.
        </div>
      </div>
    );
  }

  return (
    <div className="rider-list-container">
      <h2 className="rider-list-title">라이더 게시글</h2>
      <div className="rider-list">
        {riders.map((rider, index) => (
          <RiderCard
            key={rider.id || index}
            riderId={rider.rider_id}
            proposerName={rider.proposer_name}
            content={rider.content || rider.title || rider.description || rider.message}
            date={rider.created_at}
            className="rider-list-item"
          />
        ))}
      </div>
      

    </div>
  );
};

export default RiderList;