import { useForm } from "react-hook-form";
import { Button, Card, Container, FloatingLabel, Form, InputGroup } from "react-bootstrap";
import SignUpStyle from "./Style";
import Swal from 'sweetalert2/dist/sweetalert2.js';
import '@sweetalert2/theme-bootstrap-4/bootstrap-4.css';
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function SignUpPage() {
  const style = SignUpStyle();
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm();
  const [isVerified, setIsVerified] = useState(false);
  const navigate = useNavigate();

  const onSubmit = async (data) => {
    if (!isVerified) {
      Swal.fire({
        icon: "info",
        title: "",
        text: "사업자등록번호를 인증해주세요.",
      });
      return;
    }

    data.companyNumber = data.companyNumber.replace(/[^0-9]/g, "");

    const dto = await fetch(`/v1/user`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        user: data
      })
    }).then((response) => response.json());
    if (dto.code !== 0) {
      alert(dto.message);
    } else {
      alert("등록되었습니다.");
      navigate(`/login`);
    }
  };

  const password = watch("password");

  const checkCompanyNumber = async () => {
    const companyNumber = watch("companyNumber");
    if (!companyNumber) {
      Swal.fire({
        icon: "info",
        title: "",
        text: "사업자등록번호를 입력하세요.",
      });
      return;
    }

    const data = {
      "b_no": [companyNumber.replace(/[^0-9]/g, "")] // 사업자번호 "xxxxxxx" 로 조회 시
    };

    const serviceKey = import.meta.env.VITE_NTS_BUSINESSMAN_SERVICE_KEY;

    fetch(`https://api.odcloud.kr/api/nts-businessman/v1/status?serviceKey=${serviceKey}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify(data)
    })
      .then(response => {
        if (!response.ok) {
          return response.json().then(err => { throw new Error(err.message) });
        }
        return response.json();
      })
      .then(result => {
        if (result.match_cnt) {
          Swal.fire({
            text: "인증되었습니다.",
            icon: "success"
          });
          setIsVerified(true);
        } else {
          Swal.fire({
            icon: "info",
            text: "유효하지 않은 사업자등록번호입니다."
          });
        }
      })
      .catch(error => {
        Swal.fire({
          icon: "error",
          text: error.message
        });
      });
  };

  const handleCompanyNumberChange = (e) => {
    if (e.nativeEvent.inputType === "insertText") {
      let value = e.target.value.replace(/[^0-9]/g, "");
      if (value.length < 3) value;
      else if (value.length == 3) value = `${value}-`;
      else if (value.length < 5) value = `${value.slice(0, 3)}-${value.slice(3)}`;
      else if (value.length == 5) value = `${value.slice(0, 3)}-${value.slice(3)}-`;
      else value = `${value.slice(0, 3)}-${value.slice(3, 5)}-${value.slice(5, 10)}`;
      setValue("companyNumber", value);
    } else {
      setValue("companyNumber", e.target.value);
    }
  };

  const handleUsernameChange = (e) => {
      let value = e.target.value.replace(/[^a-z0-9]/g, '');
      setValue("userName", value);
  };

  const handleTelChange = (e) => {
    setValue("tel", e.target.value.replace(/[^0-9]/g, ""));
  }

  return (
    <Container className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
      <Card style={style.card}>
        <Card.Header as="h4" style={style.cardHeader} className="text-center border-0 pt-4">회원가입</Card.Header>
        <Card.Body>
          <Form onSubmit={handleSubmit(onSubmit)}>
            <Form.Group controlId="formEmail" style={style.formGroup}>
              <FloatingLabel controlId="floatingInput" label={<Form.Text>아이디 <span style={{ color: 'red' }}>*</span></Form.Text>}>
                <Form.Control
                  placeholder="아이디"
                  {...register("userName", { 
                    required: "아이디을 입력하세요.",
                    onChange: handleUsernameChange,
                  })}
                />
                {errors.userName && <Form.Text className="text-danger">{errors.userName.message}</Form.Text>}
              </FloatingLabel>
            </Form.Group>

            <Form.Group controlId="formPassword" style={style.formGroup}>
              <FloatingLabel controlId="floatingInput" label={<Form.Text>비밀번호 <span style={{ color: 'red' }}>*</span></Form.Text>}>
                <Form.Control
                  type="password"
                  placeholder="비밀번호"
                  {...register("password", { required: "비밀번호를 입력하세요." })}
                />
                {errors.password && <Form.Text className="text-danger">{errors.password.message}</Form.Text>}
              </FloatingLabel>
            </Form.Group>

            <Form.Group controlId="formPasswordConfirm" style={style.formGroup}>
              <FloatingLabel controlId="floatingInput" label={<Form.Text>비밀번호 재확인 <span style={{ color: 'red' }}>*</span></Form.Text>}>
                <Form.Control
                  type="password"
                  placeholder="비밀번호 재확인"
                  {...register("passwordConfirm", {
                    required: "비밀번호를 다시 입력하세요.",
                    validate: (value) =>
                      value === password || "비밀번호가 일치하지 않습니다."
                  })}
                />
                {errors.passwordConfirm && <Form.Text className="text-danger">{errors.passwordConfirm.message}</Form.Text>}
              </FloatingLabel>
            </Form.Group>

            <Form.Group controlId="formCompanyName" style={style.formGroup}>
              <FloatingLabel controlId="floatingInput" label={<Form.Text>업체명 <span style={{ color: 'red' }}>*</span></Form.Text>}>
                <Form.Control
                  placeholder="업체명"
                  {...register("companyName", { required: "업체명을 입력하세요." })}
                />
                {errors.companyName && <Form.Text className="text-danger">{errors.companyName.message}</Form.Text>}
              </FloatingLabel>
            </Form.Group>

            <Form.Group controlId="formCompanyNumber" style={style.formGroup}>
              <InputGroup>
                <FloatingLabel controlId="floatingInput" label={<Form.Text>사업자등록번호 <span style={{ color: 'red' }}>*</span></Form.Text>}>
                  <Form.Control
                    placeholder="사업자등록번호"
                    {...register("companyNumber", { 
                      required: "사업자등록번호를 입력하세요.",
                      onChange: handleCompanyNumberChange,
                    })}
                  />
                </FloatingLabel>
                <Button variant="outline-primary" onClick={checkCompanyNumber}>인증</Button>
              </InputGroup>
              {errors.companyNumber && <Form.Text className="text-danger">{errors.companyNumber.message}</Form.Text>}
            </Form.Group>

            <Form.Group controlId="formTel" className="mb-4" style={style.formGroup}>
              <FloatingLabel controlId="floatingTelInput" label={<Form.Text>연락처 <span style={{ color: 'red' }}>*</span></Form.Text>}>
                <Form.Control
                  placeholder="연락처"
                  {...register("tel", { 
                    required: "연락처를 입력하세요.",
                    onChange: handleTelChange
                  })}
                />
                {errors.tel && <Form.Text className="text-danger">{errors.tel.message}</Form.Text>}
              </FloatingLabel>
            </Form.Group>

            <Button variant="primary" type="submit" className="btn-block w-100">
              가입
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
}
