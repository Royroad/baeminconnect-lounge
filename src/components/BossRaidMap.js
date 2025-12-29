/**
 * 보스 레이드 지도 컴포넌트
 * Leaflet을 사용한 서울시 구별 보스 표시
 */

import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useNavigate } from 'react-router-dom';
import { calculateHpPercentage } from '../services/raidService';
import './BossRaidMap.css';

// Leaflet 아이콘 설정 (기본 아이콘 문제 해결)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

// 서울시 구별 좌표
const districtCoordinates = {
  '강남구': [37.5172, 127.0473],
  '강동구': [37.5301, 127.1238],
  '강북구': [37.6398, 127.0256],
  '강서구': [37.5509, 126.8495],
  '관악구': [37.4784, 126.9516],
  '광진구': [37.5384, 127.0822],
  '구로구': [37.4954, 126.8874],
  '금천구': [37.4519, 126.8955],
  '노원구': [37.6541, 127.0568],
  '도봉구': [37.6688, 127.0471],
  '동대문구': [37.5744, 127.0397],
  '동작구': [37.5124, 126.9393],
  '마포구': [37.5663, 126.9019],
  '서대문구': [37.5791, 126.9368],
  '서초구': [37.4837, 127.0324],
  '성동구': [37.5634, 127.0371],
  '성북구': [37.5894, 127.0167],
  '송파구': [37.5145, 127.1059],
  '양천구': [37.5170, 126.8664],
  '영등포구': [37.5264, 126.8962],
  '용산구': [37.5326, 126.9905],
  '은평구': [37.6027, 126.9291],
  '종로구': [37.5730, 126.9794],
  '중구': [37.5641, 126.9979],
  '중랑구': [37.6063, 127.0925]
};

const BossRaidMap = ({ raids }) => {
  const navigate = useNavigate();
  
  // 보스 타입별 이모지
  const getBossEmoji = (type) => {
    const emojis = {
      'fire': '🔥',
      'water': '💧',
      'earth': '🌍',
      'wind': '💨'
    };
    return emojis[type] || '⚔️';
  };
  
  // 커스텀 아이콘 생성
  const createBossIcon = (raid) => {
    const emoji = getBossEmoji(raid.boss_type);
    const hpPercentage = calculateHpPercentage(raid.current_hp, raid.max_hp);
    
    // HP 퍼센트에 따른 크기 조정
    const size = raid.status === 'active' ? 40 : 30;
    const opacity = raid.status === 'active' ? 1 : 0.6;
    
    return L.divIcon({
      html: `
        <div style="
          font-size: ${size}px;
          opacity: ${opacity};
          filter: drop-shadow(0 2px 8px rgba(0, 0, 0, 0.8));
          animation: ${raid.status === 'active' ? 'bounce 2s ease-in-out infinite' : 'none'};
        ">
          ${emoji}
        </div>
      `,
      className: 'boss-marker-icon',
      iconSize: [size, size],
      iconAnchor: [size / 2, size / 2],
    });
  };
  
  // 마커 클릭 핸들러
  const handleMarkerClick = (raidId) => {
    navigate(`/boss-raid/${raidId}`);
  };
  
  // 서울 중심 좌표
  const seoulCenter = [37.5665, 126.9780];
  
  return (
    <div className="boss-raid-map-container">
      <MapContainer 
        center={seoulCenter} 
        zoom={11} 
        scrollWheelZoom={true}
        className="boss-raid-map"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {raids.map((raid) => {
          const coordinates = districtCoordinates[raid.district];
          
          if (!coordinates) {
            console.warn(`좌표를 찾을 수 없습니다: ${raid.district}`);
            return null;
          }
          
          const hpPercentage = calculateHpPercentage(raid.current_hp, raid.max_hp);
          
          return (
            <Marker
              key={raid.id}
              position={coordinates}
              icon={createBossIcon(raid)}
              eventHandlers={{
                click: () => handleMarkerClick(raid.id),
              }}
            >
              <Popup className="boss-popup">
                <div className="popup-content">
                  <h4>{raid.boss_name}</h4>
                  <p className="popup-district">{raid.district}</p>
                  <div className="popup-hp">
                    <div className="popup-hp-bar">
                      <div 
                        className="popup-hp-fill"
                        style={{ width: `${hpPercentage}%` }}
                      ></div>
                    </div>
                    <span className="popup-hp-text">
                      HP: {raid.current_hp.toLocaleString()} / {raid.max_hp.toLocaleString()}
                    </span>
                  </div>
                  <button 
                    className="popup-button"
                    onClick={() => handleMarkerClick(raid.id)}
                  >
                    상세보기
                  </button>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
      
      <div className="map-legend">
        <h5>🗺️ 지도 범례</h5>
        <div className="legend-items">
          <div className="legend-item">
            <span className="legend-icon">🔥</span>
            <span>화속성 보스</span>
          </div>
          <div className="legend-item">
            <span className="legend-icon active">●</span>
            <span>진행중</span>
          </div>
          <div className="legend-item">
            <span className="legend-icon inactive">●</span>
            <span>완료/종료</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BossRaidMap;

