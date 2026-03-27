import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { useForm } from 'react-hook-form';

const PlaceModal = ({ show, handleClose, onSave, editData }) => {
    const [products, setProducts] = useState([]);
    const { register, handleSubmit, setValue, formState: { errors }, reset } = useForm();

    useEffect(() => {
        // 상품 목록 설정
        setProducts([
            {
                "name": "SAVE",
                "value": "저장하기"
            },
            {
                "name": "TRAFFIC",
                "value": "트래픽"
            }
        ]);
    }, []);

    useEffect(() => {
        reset();
        if (editData) {
            // 수정 모드일 때 기존 데이터 설정
            setValue("id", editData.id);
            setValue("nplaceRewardProduct", editData.nplaceRewardProduct);
            setValue("price", editData.price);
            setValue("accountNumber", editData.accountNumber);
            setValue("deposit", editData.deposit);
            setValue("bankName", editData.bankName);
        }
    }, [editData, reset, setValue]);

    const onSubmit = (data) => {
        onSave(data, editData ? 'edit' : 'add'); // editData가 있으면 수정, 없으면 추가
        handleClose();
    };

    return (
        <Modal show={show} onHide={handleClose}>
            <Modal.Header closeButton>
                <Modal.Title>플레이스 {editData ? "수정" : "추가"}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form onSubmit={handleSubmit(onSubmit)}>
                    <Form.Group className="mb-3">
                        <Form.Label>상품</Form.Label>
                        <Form.Select {...register("nplaceRewardProduct", { required: "상품을 선택하세요" })} disabled={!!editData}>
                            {products.map((product, index) => (
                                <option key={index} value={product.name}>{product.value}</option>
                            ))}
                        </Form.Select>
                        {errors.nplaceRewardProduct && <p className="text-danger">{errors.nplaceRewardProduct.message}</p>}
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>단가</Form.Label>
                        <Form.Control
                            type="number"
                            {...register("price", { required: "단가를 입력하세요" })}
                            placeholder="단가를 입력하세요"
                        />
                        {errors.price && <p className="text-danger">{errors.price.message}</p>}
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>계좌번호</Form.Label>
                        <Form.Control
                            type="text"
                            {...register("accountNumber", { required: "계좌번호를 입력하세요" })}
                            placeholder="계좌번호를 입력하세요"
                        />
                        {errors.accountNumber && <p className="text-danger">{errors.accountNumber.message}</p>}
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>예금주</Form.Label>
                        <Form.Control
                            type="text"
                            {...register("deposit", { required: "예금주를 입력하세요" })}
                            placeholder="예금주를 입력하세요"
                        />
                        {errors.deposit && <p className="text-danger">{errors.deposit.message}</p>}
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>은행이름</Form.Label>
                        <Form.Control
                            type="text"
                            {...register("bankName", { required: "은행이름을 입력하세요" })}
                            placeholder="은행이름을 입력하세요"
                        />
                        {errors.bankName && <p className="text-danger">{errors.bankName.message}</p>}
                    </Form.Group>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={handleClose}>취소</Button>
                        <Button variant="primary" type="submit">{editData ? "수정" : "저장"}</Button>
                    </Modal.Footer>
                </Form>
            </Modal.Body>
        </Modal>
    );
};

PlaceModal.propTypes = {
    show: PropTypes.bool.isRequired,
    handleClose: PropTypes.func.isRequired,
    onSave: PropTypes.func.isRequired,
    editData: PropTypes.object
};

export default PlaceModal;