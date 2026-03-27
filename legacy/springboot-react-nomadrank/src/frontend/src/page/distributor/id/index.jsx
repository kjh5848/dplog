import LayoutDefault from "/src/component/layout/default/Index.jsx";
import AccountFormComponent from "../../../component/AccountForm";

export default function DistributorIdPage() {
  const fields = [
    { name: "companyName", label: "업체명", readOnly: true },
    { name: "password", label: "비밀번호", type: "password", placeholder: "비밀번호 변경 시 새 비밀번호를 입력하세요." },
    { name: "tel", label: "연락처", validation: { required: "연락처는 필수 입력 항목입니다." } },
    { name: "email", label: "이메일", validation: { required: "이메일은 필수 입력 항목입니다.", pattern: /^\S+@\S+$/i } },
    { name: "deposit", label: "예금주", validation: { required: "예금주는 필수 입력 항목입니다." } },
    { name: "accountNumber", label: "계좌번호", validation: { required: "계좌번호는 필수 입력 항목입니다." } },
    { name: "bankName", label: "은행명", validation: { required: "은행명은 필수 입력 항목입니다." } },
    { name: "googleSheetUrl", label: "구글시트URL", readOnly: true }
  ];

  const fetchData = async () => {
    const response = await fetch(`/v1/distributor`);
    const dto = await response.json();
    return dto.code === 0 ? dto.data.distributor : null;
  };

  const updateData = async (data) => {
    const response = await fetch(`/v1/distributor`, {
      method: "PUT",
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ distributor: data })
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