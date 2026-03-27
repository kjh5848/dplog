'use client';

import { useState } from "react";

function useSearchStoreLocal() {
  const [searchValue, setSearchValue] = useState("");

  return { searchValue, setSearchValue };
}

export default useSearchStoreLocal;