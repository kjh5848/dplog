import React from 'react';

interface KeywordSidebarProps {
  shopName: string | undefined;
  keywords: string[];
  selectedKeyword: string | null;
  isLoading: boolean;
  onSelectKeyword: (keyword: string) => void;
}

export default function KeywordSidebar({
  shopName,
  keywords,
  selectedKeyword,
  isLoading,
  onSelectKeyword
}: KeywordSidebarProps) {
  return (
    <div className="card-keyword flex flex-col h-full">
      <div className="border-b border-primary-100 p-4 flex-none">
        <h2 className="text-lg font-medium text-gray-900">{shopName || '상점'} 키워드</h2>
      </div>
      
      <div className="flex-grow overflow-y-auto p-2">
        {isLoading ? (
          <div className="flex h-40 items-center justify-center">
            <div className="h-6 w-6 animate-spin rounded-full border-4 border-primary-500 border-t-transparent"></div>
            <span className="ml-2 text-gray-500">키워드 로딩 중...</span>
          </div>
        ) : keywords.length === 0 ? (
          <div className="flex h-40 items-center justify-center text-gray-500">
            키워드가 없습니다.
          </div>
        ) : (
          <ul className="divide-y divide-primary-100">
            {keywords.map((keyword) => (
              <li key={keyword}>
                <button
                  type="button"
                  className={`w-full rounded-md px-3 py-2 text-left text-sm transition-colors ${
                    selectedKeyword === keyword
                      ? 'bg-primary-50 text-primary-600 font-medium'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                  onClick={() => onSelectKeyword(keyword)}
                >
                  {keyword}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};
