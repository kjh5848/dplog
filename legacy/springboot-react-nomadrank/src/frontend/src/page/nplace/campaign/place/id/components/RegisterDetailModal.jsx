import PropTypes from "prop-types";
import { Modal, Button } from "react-bootstrap";

const RegisterDetailModal = ({ isOpen, onClose, register, priceData }) => {
  
  const totalPrice = register.goal * priceData.place.price * 1.1;

  return (
    <Modal show={isOpen} onHide={onClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>상세 정보</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p><strong>검색어:</strong> {register.search}</p>
        <p><strong>시작일자:</strong> {register.startDate}</p>
        <p><strong>종료일자:</strong> {register.endDate}</p>
        <p><strong>총 작업기간:</strong> {register.workingPeriod}</p>
        <p><strong>유입 목표:</strong> {register.goal.toLocaleString()}명</p>
        <p><strong>총 금액:</strong> {totalPrice.toLocaleString()}원</p>
        <p><strong>입금 계좌:</strong> {priceData.place.bankName} {priceData.place.accountNumber} {priceData.place.deposit}</p>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>
          닫기
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

RegisterDetailModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  register: PropTypes.shape({
    search: PropTypes.string.isRequired,
    startDate: PropTypes.string.isRequired,
    endDate: PropTypes.string.isRequired,
    goal: PropTypes.number.isRequired,
    workingPeriod: PropTypes.number.isRequired,
    createDate: PropTypes.string.isRequired
  }).isRequired,
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
  })
};

export default RegisterDetailModal;
