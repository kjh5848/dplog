import { useNavigate } from "react-router-dom";
import LayoutDefault from "/src/component/layout/default/Index.jsx";
import { Button, Col, Form, Row } from "react-bootstrap";
import usePendingFunction from "../../../use/usePendingFunction";
import { useRef } from "react";

export default function DistributorAddPage() {

  const navigate = useNavigate();

  const companyNameInputRef = useRef();
  const userNameInputRef = useRef();
  const passwordInputRef = useRef();
  const telInputRef = useRef();
  const emailInputRef = useRef();
  const depositInputRef = useRef();
  const accountNumberInputRef = useRef();
  const bankNameInputRef = useRef();
  const googleSheetUrlInputRef = useRef();
  const memoInputRef = useRef();

  const [postDistributorTrigger] = usePendingFunction(async () => {

    if (companyNameInputRef.current.value === "") {
      alert("관리자명을 입력해주세요.");
      companyNameInputRef.current.focus();
      return;
    }

    if (userNameInputRef.current.value === "") {
      alert("관리자 아이디를 입력해주세요.");
      userNameInputRef.current.focus();
      return;
    }

    if (passwordInputRef.current.value === "") {
      alert("관리자 비밀번호를 입력해주세요.");
      passwordInputRef.current.focus();
      return;
    }

    if (telInputRef.current.value === "") {
      alert("연락처를 입력해주세요.");
      telInputRef.current.focus();
      return;
    }

    if (emailInputRef.current.value === "") {
      alert("이메일을 입력해주세요.");
      emailInputRef.current.focus();
      return;
    }

    if (depositInputRef.current.value === "") {
      alert("예금주를 입력해주세요.");
      depositInputRef.current.focus();
      return;
    }

    if (accountNumberInputRef.current.value === "") {
      alert("계좌번호를 입력해주세요.");
      accountNumberInputRef.current.focus();
      return;
    }

    if (bankNameInputRef.current.value === "") {
      alert("은행명을 입력해주세요.");
      bankNameInputRef.current.focus();
      return;
    }

    const dto = await fetch(`/v1/distributor`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        distributor: {
          companyName: companyNameInputRef.current.value,
          userName: userNameInputRef.current.value,
          password: passwordInputRef.current.value,
          tel: telInputRef.current.value,
          email: emailInputRef.current.value,
          deposit: depositInputRef.current.value,
          accountNumber: accountNumberInputRef.current.value,
          bankName: bankNameInputRef.current.value,
          googleSheetUrl: googleSheetUrlInputRef.current.value,
          memo: memoInputRef.current.value
        }
      })
    }).then((response) => response.json());
    if (dto.code !== 0) {
      alert(dto.message);
    } else {
      alert("등록되었습니다.");
      navigate(`/distributor/list`);
    }
    
  });

  return (
    <LayoutDefault>
      <Form>
        <Form.Group as={Row} className="mb-3" controlId="companyName">
          <Form.Label column sm={2}>
            관리자명
          </Form.Label>
          <Col sm={10}>
            <Form.Control placeholder="관리자명" name="companyName" ref={companyNameInputRef} />
          </Col>
        </Form.Group>
        <Form.Group as={Row} className="mb-3" controlId="userName">
          <Form.Label column sm={2}>
            관리자 아이디
          </Form.Label>
          <Col sm={10}>
            <Form.Control placeholder="관리자 아이디" name="userName" ref={userNameInputRef}/>
          </Col>
        </Form.Group>
        <Form.Group as={Row} className="mb-3" controlId="password">
          <Form.Label column sm={2}>
            관리자 비밀번호
          </Form.Label>
          <Col sm={10}>
            <Form.Control placeholder="관리자 비밀번호" name="password" ref={passwordInputRef} />
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
        <Form.Group as={Row} className="mb-3" controlId="email">
          <Form.Label column sm={2}>
            이메일
          </Form.Label>
          <Col sm={10}>
            <Form.Control type="email" placeholder="이메일" name="email" ref={emailInputRef} />
          </Col>
        </Form.Group>
        <Form.Group as={Row} className="mb-3" controlId="deposit">
          <Form.Label column sm={2}>
            예금주
          </Form.Label>
          <Col sm={10}>
            <Form.Control placeholder="예금주" name="deposit" ref={depositInputRef}/>
          </Col>
        </Form.Group>
        <Form.Group as={Row} className="mb-3" controlId="accountNumber">
          <Form.Label column sm={2}>
            계좌번호
          </Form.Label>
          <Col sm={10}>
            <Form.Control placeholder="계좌번호" name="accountNumber" ref={accountNumberInputRef}/>
          </Col>
        </Form.Group>
        <Form.Group as={Row} className="mb-3" controlId="bankName">
          <Form.Label column sm={2}>
            은행명
          </Form.Label>
          <Col sm={10}>
            <Form.Control placeholder="은행명" name="bankName" ref={bankNameInputRef} />
          </Col>
        </Form.Group>
        <Form.Group as={Row} className="mb-3" controlId="googleSheetUrl">
          <Form.Label column sm={2}>
            구글시트URL
          </Form.Label>
          <Col sm={10}>
            <Form.Control placeholder="구글시트URL" name="googleSheetUrl" ref={googleSheetUrlInputRef} />
          </Col>
        </Form.Group>
        <Form.Group as={Row} className="mb-3" controlId="memo">
          <Form.Label column sm={2}>
            메모
          </Form.Label>
          <Col sm={10}>
            <Form.Control placeholder="메모" name="memo" ref={memoInputRef} />
          </Col>
        </Form.Group>

        <Form.Group as={Row} className="mb-3">
          <Col sm={{ span: 10, offset: 2 }}>
            <Button className="me-3" onClick={postDistributorTrigger}>등록</Button>
            <Button variant="outline-secondary" onClick={() => navigate(`/distributor/list`)}>취소</Button>
          </Col>
        </Form.Group>
      </Form>
    </LayoutDefault>
  );
}