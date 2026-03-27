"use client";

import { useEffect, useMemo, useState } from "react";
import BaseModal from "@/src/components/common/Modal/BaseModal";
import { SubscriptionCancelReasonCode } from "@/src/types/payment";

type CancelReasonOption = {
  code: SubscriptionCancelReasonCode;
  label: string;
  description: string;
};

const CANCEL_REASON_OPTIONS: CancelReasonOption[] = [
  {
    code: "PRICE",
    label: "가격이 부담돼요",
    description: "혜택 대비 비용이 높게 느껴집니다.",
  },
  {
    code: "USAGE_LOW",
    label: "사용 빈도가 낮아요",
    description: "최근 서비스 이용이 줄어들었어요.",
  },
  {
    code: "FEATURE_LACK",
    label: "원하는 기능이 부족해요",
    description: "필요한 기능이 없거나 만족스럽지 않아요.",
  },
  {
    code: "BUGS",
    label: "오류나 버그가 있어요",
    description: "서비스 이용 중 오류가 잦았어요.",
  },
  {
    code: "SUPPORT",
    label: "고객 지원이 불편했어요",
    description: "응대 속도나 품질이 아쉬웠어요.",
  },
  {
    code: "SWITCH",
    label: "다른 서비스를 이용하고 있어요",
    description: "대체 서비스를 사용하기로 했어요.",
  },
  {
    code: "ETC",
    label: "기타 (직접 입력)",
    description: "위 항목에 해당되지 않는 다른 사유가 있어요.",
  },
];

export interface SubscriptionCancelModalProps {
  isOpen: boolean;
  isProcessing?: boolean;
  onClose: () => void;
  onConfirm: (payload: {
    reasonCode: SubscriptionCancelReasonCode;
    reasonDetail?: string;
  }) => void;
}

export function SubscriptionCancelModal({
  isOpen,
  isProcessing = false,
  onClose,
  onConfirm,
}: SubscriptionCancelModalProps) {
  const [selectedCode, setSelectedCode] =
    useState<SubscriptionCancelReasonCode>("PRICE");
  const [reasonDetail, setReasonDetail] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setSelectedCode("PRICE");
      setReasonDetail("");
      setErrorMessage(null);
    }
  }, [isOpen]);

  const selectedOption = useMemo(
    () => CANCEL_REASON_OPTIONS.find((option) => option.code === selectedCode),
    [selectedCode]
  );

  const handleConfirm = () => {
    const detail = reasonDetail.trim();

    if (selectedCode === "ETC" && detail.length === 0) {
      setErrorMessage("기타 사유를 입력해주세요.");
      return;
    }

    if (detail.length > 0 && detail.length > 200) {
      setErrorMessage("사유는 200자 이내로 입력해주세요.");
      return;
    }

    setErrorMessage(null);
    onConfirm({
      reasonCode: selectedCode,
      reasonDetail: detail.length > 0 ? detail : undefined,
    });
  };

  return (
    <BaseModal isOpen={isOpen} onClose={onClose} title="구독 해지하기" size="lg">
      <div className="space-y-6">
        <div className="rounded-lg border border-red-100 bg-red-50 p-4 text-sm text-red-700">
          <p className="font-semibold mb-1">해지 전 꼭 확인해주세요</p>
          <ul className="list-disc space-y-1 pl-5">
            <li>구독 해지 시 예정된 자동 결제가 모두 취소됩니다.</li>
            <li>이미 결제된 금액은 환불 정책에 따라 별도 처리됩니다.</li>
            <li>필요 시 마이페이지에서 언제든지 다시 구독할 수 있습니다.</li>
          </ul>
        </div>

        <div>
          <p className="mb-3 text-sm font-medium text-gray-700">
            해지 사유를 선택해주세요 <span className="text-red-500">*</span>
          </p>
          <div className="space-y-3">
            {CANCEL_REASON_OPTIONS.map((option) => (
              <label
                key={option.code}
                className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors ${
                  selectedCode === option.code
                    ? "border-blue-400 bg-blue-50"
                    : "border-gray-200 hover:border-blue-200"
                }`}
              >
                <input
                  type="radio"
                  name="cancelReason"
                  value={option.code}
                  checked={selectedCode === option.code}
                  onChange={() => setSelectedCode(option.code)}
                  className="mt-1"
                />
                <span>
                  <span className="font-semibold text-gray-900">
                    {option.label}
                  </span>
                  <span className="mt-1 block text-sm text-gray-600">
                    {option.description}
                  </span>
                </span>
              </label>
            ))}
          </div>
        </div>

        {selectedOption?.code === "ETC" && (
          <div>
            <label
              htmlFor="cancel-reason-detail"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              자세한 해지 사유
            </label>
            <textarea
              id="cancel-reason-detail"
              rows={4}
              value={reasonDetail}
              onChange={(event) => setReasonDetail(event.target.value)}
              maxLength={200}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
              placeholder="서비스 개선을 위해 의견을 들려주세요. (최대 200자)"
            />
            <div className="mt-1 text-right text-xs text-gray-500">
              {reasonDetail.trim().length}/200
            </div>
          </div>
        )}

        {errorMessage && (
          <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {errorMessage}
          </div>
        )}

        <div className="flex justify-end gap-3 border-t border-gray-100 pt-4">
          <button
            type="button"
            className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
            onClick={onClose}
            disabled={isProcessing}
          >
            돌아가기
          </button>
          <button
            type="button"
            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
            onClick={handleConfirm}
            disabled={isProcessing}
          >
            {isProcessing ? "처리 중..." : "해지하기"}
          </button>
        </div>
      </div>
    </BaseModal>
  );
}

export default SubscriptionCancelModal;
