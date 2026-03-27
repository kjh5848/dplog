import { useNavigate, useParams } from "react-router-dom";
import LayoutDefault from "/src/component/layout/default/Index.jsx";
import { Button, Col, Form, Row } from "react-bootstrap";
import { useEffect, useState } from "react";
import usePendingFunction from "../../use/usePendingFunction";

export default function ProductPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [products, setProducts] = useState({});

  const [getProductTrigger] = usePendingFunction(async () => {
    const dto = await fetch(`/v1/product/${id}`, {
      method: "GET"
    }).then((response) => response.json());
    if (dto.code !== 0) {
      alert(dto.message);
      return;
    }
    const productData = dto.data.product;
    const initialProducts = productData.reduce((acc, product) => {
      if (!acc[product.productSort]) {
        acc[product.productSort] = {
          name: product.name,
          productSort: product.productSort,
          entries: [{ quantity: product.quantity || '', price: product.price || '' }]
        };
      } else {
        acc[product.productSort].entries.push({
          quantity: product.quantity || '',
          price: product.price || ''
        });
      }
      return acc;
    }, {});

    setProducts(initialProducts);
  });

  useEffect(() => {
    getProductTrigger();
  }, []);

  const handleInputChange = (productSort, index, event) => {
    const { name, value } = event.target;
    const updatedProducts = { ...products };
    updatedProducts[productSort].entries[index][name] = value;
    setProducts(updatedProducts);
  };

  const handleAddFields = (productSort) => {
    const updatedProducts = { ...products };
    updatedProducts[productSort].entries.push({ quantity: '', price: '' });
    setProducts(updatedProducts);
  };

  const [postProductTrigger] = usePendingFunction(async () => {
    const payload = Object.values(products).flatMap((product) => {
      return product.entries.map(entry => ({
        productSort: product.productSort,
        quantity: entry.quantity,
        price: entry.price,
      }));
    });

    const dto = await fetch(`/v1/product`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        product: payload,
        distributor: {
          id: id
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
        {Object.values(products).map((product, index) => (
          <div key={index}>
            {product.entries.map((entry, entryIndex) => (
              <Row key={entryIndex} className="mb-3">
                <Col md={4}>
                  <Form.Label>{product.name}</Form.Label>
                </Col>
                <Col md={4}>
                  <Form.Control
                    type="number"
                    name="quantity"
                    placeholder="수량 입력"
                    value={entry.quantity}
                    onChange={(e) => handleInputChange(product.productSort, entryIndex, e)}
                  />
                </Col>
                <Col md={4}>
                  <Form.Control
                    type="number"
                    name="price"
                    placeholder="가격 입력"
                    value={entry.price}
                    onChange={(e) => handleInputChange(product.productSort, entryIndex, e)}
                  />
                </Col>
              </Row>
            ))}
            <Button variant="secondary" onClick={() => handleAddFields(product.productSort)}>
              추가
            </Button>
          </div>
        ))}
        <Button variant="primary" onClick={postProductTrigger} className="mt-3">
          저장
        </Button>
      </Form>
    </LayoutDefault>
  );
  
}
