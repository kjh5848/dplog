import { useEffect, useState } from "react";
import usePendingFunction from "/src/use/usePendingFunction.jsx";

const AuthStore = () => {
  const [loginUser, setLoginUser] = useState(undefined);

  const [authTrigger] = usePendingFunction(async () => {
    const dto = await fetch(`/v1/auth/info`, {
      method: "GET"
    }).then((response) => response.json());
    if (dto.code !== 0) {
      setLoginUser(null);
      return;
    }
    setLoginUser(dto.data);
  });

  useEffect(() => {
    if (loginUser === undefined) {
      authTrigger();
    }
  }, [loginUser]);

  return {
    loginUser,
    setLoginUser
  };
};

export default AuthStore;
