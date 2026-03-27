import PropTypes from "prop-types";
import { Button, Table } from "react-bootstrap";

export default function GroupTable({groupList, onEdit, onDelete}) {

  const handleEdit = (group) => {
    onEdit(group);
  };
  const handleDelete = (group) => {
    onDelete(group);
  };
  
  return (
    <Table hover>
      <thead>
      <tr>
        <th scope="col">상품</th>
        <th scope="col">그룹명</th>
        <th scope="col">메모</th>
        <th scope="col">등록수</th>
        <th scope="col">등록일</th>
        <th scope="col">관리</th>
      </tr>
      </thead>
      <tbody>
        {(() => {
          if (!groupList || groupList.length === 0) {
            return (
              <tr>
                <th colSpan={6}>그룹이 존재하지 않습니다.</th>
              </tr>
            );
          } else {
            return groupList.map((group) => {
              return (
                <tr key={group.id}>
                  <td>{group.serviceSortValue}</td>
                  <td>{group.groupName}</td>
                  <td>{group.memo}</td>
                  <td>{group.count}</td>
                  <td>{group.createDate}</td>
                  <td>
                  <Button
                    variant="primary"
                    className="me-2 btn-sm" 
                    onClick={() => handleEdit(group)}
                  >
                    수정
                  </Button>
                  <Button 
                    variant="secondary"
                    className="btn-sm"
                    onClick={() => handleDelete(group)}
                  >
                    삭제
                  </Button>
                  </td>
                </tr>
              );
            });
          }
        })()}
      </tbody>
    </Table>
  );
}

GroupTable.propTypes = {
  groupList: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number,
      serviceSortName: PropTypes.string,
      serviceSortValue: PropTypes.string,
      groupName: PropTypes.string,
      memo: PropTypes.string,
      count: PropTypes.number,
      createDate: PropTypes.string
    })
  ).isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
}