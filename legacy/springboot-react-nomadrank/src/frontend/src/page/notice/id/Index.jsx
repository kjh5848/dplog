import { useAuthStore } from "/src/store/StoreProvider.jsx";
import LayoutDefault from "/src/component/layout/default/Index.jsx";
import { useNavigate, useParams } from "react-router-dom";
import usePendingFunction from "../../../use/usePendingFunction";
import { useEffect, useState } from "react";
import { Button, Card, Col, Form, Row } from "react-bootstrap";
import NoticeIdStyle from "./Style";
import { Viewer } from "@toast-ui/react-editor";

export default function NoticeWithIdPage() {

  const { id } = useParams();
  const navigate = useNavigate();
  const style = NoticeIdStyle();
  const authStore = useAuthStore();

  const [noticeWithIdResult, setNoticeWithIdResult] = useState();

  const [getShopWithIdTrigger] = usePendingFunction(async () => {

    const dto = await fetch(`/v1/notice/${id}`, {
      method: "GET"
    }).then((response) => response.json());
    if (dto.code !== 0) {
      alert(dto.message);
      navigate(`/notice`, { replace: true });
      return;
    }
    setNoticeWithIdResult(dto.data);
  });

  useEffect(() => {
    getShopWithIdTrigger();
  }, []);

  const [deleteNoticeTrigger] = usePendingFunction(async () => {
    if (confirm('해당 공지를 삭제하시겠습니까?')) {
      const dto = await fetch(`/v1/notice/${id}`, {
        method: "DELETE"
      }).then((response) => response.json());
      if (dto.code !== 0) {
        alert(dto.message);
      } else {
        alert("삭제되었습니다.");
        navigate(`/notice`);
      }
    }
  });

  return (
    <LayoutDefault>
      {
        noticeWithIdResult ? <>
        <Card style={style.card}>
          <Form>
            <Card.Body>
              <Row>
                <Col>
                <Form.Group className="mb-3" controlId="category" style={style.formGroup}>
                  <Form.Label style={style.formLabel}>카테고리</Form.Label>
                  <Col>
                    <Form.Control name="category" value={noticeWithIdResult.notice.categoryValue} readOnly/>
                  </Col>
                </Form.Group>
                <Form.Group className="mb-3" controlId="subject" style={style.formGroup}>
                  <Form.Label style={style.formLabel}>제목</Form.Label>
                  <Col>
                    <Form.Control name="subject" value={noticeWithIdResult.notice.subject} readOnly/>
                  </Col>
                </Form.Group>
                <Form.Group style={style.formGroup} controlId="content" >
                    <Form.Label style={style.formLabel}>본문</Form.Label>
                    <Viewer
                      initialValue={noticeWithIdResult.notice.content}
                    />
                  </Form.Group>
                </Col>
              </Row>
            </Card.Body>
            <Card.Footer style={style.cardFooter}>
              <Row>
                {
                  (authStore.loginUser && (authStore.loginUser.user.authority.includes("ADMIN") || authStore.loginUser.user.authority.includes("DISTRIBUTOR_MANAGER"))) && (
                    <>
                      <Col>
                        <Form.Group style={style.formGroup}>
                          <Button variant="outline-danger" className="me-3" onClick={deleteNoticeTrigger} style={{ width: "100%" }}>삭제</Button>
                        </Form.Group>
                      </Col>
                      <Col>
                        <Form.Group style={style.formGroup}>
                        <Button variant="outline-primary" onClick={() => navigate(`/notice/edit/${id}`)} style={{ width: "100%" }}>수정</Button>
                        </Form.Group>
                      </Col>
                    </>    
                  )}
                <Col>
                  <Form.Group style={style.formGroup}>
                  <Button variant="outline-secondary" onClick={() => navigate(`/notice`)} style={{ width: "100%" }}>목록</Button>
                  </Form.Group>
                </Col>
              </Row>
            </Card.Footer>
        </Form>
      </Card>
        </>
        : <div></div>
      }
    </LayoutDefault>
  );
}