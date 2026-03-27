import { useAuthStore } from "/src/store/StoreProvider.jsx";
import { useNavigate } from "react-router-dom";
import LayoutDefault from "/src/component/layout/default/Index.jsx";
import { Button, Card, Col, Form, Row } from "react-bootstrap";
import usePendingFunction from "../../../use/usePendingFunction";
import { useEffect, useRef, useState } from "react";
import '@toast-ui/editor/dist/toastui-editor.css';
import { Editor } from '@toast-ui/react-editor';
import NoticeAddStyle from "./Style";

export default function NoticeAddPage() {

  const navigate = useNavigate();
  const style = NoticeAddStyle();
  const authStore = useAuthStore();

  const [categoryList, setCategoryList] = useState([]);
  const categoryInputRef = useRef();
  const subjectInputRef = useRef();
  const contentInputRef = useRef();

  useEffect(() => {
    // 카테고리 목록 가져오기
    fetch('/v1/notice/category')
      .then(response => response.json())
      .then(dto => {
        if (dto.code === 0) {
          setCategoryList(dto.data.categoryList || []);
        } else {
          alert(dto.message);
        }
      })
      .catch(error => console.error('카테고리 로딩 실패:', error));
  }, []);


  const [postNoticeTrigger] = usePendingFunction(async () => {
    if (!categoryInputRef.current.value) {
      alert("카테고리를 선택해주세요.");
      categoryInputRef.current.focus();
      return;
    }

    if (subjectInputRef.current.value === "") {
      alert("제목을 입력해주세요.");
      subjectInputRef.current.focus();
      return;
    }

    if (contentInputRef.current.getInstance().getMarkdown() === "") {
      alert("내용을 입력해주세요.");
      contentInputRef.current.getInstance().focus();
      return;
    }

    const dto = await fetch(`/v1/notice`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        notice: {
          category: categoryInputRef.current.value,
          subject: subjectInputRef.current.value,
          content: contentInputRef.current.getInstance().getMarkdown() 
        }
      })
    }).then((response) => response.json());
    if (dto.code !== 0) {
      alert(dto.message);
    } else {
      alert("등록되었습니다.");
      navigate(`/notice`);
    }
    
  });

  if (authStore.loginUser.user.authority.includes("USER")) {
    alert("해당 권한이 없습니다.");
    navigate(`/notice`);
    return;
  }

  return (
    <LayoutDefault>
      <Card style={style.card}>
        <Form>
          <Card.Body>
            <Row>
              <Col>
              <Form.Group className="mb-3" controlId="category" style={style.formGroup}>
                <Form.Label style={style.formLabel}>카테고리</Form.Label>
                <Col>
                  <Form.Select ref={categoryInputRef}>
                    <option value="">카테고리를 선택해주세요</option>
                    {categoryList.map((category, index) => (
                      <option key={index} value={category.categoryName}>
                        {category.categoryValue}
                      </option>
                    ))}
                  </Form.Select>
                </Col>
              </Form.Group>
              <Form.Group className="mb-3" controlId="subject" style={style.formGroup}>
                <Form.Label style={style.formLabel}>제목</Form.Label>
                <Col>
                  <Form.Control placeholder="제목을 입력해주세요." name="subject" ref={subjectInputRef}/>
                </Col>
              </Form.Group>
              <Form.Group style={style.formGroup} controlId="content" >
                  <Form.Label style={style.formLabel}>본문</Form.Label>
                  <Editor
                    previewStyle="vertical"
                    height="400px"
                    initialEditType="wysiwyg"
                    initialValue=""
                    ref={contentInputRef}
                  />
                </Form.Group>
              </Col>
            </Row>
          </Card.Body>
          <Card.Footer style={style.cardFooter}>
            <Row>
              <Col>
                <Form.Group style={style.formGroup}>
                  <Button variant="outline-primary" className="me-3" onClick={postNoticeTrigger} style={{ width: "100%" }}>등록</Button>
                </Form.Group>
              </Col>
              <Col>
                <Form.Group style={style.formGroup}>
                  <Button variant="outline-secondary" onClick={() => navigate(`/notice`)} style={{ width: "100%" }}>취소</Button>
                </Form.Group>
              </Col>
            </Row>
          </Card.Footer>
      </Form>
      </Card>
      
    </LayoutDefault>
  );
}