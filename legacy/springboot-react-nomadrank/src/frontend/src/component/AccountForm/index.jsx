import { Button, Card, Col, Form, Row } from "react-bootstrap";
import FormStyle from "./Style";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import PropTypes from "prop-types";

const AccountFormComponent = ({ fields, title, fetchData, updateData }) => {
  const style = FormStyle();
  const { register, handleSubmit, setValue, formState: { errors } } = useForm({
    defaultValues: fields.reduce((acc, field) => ({ ...acc, [field.name]: "" }), {})
  });

  useEffect(() => {
    const fetchAndSetData = async () => {
      const data = await fetchData();
      if (data) {
        for (const key in data) {
          setValue(key, data[key]);
        }
      }
    };
    fetchAndSetData();
  }, [fetchData, setValue]);

  const onSubmit = async (data) => {
    if (!data.password) delete data.password;
    await updateData(data);
  };

  return (
    <Card style={style.card}>
      <Form onSubmit={handleSubmit(onSubmit)}>
        <Card.Header style={style.cardHeader}>
          <Card.Title style={style.cardTitle}>{title}</Card.Title>
        </Card.Header>
        <Card.Body>
            <Row>
              <Col>
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
              </Col>
            </Row>
        </Card.Body>
        <Card.Footer style={style.cardFooter}>
          <Row>
            <Col>
              <Button type="submit" variant="primary" style={{ width: "100%" }}>수정</Button>
            </Col>
            <Col>
              <Button variant="outline-secondary" style={{ width: "100%" }}>취소</Button>
            </Col>
          </Row>
        </Card.Footer>
      </Form>
    </Card>
  );
};

AccountFormComponent.propTypes = {
  title: PropTypes.string.isRequired,
  fields: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
      type: PropTypes.string,
      placeholder: PropTypes.string,
      readOnly: PropTypes.bool,
      validation: PropTypes.shape({
        required: PropTypes.string.isRequired,
        pattern: PropTypes.shape(RegExp)
      }),
    })
  ).isRequired,
  fetchData: PropTypes.func.isRequired,
  updateData: PropTypes.func.isRequired,
};

export default AccountFormComponent;
