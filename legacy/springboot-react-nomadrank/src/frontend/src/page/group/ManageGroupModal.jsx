import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';
import { Modal, Button, Form, ListGroup } from 'react-bootstrap';

const ManageGroupModal = ({ show, handleClose, onSave }) => {
  const [groups] = useState(['Group A', 'Group B', 'Group C']);
  const [restaurants] = useState(['Restaurant 1', 'Restaurant 2', 'Restaurant 3']);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [groupRestaurants, setGroupRestaurants] = useState({
    'Group A': [],
    'Group B': [],
    'Group C': []
  });

  const handleRestaurantToggle = (restaurant) => {
    if (selectedGroup === null) return;

    const updatedRestaurants = groupRestaurants[selectedGroup].includes(restaurant)
      ? groupRestaurants[selectedGroup].filter(r => r !== restaurant)
      : [...groupRestaurants[selectedGroup], restaurant];

    setGroupRestaurants({
      ...groupRestaurants,
      [selectedGroup]: updatedRestaurants
    });
  };

  return (
    <Modal show={show} onHide={handleClose} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>그룹 관리</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="d-flex">
          <div className="flex-grow-1 me-3">
            <h5>그룹 목록</h5>
            <ListGroup>
              {groups.map((group, index) => (
                <ListGroup.Item
                  key={index}
                  active={selectedGroup === group}
                  onClick={() => setSelectedGroup(group)}
                  style={{ cursor: 'pointer' }}
                >
                  {group}
                </ListGroup.Item>
              ))}
            </ListGroup>
          </div>
          <div className="flex-grow-1">
            <h5>식당 목록</h5>
            {selectedGroup ? (
              <ListGroup>
                {restaurants.map((restaurant, index) => (
                  <ListGroup.Item key={index}>
                    <Form.Check
                      type="checkbox"
                      label={restaurant}
                      checked={groupRestaurants[selectedGroup].includes(restaurant)}
                      onChange={() => handleRestaurantToggle(restaurant)}
                    />
                  </ListGroup.Item>
                ))}
              </ListGroup>
            ) : (
              <p>그룹을 선택해주세요</p>
            )}
          </div>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          닫기
        </Button>
        <Button variant="primary" onClick={handleClose}>
          저장
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

ManageGroupModal.propTypes = {
  show: PropTypes.bool.isRequired,
  handleClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired
};

export default ManageGroupModal;
