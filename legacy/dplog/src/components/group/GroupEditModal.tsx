import { TrackGroup } from "@/src/types/group";
import { useForm } from "react-hook-form";

interface TrackGroupProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  groupList: TrackGroup[];
}

export default function GroupEditModal({
  isOpen,
  onClose,
  onSubmit,
  groupList,
}: TrackGroupProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div
        className="bg-opacity-50 fixed inset-0 bg-black transition-opacity"
        onClick={onClose}
      ></div>
      <div className="flex min-h-full items-center justify-center p-4 text-center">
        <div className="relative w-full max-w-lg transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className="mt-3 w-full text-center sm:mt-0 sm:ml-4 sm:text-left">
                <h3 className="mb-4 text-lg leading-6 font-semibold text-gray-900">
                  그룹 변경
                </h3>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div>
                    <label
                      htmlFor="group"
                      className="mb-1 block text-sm font-medium text-gray-700"
                    >
                      그룹
                    </label>
                    <select
                      {...register("id", { required: "그룹을 선택하세요" })}
                      className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-xs ring-1 ring-gray-300 ring-inset focus:ring-2 focus:ring-indigo-600 focus:ring-inset sm:text-sm sm:leading-6"
                    >
                      {groupList.map((group) => (
                        <option key={group.id} value={group.id}>
                          {group.groupName}
                        </option>
                      ))}
                    </select>
                    {errors.id && (
                      <p className="mt-1 text-sm text-red-600">
                        {typeof errors.id.message === "string"
                          ? errors.id.message
                          : "그룹을 선택하세요"}
                      </p>
                    )}
                  </div>
                  <div className="mt-5 gap-2 sm:mt-4 sm:flex sm:flex-row-reverse">
                    <button
                      type="submit"
                      className="inline-flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 sm:w-auto"
                    >
                      변경
                    </button>
                    <button
                      type="button"
                      onClick={onClose}
                      className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-xs ring-1 ring-gray-300 ring-inset hover:bg-gray-50 sm:mt-0 sm:w-auto"
                    >
                      취소
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 