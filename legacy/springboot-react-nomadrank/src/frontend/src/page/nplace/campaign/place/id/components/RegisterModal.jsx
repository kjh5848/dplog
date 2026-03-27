import { Modal, Button, Row, Col, Form } from 'react-bootstrap';
import { useRegisterModal } from '../hooks/useRegisterModal';
import PropTypes from 'prop-types';
import NotificationAlert from '../../components/NotificationAlert';
import { useNotification } from '../../hooks/useNotification';
import { useEffect, useState } from 'react';

const RegisterModal = ({
  isOpen,
  type,
  placeData,
  priceData,
  selectedKeywordIndex,
  onClose,
  onSubmit
}) => {
  const {
    refs,
    isPending,
    // validateForm,
    handleSubmit
  } = useRegisterModal({ placeData, selectedKeywordIndex, onClose, onSubmit });
  const {notification, fetchNotification} = useNotification();

  useEffect(() => {
    fetchNotification();
  }, []);

  const [totalPrice, setTotalPrice] = useState(0);

  const calculateTotalPrice = () => {
    if (!priceData || !refs.goal.current) {
      setTotalPrice(0);
      return;
    }

    const price = refs.goal.current.value * priceData.place.price * 1.1;
    setTotalPrice(price);
  };

  return (
    <Modal 
      show={isOpen} 
      onHide={onClose}
      scrollable 
      size="lg" 
      backdrop="static"
    >
      <Modal.Header closeButton>
        <Modal.Title>
          {type === 'traffic' ? '리워드 트래픽 신청' : '리워드 저장하기 신청'}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <NotificationAlert notification={notification} />
        {/* 입력 폼 */}
        <Row className="align-items-center">
            {/* 시작일 */}
            <Col xs={4}>
              <label>시작일</label>
            </Col>
            <Col xs={8}>
              <Form.Control type="date" placeholder="2024-01-01" ref={refs.startDate} />
            </Col>
          </Row>

          <Row className="align-items-center mt-3">
            {/* 종료일 */}
            <Col xs={4}>
              <label>종료일</label>
            </Col>
            <Col xs={8}>
              <Form.Control type="date" placeholder="2024-01-01" ref={refs.endDate}/>
            </Col>
          </Row>

          <Row className="align-items-center mt-3">
            {/* 검색어 */}
            <Col xs={4}>
              <label>검색어</label>
            </Col>
            <Col xs={8}>
              <Form.Control type="text" placeholder="검색어 입력" ref={refs.search} />
            </Col>
          </Row>

          <Row className="align-items-center mt-3">
            {/* 플레이스 URL (readonly) */}
            <Col xs={4}>
              <label>플레이스 URL</label>
            </Col>
            <Col xs={8}>
              <Form.Control type="text" value={placeData ? `https://m.place.naver.com/place/${placeData.nplaceRewardShop.shopId}` : ""} ref={refs.url} readOnly />
            </Col>
          </Row>

          <Row className="align-items-center mt-3">
            {/* 업체명 (readonly) */}
            <Col xs={4}>
              <label>업체명</label>
            </Col>
            <Col xs={8}>
              <Form.Control type="text" value={placeData ? placeData.nplaceRewardShop.shopName : ""} ref={refs.shopName} readOnly />
            </Col>
          </Row>

          <Row className="align-items-center mt-3">
            {/* 일유입목표 */}
            <Col xs={4}>
              <label>일유입목표</label>
            </Col>
            <Col xs={8}>
              <Form.Control 
                type="number" 
                placeholder="200개 단위로 입력하세요" 
                min="200"
                step="200"
                ref={refs.goal}
                onKeyDown={(e) => {
                  // 숫자, 백스페이스, 삭제, 화살표 키만 허용
                  if (!(['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab'].includes(e.key) ||
                      /[0-9]/.test(e.key))) {
                    e.preventDefault();
                  }
                }}
                onBlur={(e) => {
                  const value = e.target.value;
                  if (value) {
                    const numValue = parseInt(value);
                    if (numValue < 200) {
                      e.target.value = "200";
                    } else if (numValue % 200 !== 0) {
                      e.target.value = Math.floor(numValue / 200) * 200;
                    }
                  }
                }}
                onChange={calculateTotalPrice}
              />
            </Col>
          </Row>
          <hr></hr>
          <Row className="align-items-center mt-3">
            <Col xs={4}>
              <label>총 금액</label>
            </Col>
            <Col xs={8}>
              <div className="text-end me-3">
                <span className="fw-bold fs-5">{totalPrice.toLocaleString()}</span>
                <span>원</span>
              </div>
            </Col>
          </Row>
          <Row className="align-items-center mt-3">
            <Col xs={4}>
              <label>입금 계좌</label>
            </Col>
            <Col xs={8}>
              <div className="text-end me-3">
                {
                  priceData ? `${priceData.place.bankName} ${priceData.place.accountNumber} ${priceData.place.deposit}` : "등록된 계좌정보가 없습니다."
                }
              </div>
            </Col>
          </Row>
        
        <Button
          variant="outline-primary"
          className="w-100 mt-4"
          onClick={handleSubmit}
          disabled={isPending}
        >
          신청
        </Button>
      </Modal.Body>
    </Modal>
  );
};

RegisterModal.propTypes = {
  // 모달 표시 여부
  isOpen: PropTypes.bool.isRequired,
  
  // 모달 타입 ('traffic' 또는 'save')
  type: PropTypes.oneOf(['traffic', 'save']),
  
  // 플레이스 데이터
  placeData: PropTypes.shape({
    nplaceRewardShop: PropTypes.shape({
      id: PropTypes.number.isRequired,
      shopId: PropTypes.string.isRequired,
      shopName: PropTypes.string.isRequired,
      shopImageUrl: PropTypes.string.isRequired,
      address: PropTypes.string,
      roadAddress: PropTypes.string,
      nplaceRewardShopKeywordList: PropTypes.arrayOf(
        PropTypes.shape({
          id: PropTypes.number.isRequired,
          keyword: PropTypes.string.isRequired,
          nplaceCampaignKeywordTrafficList: PropTypes.arrayOf(
            PropTypes.shape({
              id: PropTypes.number.isRequired,
              keywordTraffic: PropTypes.number.isRequired,
              createDate: PropTypes.string.isRequired,
              nplaceCampaignRegister: PropTypes.shape({
                id: PropTypes.number.isRequired,
                startDate: PropTypes.string.isRequired,
                endDate: PropTypes.string.isRequired,
                search: PropTypes.string.isRequired,
                url: PropTypes.string.isRequired,
                shopName: PropTypes.string.isRequired,
                goal: PropTypes.number.isRequired,
                workingPeriod: PropTypes.number.isRequired
              }).isRequired
            })
          )
        })
      ).isRequired
    }).isRequired
  }),

  priceData: PropTypes.shape({
    place: PropTypes.shape({
      accountNumber: PropTypes.string.isRequired,
      bankName: PropTypes.string.isRequired,
      deposit: PropTypes.string.isRequired,
      id: PropTypes.number.isRequired,
      nplaceRewardProduct: PropTypes.string.isRequired,
      accountnplaceRewardProductValueNumber: PropTypes.string.isRequired,
      price: PropTypes.number.isRequired
    })
  }),

  // 선택된 키워드 인덱스
  selectedKeywordIndex: PropTypes.number,

  // 모달 닫기 핸들러
  onClose: PropTypes.func.isRequired,

  // 등록 제출 핸들러
  onSubmit: PropTypes.func.isRequired
};

export default RegisterModal;