import React, { useState } from "react";

interface GroupAddModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (groupName: string, memo: string) => void;
  isLoading?: boolean;
  error?: Error | null;
}

export default function GroupAddModal({
  open,
  onClose,
  onSave,
  isLoading = false,
  error = null,
}: GroupAddModalProps) {
  const [groupName, setGroupName] = useState("");
  const [memo, setMemo] = useState("");

  if (!open) return null;

  return (
    <div className="bg-opacity-30 fixed inset-0 z-50 flex items-center justify-center bg-black">
      <div className="w-full max-w-sm rounded-lg bg-white p-6 shadow-lg">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">그룹 추가</h2>
          <button onClick={onClose}>&times;</button>
        </div>
        <div className="mb-4">
          <label className="mb-1 block">상품</label>
          <select className="w-full rounded border px-2 py-1" disabled>
            <option>N플레이스 순위추적</option>
          </select>
        </div>
        <div className="mb-4">
          <label className="mb-1 block">그룹명</label>
          <input
            className="w-full rounded border px-2 py-1"
            placeholder="그룹명을 입력하세요"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
          />
        </div>
        <div className="mb-4">
          <label className="mb-1 block">메모</label>
          <input
            className="w-full rounded border px-2 py-1"
            placeholder="메모를 입력하세요"
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
          />
        </div>
        {error && (
          <div className="mb-2 text-sm text-red-500">{error.message}</div>
        )}
        <div className="flex justify-end gap-2">
          <button className="rounded bg-gray-200 px-4 py-2" onClick={onClose} disabled={isLoading}>
            취소
          </button>
          <button
            className="rounded bg-blue-600 px-4 py-2 text-white"
            onClick={() => {
              onSave(groupName, memo);
              onClose();
            }}
            disabled={!groupName || isLoading}
          >
            {isLoading ? "저장 중..." : "저장"}
          </button>
        </div>
      </div>
    </div>
  );
};
