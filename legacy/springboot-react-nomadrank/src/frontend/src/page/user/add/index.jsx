import { useNavigate } from "react-router-dom";
import LayoutDefault from "/src/component/layout/default/Index.jsx";
import { Button, Col, Form, Row } from "react-bootstrap";
import usePendingFunction from "../../../use/usePendingFunction";
import { useRef } from "react";

export default function UserAddPage() {

  const navigate = useNavigate();

  const companyNameInputRef = useRef();
  const companyNumberInputRef = useRef();
  const userNameInputRef = useRef();
  const passwordInputRef = useRef();
  const telInputRef = useRef();

  const [postUserTrigger] = usePendingFunction(async () => {

    if (userNameInputRef.current.value === "") {
      alert("아이디를 입력해주세요.");
      userNameInputRef.current.focus();
      return;
    }

    if (passwordInputRef.current.value === "") {
      alert("비밀번호를 입력해주세요.");
      passwordInputRef.current.focus();
      return;
    }

    if (companyNameInputRef.current.value === "") {
      alert("업체명을 입력해주세요.");
      companyNameInputRef.current.focus();
      return;
    }

    if (companyNumberInputRef.current.value === "") {
      alert("사업자등록번호를 입력해주세요.");
      companyNumberInputRef.current.focus();
      return;
    }

    if (telInputRef.current.value === "") {
      alert("연락처를 입력해주세요.");
      telInputRef.current.focus();
      return;
    }

    const dto = await fetch(`/v1/user`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        user: {
          userName: userNameInputRef.current.value,
          password: passwordInputRef.current.value,
          companyName: companyNameInputRef.current.value,
          companyNumber: companyNumberInputRef.current.value,
          tel: telInputRef.current.value,
        }
      })
    }).then((response) => response.json());
    if (dto.code !== 0) {
      alert(dto.message);
    } else {
      alert("등록되었습니다.");
      navigate(`/user/list`);
    }
    
  });

  return (
    <LayoutDefault>
      <Form>
        <Form.Group as={Row} className="mb-3" controlId="userName">
          <Form.Label column sm={2}>
            아이디
          </Form.Label>
          <Col sm={10}>
            <Form.Control placeholder="아이디" name="userName" ref={userNameInputRef}/>
          </Col>
        </Form.Group>
        <Form.Group as={Row} className="mb-3" controlId="password">
          <Form.Label column sm={2}>
            비밀번호
          </Form.Label>
          <Col sm={10}>
            <Form.Control placeholder="비밀번호" name="password" ref={passwordInputRef} />
          </Col>
        </Form.Group>
        <Form.Group as={Row} className="mb-3" controlId="companyName">
          <Form.Label column sm={2}>
            업체명
          </Form.Label>
          <Col sm={10}>
            <Form.Control placeholder="업체명" name="companyName" ref={companyNameInputRef} />
          </Col>
        </Form.Group>
        <Form.Group as={Row} className="mb-3" controlId="companyNumber">
          <Form.Label column sm={2}>
            사업자등록번호
          </Form.Label>
          <Col sm={10}>
            <Form.Control placeholder="사업자등록번호" name="companyNumber" ref={companyNumberInputRef} />
          </Col>
        </Form.Group>
        <Form.Group as={Row} className="mb-3" controlId="tel">
          <Form.Label column sm={2}>
            연락처
          </Form.Label>
          <Col sm={10}>
            <Form.Control placeholder="연락처" name="tel" ref={telInputRef}/>
          </Col>
        </Form.Group>
        <Form.Group as={Row} className="mb-3">
          <Col sm={{ span: 10, offset: 2 }}>
            <Button className="me-3" onClick={postUserTrigger}>등록</Button>
            <Button variant="outline-secondary" onClick={() => navigate(`/user/list`)}>취소</Button>
          </Col>
        </Form.Group>
      </Form>
    </LayoutDefault>
  );
}