import { Button, Col, FloatingLabel, Form, Modal, Table } from "react-bootstrap";
import LayoutDefault from "/src/component/layout/default/Index.jsx";
import PointApplyStyle from "./Style";
import { useEffect, useRef, useState } from "react";
import usePendingFunction from "../../../use/usePendingFunction";
import { useAuthStore } from "/src/store/StoreProvider.jsx";

export default function PointApplyPage() {

  const style = PointApplyStyle();
  const { loginUser } = useAuthStore();

  const pointApplyModalPointApplyInputRef = useRef();
  const [pointApply, setPointApply] = useState([]);
  const [isPointApplyModalShow, setIsPointApplyModalShow] = useState(false);
  const handlePointApplyModalClose = () => {
    pointApplyModalPointApplyInputRef.current.value = "";
    setIsPointApplyModalShow(false);
  };

  const handlePointApplyModalShow = () => {
    setIsPointApplyModalShow(true);
  };

  const [postPointApplyTrigger] = usePendingFunction(async () => {
    if (pointApplyModalPointApplyInputRef.current.value === "") {
      alert("신청 포인트를 입력해주세요.");
      pointApplyModalPointApplyInputRef.current.focus();
      return;
    }

    const dto = await fetch(`/v1/point/apply`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        point: {
          point: pointApplyModalPointApplyInputRef.current.value,
        }
      })
    }).then((response) => response.json());
    if (dto.code !== 0) {
      alert(dto.message);
      return;
    }
    alert("포인트가 신청되었습니다.");
    handlePointApplyModalClose();
    getPointApplyTrigger();
  });

  const patchPointApply = async (id, status) => {
    const statusName = status === 'CONFIRM' ? '승인' : '거절';

    if (confirm(`${statusName}하시겠습니까?`)) {
      const dto = await fetch(`/v1/point/apply`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          point: {
            id: id,
            pointChargeStatus : status
          }
        })
      }).then((response) => response.json());
      if (dto.code !== 0) {
        alert(dto.message);
        return;
      }
      alert(`신청된 포인트를 ${statusName}하였습니다.`);
      getPointApplyTrigger();
    }
  };

  const [getPointApplyTrigger] = usePendingFunction(async () => {
    const dto = await fetch(`/v1/point/apply`, {
      method: "GET"
    }).then((response) => response.json());
    if (dto.code !== 0) {
      alert(dto.message);
      return;
    }
  
    const pointApplyData = dto.data.pointApplyList;

    setPointApply(pointApplyData);
  });

  useEffect(() => {
    getPointApplyTrigger();
  }, []);

  return ( 
    <LayoutDefault>
      <Button variant="primary" onClick={handlePointApplyModalShow}>포인트 신청</Button>
      <hr style={style.searchResultDivider} />
      <Table striped>
      <thead>
          <tr>
            <th>사용자명</th>
            <th>신청일자</th>
            <th>처리일자</th>
            <th>신청포인트</th>
            <th>상태</th>
          </tr>
        </thead>
        <tbody>
          {pointApply.map((item, index) => (
            <tr key={index}>
              <th>{item.name}</th>
              <th>{item.createDate.split(".")[0].replace("T", " ")}</th>
              <th>{item.updateDate.split(".")[0].replace("T", " ")}</th>
              <th>{item.amount}</th>
              <th>{loginUser.user.authority.includes('DISTRIBUTOR_MANAGER') && item.status === 'WAIT' ? (
                <Col className="text-center">
                  <Button className="me-3" onClick={() => patchPointApply(item.id, 'CONFIRM')}>승인</Button>
                  <Button variant="outline-secondary" onClick={() => patchPointApply(item.id, 'REJECT')}>거절</Button>
                </Col>
                ) : item.statusName}</th>
            </tr>  
          ))}
        </tbody>
      </Table>

      <Modal show={isPointApplyModalShow} scrollable size={"lg"} backdrop="static" onHide={handlePointApplyModalClose}>
        <Modal.Header closeButton>
          <Modal.Title>포인트 신청</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <FloatingLabel
            controlId="floatingTrackbaleModalPointApplyInput"
            label="신청 포인트"
          >
            <Form.Control
              ref={pointApplyModalPointApplyInputRef}
              type="number"
              placeholder="신청 포인트"
              autoFocus
            />
          </FloatingLabel>
          <Col className="mt-3 text-center">
            <Button className="me-3" onClick={postPointApplyTrigger}>신청</Button>
            <Button variant="outline-secondary" onClick={handlePointApplyModalClose}>취소</Button>
          </Col>
        </Modal.Body>
      </Modal>
    </LayoutDefault>
  );
}