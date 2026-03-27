import LayoutDefault from "/src/component/layout/default/Index.jsx";
import AccountFormComponent from "../../../component/AccountForm";

export default function UserIdPage() {
  const fields = [
    { name: "companyName", label: "업체명", readOnly: true },
    { name: "companyNumber", label: "사업자등록번호", readOnly: true },
    { name: "password", label: "비밀번호", type: "password", placeholder: "비밀번호 변경 시 새 비밀번호를 입력하세요." },
    { name: "tel", label: "연락처", validation: { required: "연락처는 필수 입력 항목입니다." } },
  ];

  const fetchData = async () => {
    const response = await fetch(`/v1/user`);
    const dto = await response.json();
    if (dto.code === 0) {
      dto.data.user.companyNumber = `${dto.data.user.companyNumber.slice(0, 3)}-${dto.data.user.companyNumber.slice(3, 5)}-${dto.data.user.companyNumber.slice(5)}`;
      return dto.data.user;
    } else {
      return null;
    }
  };

  const updateData = async (data) => {
    const response = await fetch(`/v1/user`, {
      method: "PUT",
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user: data })
    });
    const result = await response.json();
    if (result.code !== 0) alert(result.message);
    else alert("정보가 성공적으로 수정되었습니다.");
  };

  return (
    <LayoutDefault>
      <AccountFormComponent fields={fields} title="내 정보" fetchData={fetchData} updateData={updateData} />
    </LayoutDefault>
  );
}