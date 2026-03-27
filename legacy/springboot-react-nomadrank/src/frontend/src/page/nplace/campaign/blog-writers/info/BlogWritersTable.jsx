import PropTypes from "prop-types";
import { Button, Table } from "react-bootstrap";

export default function BlogWritersTable({blogWritersList, onEdit}) {

  const handleEdit = (blogWriters) => {
    onEdit(blogWriters);
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
          if (!blogWritersList || blogWritersList.length === 0) {
            return (
              <tr>
                <th colSpan={6}>블로그 기자단이 존재하지 않습니다.</th>
              </tr>
            );
          } else {
            return blogWritersList.map((blogWriters) => {
              return (
                <tr key={blogWriters.id}>
                  <td>{blogWriters.nplaceRewardBlogWritersTypeValue}</td>
                  <td>{blogWriters.price}</td>
                  <td>{blogWriters.accountNumber}</td>
                  <td>{blogWriters.deposit}</td>
                  <td>{blogWriters.bankName}</td>
                  <td>
                  <Button
                    variant="primary"
                    className="me-2 btn-sm" 
                    onClick={() => handleEdit(blogWriters)}
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

BlogWritersTable.propTypes = {
  blogWritersList: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number,
      nplaceRewardBlogWritersTypeValue: PropTypes.string,
      price: PropTypes.number,
      accountNumber: PropTypes.string,
      deposit: PropTypes.string,
      bankName: PropTypes.string
    })
  ).isRequired,
  onEdit: PropTypes.func.isRequired
}