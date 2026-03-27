import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { useForm } from 'react-hook-form';

const GroupModal = ({ show, handleClose, onSave, editData }) => {
    const [products, setProducts] = useState([]);
    const { register, handleSubmit, setValue, formState: { errors }, reset } = useForm();

    useEffect(() => {
        // 상품 목록 설정
        setProducts([
            {
                "name": "NPLACE_RANK_TRACK",
                "value": "N플레이스 순위추적"
            }
        ]);
    }, []);

    useEffect(() => {
        reset();
        if (editData) {
            // 수정 모드일 때 기존 데이터 설정
            setValue("id", editData.id);
            setValue("serviceSort", editData.serviceSort);
            setValue("groupName", editData.groupName);
            setValue("memo", editData.memo);
        }
    }, [editData, reset, setValue]);

    const onSubmit = (data) => {
        onSave(data, editData ? 'edit' : 'add'); // editData가 있으면 수정, 없으면 추가
        handleClose();
    };

    return (
        <Modal show={show} onHide={handleClose}>
            <Modal.Header closeButton>
                <Modal.Title>{editData ? "그룹 수정" : "그룹 추가"}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form onSubmit={handleSubmit(onSubmit)}>
                    <Form.Group className="mb-3">
                        <Form.Label>상품</Form.Label>
                        <Form.Select {...register("serviceSort", { required: "상품을 선택하세요" })}>
                            {products.map((product, index) => (
                                <option key={index} value={product.name}>{product.value}</option>
                            ))}
                        </Form.Select>
                        {errors.serviceSort && <p className="text-danger">{errors.serviceSort.message}</p>}
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>그룹명</Form.Label>
                        <Form.Control
                            type="text"
                            {...register("groupName", { required: "그룹명을 입력하세요" })}
                            placeholder="그룹명을 입력하세요"
                        />
                        {errors.groupName && <p className="text-danger">{errors.groupName.message}</p>}
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>메모</Form.Label>
                        <Form.Control
                            type="text"
                            {...register("memo")}
                            placeholder="메모를 입력하세요"
                        />
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

GroupModal.propTypes = {
    show: PropTypes.bool.isRequired,
    handleClose: PropTypes.func.isRequired,
    onSave: PropTypes.func.isRequired,
    editData: PropTypes.object,
};

export default GroupModal;