import { useAuthStore } from "/src/store/StoreProvider.jsx";
import { useNavigate, useParams } from "react-router-dom";
import LayoutDefault from "/src/component/layout/default/Index.jsx";
import { Button, Card, Col, Form, Row } from "react-bootstrap";
import usePendingFunction from "../../../use/usePendingFunction";
import { useEffect, useRef, useState } from "react";
import '@toast-ui/editor/dist/toastui-editor.css';
import { Editor } from '@toast-ui/react-editor';
import NoticeEditStyle from "./Style";
import { useForm } from "react-hook-form";

export default function NoticeEditPage() {

  const { id } = useParams();
  const navigate = useNavigate();
  const style = NoticeEditStyle();
  const authStore = useAuthStore();
  const contentInputRef = useRef();
  const [categoryList, setCategoryList] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const categoryInputRef = useRef();

  const fields = [
    { name: "subject", label: "제목", placeholder: "제목을 입력해주세요.", validation: { required: "제목은 필수 입력 항목입니다." } },
  ]

  const { register, handleSubmit, setValue, formState: { errors } } = useForm({
    defaultValues: fields.reduce((acc, field) => ({ ...acc, [field.name]: "" }), {})
  });

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
    setValue("subject", dto.data.notice.subject);
  });

  useEffect(() => {
    getShopWithIdTrigger();
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

  useEffect(() => {
    if (noticeWithIdResult) {
      setSelectedCategory(noticeWithIdResult.notice.categoryName);
    }
  }, [noticeWithIdResult]);

  const onSubmit = async (data) => {
    if (!categoryInputRef.current.value) {
      alert("카테고리를 선택해주세요.");
      categoryInputRef.current.focus();
      return;
    }

    if (contentInputRef.current.getInstance().getMarkdown() === "") {
      alert("내용을 입력해주세요.");
      contentInputRef.current.getInstance().focus();
      return;
    }

    const dto = await fetch(`/v1/notice/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        notice: {
          id: id, 
          category: categoryInputRef.current.value,
          subject: data.subject,
          content: contentInputRef.current.getInstance().getMarkdown() 
        }
      })
    }).then((response) => response.json());
    if (dto.code !== 0) {
      alert(dto.message);
    } else {
      alert("수정되었습니다.");
      navigate(`/notice/${id}`);
    }
  };

  if (authStore.loginUser.user.authority.includes("USER")) {
    alert("해당 권한이 없습니다.");
    navigate(`/notice`);
    return;
  }

  return (
    <LayoutDefault>
      {
        noticeWithIdResult ? <>
          <Card style={style.card}>
            <Form onSubmit={handleSubmit(onSubmit)}>
              <Card.Body>
                <Row>
                  <Col>
                  <Form.Group className="mb-3" controlId="category" style={style.formGroup}>
                    <Form.Label style={style.formLabel}>카테고리</Form.Label>
                    <Col>
                      <Form.Select ref={categoryInputRef} value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
                        <option value="">카테고리를 선택해주세요</option>
                        {categoryList.map((category, index) => (
                          <option key={index} value={category.categoryName}>
                            {category.categoryValue}
                          </option>
                        ))}
                      </Form.Select>
                    </Col>
                  </Form.Group>
                    {fields.map((field, idx) => (
                      <Form.Group style={style.formGroup} key={idx}>
                        <Form.Label htmlFor={field.name} style={style.formLabel}>{field.label}</Form.Label>
                        <Form.Control
                          id={field.name}
                          type={field.type || "text"}
                          placeholder={field.placeholder || ""}
                          readOnly={field.readOnly}
                          {...register(field.name, field.validation)}
                        />
                        
                        {errors[field.name] && <Form.Text className="text-danger">{errors[field.name].message}</Form.Text>}
                      </Form.Group>  
                    ))}
                  <Form.Group style={style.formGroup} controlId="content" >
                      <Form.Label style={style.formLabel}>본문</Form.Label>
                      <Editor
                        previewStyle="vertical"
                        height="400px"
                        initialEditType="wysiwyg"
                        initialValue={noticeWithIdResult.notice.content}
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
                      <Button type="submit" variant="outline-primary" className="me-3" style={{ width: "100%" }}>수정</Button>
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
        </>
        : <div></div>
      }
    </LayoutDefault>
  );
}