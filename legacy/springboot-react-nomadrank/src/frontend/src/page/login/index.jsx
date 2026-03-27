import { useForm } from "react-hook-form";
import { Button, Card, Col, Container, FloatingLabel, Form, Row } from "react-bootstrap";
import { ChatFill } from "react-bootstrap-icons";
import LoginStyle from "./Style";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "/src/store/StoreProvider.jsx";
import { useState } from "react";

export default function LoginPage() {
  const style = LoginStyle();
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors } } = useForm();
  const authStore = useAuthStore();
  const [copied, setCopied] = useState(false);
  const email = "help@nesoone.com";
  const kakaoLink = "https://open.kakao.com/o/sPN16smh";

  if (authStore.loginUser) {
    navigate("/nplace/rank/track");
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(email).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000); // 2초 후 메시지 숨김
    });
  };

  const onSubmit = async (data) => {
    const dto = await fetch(`/v1/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        user: data
      })
    }).then((response) => response.json());
    if (dto.code === -3) {
      alert(Object.keys(dto.data).map((key) => dto.data[key]).join("\n"));
      return;
    } else if (dto.code !== 0) {
      alert(dto.message);
      return;
    } else {
      window.location.reload();
    }
  };

  return (
    <Container className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
      <Card style={style.card}>
        <Card.Header as="h4" style={style.cardHeader} className="text-center border-0 pt-4">로그인</Card.Header>
        <Card.Body>
          <Form onSubmit={handleSubmit(onSubmit)}>
            <Form.Group controlId="formUsername" style={style.formGroup}>
              <FloatingLabel controlId="floatingInput" label="Account">
                <Form.Control
                  placeholder="Account"
                  {...register("username", { required: "아이디를 입력하세요." })}
                />
                {errors.username && <Form.Text className="text-danger">{errors.username.message}</Form.Text>}
              </FloatingLabel>
            </Form.Group>

            <Form.Group controlId="formPassword" className="mb-4" style={style.formGroup}>
              <FloatingLabel controlId="floatingInput" label="Password">
                <Form.Control
                  type="password"
                  placeholder="Password"
                  {...register("password", { required: "비밀번호를 입력하세요." })}
                />
                {errors.password && <Form.Text className="text-danger">{errors.password.message}</Form.Text>}
              </FloatingLabel>
            </Form.Group>

            <Button variant="primary" type="submit" className="btn-block w-100">
              로그인
            </Button>
            <hr></hr>
            <Button variant="outline-primary" type="button" className="btn-block mb-3 w-100" onClick={() => navigate(`/sign-up`)}>
              간편가입
            </Button>

            <Row className="mb-1 position-relative">
              <Col className="justify-content-center align-content-center text-center">
                <small
                  style={{ cursor: "pointer", color: "blue", textDecoration: "underline", position: "relative" }}
                  onClick={copyToClipboard}
                >
                  {email}
                </small>
                {copied && (
                  <div
                    style={{
                      position: "absolute",
                      top: "-25px",
                      left: "50%",
                      transform: "translateX(-50%)",
                      backgroundColor: "black",
                      color: "white",
                      padding: "5px 10px",
                      borderRadius: "5px",
                      fontSize: "12px",
                      whiteSpace: "nowrap",
                    }}
                  >
                    이메일이 복사되었습니다.
                  </div>
                )}
              </Col>
              <Col className="d-flex justify-content-center">
                <a href={kakaoLink} target="_blank" rel="noopener noreferrer" className="text-decoration-none">
                <Button className="d-flex align-items-center text-dark border-0 px-3 py-2 fw-bold" style={{backgroundColor: "#fee500"}}>
                  <ChatFill className="me-2" /> <small>카카오톡 문의</small>
                </Button>
                </a>
              </Col>
            </Row>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
}