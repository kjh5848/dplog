import PropTypes from "prop-types";
import { Button, Table } from "react-bootstrap";

export default function PlaceTable({placeList, onEdit}) {

  const handleEdit = (place) => {
    onEdit(place);
  };
  
  return (
    <Table hover>
      <thead>
      <tr>
        <th scope="col">상품</th>
        <th scope="col">단가</th>
        <th scope="col">계좌번호</th>
        <th scope="col">예금주</th>
        <th scope="col">은행이름</th>
        <th scope="col">관리</th>
      </tr>
      </thead>
      <tbody>
        {(() => {
          if (!placeList || placeList.length === 0) {
            return (
              <tr>
                <th colSpan={6}>플레이스 존재하지 않습니다.</th>
              </tr>
            );
          } else {
            return placeList.map((place) => {
              return (
                <tr key={place.id}>
                  <td>{place.nplaceRewardProductValue}</td>
                  <td>{place.price}</td>
                  <td>{place.accountNumber}</td>
                  <td>{place.deposit}</td>
                  <td>{place.bankName}</td>
                  <td>
                  <Button
                    variant="primary"
                    className="me-2 btn-sm" 
                    onClick={() => handleEdit(place)}
                  >
                    수정
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

PlaceTable.propTypes = {
  placeList: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number,
      nplaceRewardProductValue: PropTypes.string,
      price: PropTypes.number,
      accountNumber: PropTypes.string,
      deposit: PropTypes.string,
      bankName: PropTypes.string
    })
  ).isRequired,
  onEdit: PropTypes.func.isRequired
}