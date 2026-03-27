"use client";

import { useEffect, useState } from "react";
import BaseModal from "@/src/components/common/Modal/BaseModal";

export interface SubscriptionDowngradeModalProps {
  isOpen: boolean;
  isProcessing?: boolean;
  currentPlanName?: string | null;
  targetPlanName: string;
  targetBillingCycleLabel: string;
  nextBillingDate?: string | null;
  onClose: () => void;
  onConfirm: (payload: { reason?: string }) => void;
}

export function SubscriptionDowngradeModal({
  isOpen,
  isProcessing = false,
  currentPlanName,
  targetPlanName,
  targetBillingCycleLabel,
  nextBillingDate,
  onClose,
  onConfirm,
}: SubscriptionDowngradeModalProps) {
  const [reason, setReason] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setReason("");
      setErrorMessage(null);
    }
  }, [isOpen]);

  const handleConfirm = () => {
    if (reason.length > 200) {
      setErrorMessage("사유는 200자 이내로 입력해주세요.");
      return;
    }

    setErrorMessage(null);
    onConfirm({ reason: reason.trim() ? reason.trim() : undefined });
  };

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="다운그레이드 예약"
      size="lg"
    >
      <div className="space-y-6">
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          <p className="font-semibold mb-1">중요 안내</p>
          <ul className="list-disc space-y-1 pl-5">
            {currentPlanName && (
              <li>
                현재 <strong>{currentPlanName}</strong> 요금제는 다음 결제일까지 그대로
                이용하실 수 있습니다.
              </li>
            )}
            <li>
              다음 결제일부터{" "}
              <strong>
                {targetPlanName} · {targetBillingCycleLabel}
              </strong>{" "}
              요금제가 적용됩니다.
            </li>
            <li>부분 환불은 제공되지 않습니다.</li>
          </ul>
          {nextBillingDate && (
            <p className="mt-3 text-xs text-amber-800">
              예정된 다음 결제일: {new Date(nextBillingDate).toLocaleDateString("ko-KR")}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="downgrade-reason"
            className="mb-2 block text-sm font-medium text-gray-700"
          >
            다운그레이드 사유 (선택 사항)
          </label>
          <textarea
            id="downgrade-reason"
            rows={4}
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            maxLength={200}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
            placeholder="서비스 개선을 위해 의견을 들려주세요. (최대 200자)"
            disabled={isProcessing}
          />
          <div className="mt-1 text-right text-xs text-gray-500">
            {reason.trim().length}/200
          </div>
        </div>

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
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            onClick={handleConfirm}
            disabled={isProcessing}
          >
            {isProcessing ? "처리 중..." : "예약하기"}
          </button>
        </div>
      </div>
    </BaseModal>
  );
}

export default SubscriptionDowngradeModal;
