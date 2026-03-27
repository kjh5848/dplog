import LayoutDefault from "/src/component/layout/default/Index.jsx";
import { Button, Col, Form, Modal, Row } from "react-bootstrap";

export default function TestPage() {

  const isOpen = true;
  const onClose = () => {};
  const price = 50000;

  return (
    <LayoutDefault>
    <Modal 
      show={isOpen} 
      onHide={onClose}
      scrollable 
      size="lg" 
      backdrop="static"
    >
      <Modal.Header closeButton>
        <Modal.Title>
          리워드 트래픽 신청
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {/* 입력 폼 */}
        <Row className="align-items-center">
            {/* 시작일 */}
            <Col xs={4}>
              <label>시작일</label>
            </Col>
            <Col xs={8}>
              <Form.Control placeholder="2024-01-01" />
            </Col>
          </Row>

          <Row className="align-items-center mt-3">
            {/* 종료일 */}
            <Col xs={4}>
              <label>종료일</label>
            </Col>
            <Col xs={8}>
              <Form.Control placeholder="2024-01-01" />
            </Col>
          </Row>

          <Row className="align-items-center mt-3">
            {/* 검색어 */}
            <Col xs={4}>
              <label>검색어</label>
            </Col>
            <Col xs={8}>
              <Form.Control type="text" placeholder="검색어 입력" />
            </Col>
          </Row>

          <Row className="align-items-center mt-3">
            {/* 플레이스 URL (readonly) */}
            <Col xs={4}>
              <label>플레이스 URL</label>
            </Col>
            <Col xs={8}>
              <Form.Control type="text" />
            </Col>
          </Row>

          <Row className="align-items-center mt-3">
            {/* 업체명 (readonly) */}
            <Col xs={4}>
              <label>업체명</label>
            </Col>
            <Col xs={8}>
              <Form.Control type="text" />
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
                placeholder="200개 단위로 입력하세요" />
            </Col>
          </Row>
        <hr></hr>
        <Row className="align-items-center mt-3">
            <Col xs={4}>
              <label>총 금액</label>
            </Col>
            <Col xs={8}>
              <div className="text-end me-3">
                <span className="fw-bold fs-5">{price.toLocaleString()}</span>
                <span>원</span>
              </div>
            </Col>
          </Row>
        <Button
          variant="outline-primary"
          className="w-100 mt-4"
        >
          신청
        </Button>
      </Modal.Body>
    </Modal>
    </LayoutDefault>
  );
}