import { Button, Card, Col, Form, Row } from "react-bootstrap";
import LayoutDefault from "/src/component/layout/default/Index.jsx";
import FormStyle from "./Style";
import { useEffect } from "react";
import usePendingFunction from "../../../use/usePendingFunction";
import { useForm } from "react-hook-form";

export default function DistributorIdPage() {
  const style = FormStyle();

  const { register, handleSubmit, setValue, formState: { errors } } = useForm({
    defaultValues: {
      userId: "",
      distributorId: "",
      companyName: "",
      tel: "",
      email: "",
      deposit: "",
      accountNumber: "",
      bankName: "",
      googleSheetUrl: "",
      memo: "",
      password: ""
    }
  });

  const [getDistributorTrigger, getDistributorIsPending] = usePendingFunction(async () => {
    const dto = await fetch(`/v1/distributor`, {
      method: "GET"
    }).then((response) => response.json());
    if (dto.code !== 0) {
      alert(dto.message);
      return;
    }
    const distributorData = dto.data.distributor;
    for (const key in distributorData) {
      setValue(key, distributorData[key]);
    }
  });

  useEffect(() => {
    getDistributorTrigger();
  }, []);

  const onSubmit = async (data) => {
    // 비밀번호가 빈 값인 경우 해당 필드를 삭제하여 전송하지 않도록 설정
    if (!data.password) {
      delete data.password;
    }

    try {
      const response = await fetch(`/v1/distributor`, {
        method: "PUT",
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({distributor: data})
      });
      const result = await response.json();
      if (result.code !== 0) {
        alert(result.message);
        return;
      }
      alert("정보가 성공적으로 수정되었습니다.");
      getDistributorTrigger();
    } catch (error) {
      console.error("Error updating distributor info:", error);
    }
  };

  return (
    <LayoutDefault>
      {getDistributorIsPending ? (
        <>Loading...</>
      ) : (
        <Card style={style.card}>
          <Card.Header style={style.cardHeader}>
            <Card.Title style={style.cardTitle}>내 정보</Card.Title>
          </Card.Header>
          <Card.Body>
            <Form onSubmit={handleSubmit(onSubmit)}>
              <Row>
                <Col lg={6}>
                  <Form.Group style={style.formGroup}>
                    <Form.Label htmlFor="companyName">업체명</Form.Label>
                    <Form.Control
                      id="companyName"
                      readOnly
                      {...register("companyName")}
                    />
                    {errors.companyName && <span>{errors.companyName.message}</span>}
                  </Form.Group>
                  <Form.Group style={style.formGroup}>
                    <Form.Label htmlFor="password">비밀번호</Form.Label>
                    <Form.Control
                      id="password"
                      type="password"
                      placeholder="비밀번호 변경 시 새 비밀번호를 입력하세요."
                      {...register("password")}
                    />
                  </Form.Group>
                  <Form.Group style={style.formGroup}>
                    <Form.Label htmlFor="tel">연락처</Form.Label>
                    <Form.Control
                      id="tel"
                      {...register("tel", { required: "연락처는 필수 입력 항목입니다." })}
                    />
                    {errors.tel && <span>{errors.tel.message}</span>}
                  </Form.Group>
                  <Form.Group style={style.formGroup}>
                    <Form.Label htmlFor="email">이메일</Form.Label>
                    <Form.Control
                      id="email"
                      {...register("email", { required: "이메일은 필수 입력 항목입니다.", pattern: /^\S+@\S+$/i })}
                    />
                    {errors.email && <span>{errors.email.message}</span>}
                  </Form.Group>
                </Col>
                <Col lg={6}>
                  <Form.Group style={style.formGroup}>
                    <Form.Label htmlFor="deposit">예금주</Form.Label>
                    <Form.Control
                      id="deposit"
                      {...register("deposit", { required: "예금주는 필수 입력 항목입니다." })}
                    />
                    {errors.deposit && <span>{errors.deposit.message}</span>}
                  </Form.Group>
                  <Form.Group style={style.formGroup}>
                    <Form.Label htmlFor="accountNumber">계좌번호</Form.Label>
                    <Form.Control
                      id="accountNumber"
                      {...register("accountNumber", { required: "계좌번호는 필수 입력 항목입니다." })}
                    />
                    {errors.accountNumber && <span>{errors.accountNumber.message}</span>}
                  </Form.Group>
                  <Form.Group style={style.formGroup}>
                    <Form.Label htmlFor="bankName">은행명</Form.Label>
                    <Form.Control
                      id="bankName"
                      {...register("bankName", { required: "은행명은 필수 입력 항목입니다." })}
                    />
                    {errors.bankName && <span>{errors.bankName.message}</span>}
                  </Form.Group>
                  <Form.Group style={style.formGroup}>
                    <Form.Label htmlFor="googleSheetUrl">구글시트URL</Form.Label>
                    <Form.Control
                      id="googleSheetUrl"
                      readOnly
                      {...register("googleSheetUrl")}
                    />
                  </Form.Group>
                </Col>
              </Row>
              <Card.Footer style={style.cardFooter}>
                <Row>
                  <Col>
                    <Button type="submit" variant="primary" style={{ width: "100%" }}>
                      수정
                    </Button>
                  </Col>
                  <Col>
                    <Button variant="outline-secondary" style={{ width: "100%" }}>
                      취소
                    </Button>
                  </Col>
                </Row>
              </Card.Footer>
            </Form>
          </Card.Body>
        </Card>
      )}
    </LayoutDefault>
  );
}
