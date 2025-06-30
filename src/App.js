import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import 'bootstrap/dist/js/bootstrap.bundle.min';
import { useState } from 'react';
import { Modal, Button } from 'react-bootstrap';
import Gallery from './components/Gallery';
import logo from './images/logo_basic.png';
import { FaWifi, FaBatteryFull, FaCoffee, FaMapMarkedAlt } from 'react-icons/fa';

function App() {
  const [show, setShow] = useState(false);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const handleDownloadClick = () => {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const appStoreUrl = "https://baeminconnect.onelink.me/k618/5engev5b";

    if (isMobile) {
      window.location.href = appStoreUrl;
    } else {
      handleShow();
    }
  };

  return (
    <div className="App">
      <header className="bg-mint text-center py-5">
        <div className="d-flex flex-column align-items-center justify-content-center mb-3 logo-container">
          <img src={logo} alt="배민커넥트 라운지 로고" className="header-logo" />
          <span className="lounge-text">라운지</span>
        </div>
        <p className="header-slogan">라이더님을 위한 편안한 휴식 공간</p>
      </header>

      <Modal show={show} onHide={handleClose} centered>
        <Modal.Header closeButton>
          <Modal.Title>배민커넥트 앱 다운로드</Modal.Title>
        </Modal.Header>
        <Modal.Body className="text-center">
          <p>아래 QR 코드를 스캔하여 앱을 다운로드하세요.</p>
          <img
            src="%PUBLIC_URL%/baemin-qr.png"
            alt="배민커넥트 앱 다운로드 QR Code"
            className="img-fluid"
          />
          <p className="mt-3">또는 <a href="https://baeminconnect.onelink.me/k618/5engev5b" target="_blank" rel="noopener noreferrer">여기</a>를 클릭하세요.</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            닫기
          </Button>
        </Modal.Footer>
      </Modal>

      <main className="container my-5">
        <section id="about" className="py-5 mb-5">
          <h2 className="text-center mb-4 section-title">라운지 소개</h2>
          <p>
            배민커넥트 라운지는 라이더님들이 언제든지 편하게 쉬어가실 수 있도록 마련된 공간입니다.
            아늑한 휴식 공간에서 재충전의 시간을 갖고, 동료 라이더님들과 교류하며 정보를 나눠보세요.
          </p>
        </section>

        <section id="facilities" className="py-5 mb-5">
          <h2 className="text-center mb-4 section-title">편의 시설</h2>
          <div className="row text-center">
            <div className="col-md-4 facility-item">
              <FaWifi size={40} className="facility-icon" />
              <p className="facility-text">Wi-Fi</p>
            </div>
            <div className="col-md-4 facility-item">
              <FaBatteryFull size={40} className="facility-icon" />
              <p className="facility-text">휴대폰 충전</p>
            </div>
            <div className="col-md-4 facility-item">
              <FaCoffee size={40} className="facility-icon" />
              <p className="facility-text">음료/간식</p>
            </div>
          </div>
        </section>

        <section id="location" className="py-5 mb-5">
          <h2 className="text-center mb-4 section-title">위치 및 운영시간</h2>
          <p><strong>주소:</strong> 서울 송파구 백제고분로 364 대신빌딩 3층 (배민아카데미)</p>
          <p><strong>운영시간:</strong> 매일 10:00 ~ 17:00</p>

          <div className="text-center mt-4">
            <a href="https://naver.me/xucXyVyE" target="_blank" rel="noopener noreferrer" className="map-link-btn">
              <FaMapMarkedAlt className="me-2" />
              네이버 지도 보기
            </a>
          </div>
        </section>

        <div className="text-center my-5">
          <Button className="baemin-download-btn" onClick={handleDownloadClick}>배민커넥트 앱 다운로드</Button>
        </div>

        <div className="section-divider"></div>

        <section id="gallery" className="py-5 mb-5">
          <Gallery />
        </section>

        <section id="faq" className="py-5">
          <h2 className="text-center mb-4 section-title">자주 묻는 질문 (FAQ)</h2>
          <div className="accordion" id="faqAccordion">
            <div className="accordion-item">
              <h2 className="accordion-header" id="headingOne">
                <button className="accordion-button collapsed fw-bold" type="button" data-bs-toggle="collapse" data-bs-target="#collapseOne" aria-expanded="false" aria-controls="collapseOne">
                  라운지 이용은 무료인가요?
                </button>
              </h2>
              <div id="collapseOne" className="accordion-collapse collapse" aria-labelledby="headingOne" data-bs-parent="#faqAccordion">
                <div className="accordion-body">
                  네, 배민커넥트 라이더님이라면 누구나 무료로 이용 가능합니다.
                </div>
              </div>
            </div>
            <div className="accordion-item">
              <h2 className="accordion-header" id="headingTwo">
                <button className="accordion-button collapsed fw-bold" type="button" data-bs-toggle="collapse" data-bs-target="#collapseTwo" aria-expanded="false" aria-controls="collapseTwo">
                  주차도 가능한가요?
                </button>
              </h2>
              <div id="collapseTwo" className="accordion-collapse collapse" aria-labelledby="headingTwo" data-bs-parent="#faqAccordion">
                <div className="accordion-body">
                  별도의 주차 공간은 마련되어 있지 않습니다.
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-dark text-white text-center py-3">
        <p>서울 송파구 백제고분로 364 대신빌딩 3층 (배민아카데미)</p>
        <p>문의: 카카오톡 채널(@배민커넥트)</p>
      </footer>
    </div>
  );
}

export default App;