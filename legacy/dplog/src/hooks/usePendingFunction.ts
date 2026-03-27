"use client"

import { useDeferredValue, useEffect, useMemo, useRef, useState } from "react";

/**
 * 함수를 실행하고, 대기 상태 및 결과를 반환하는 Hook.
 * 성능 최적화를 위해 지연로딩을 사용한다.
 * result는 리턴이 있는 동기함수에만 적용된다.
 * 비동기함수는 async 비동기 작업에 await를 꼭 사용해서 함수를 매개변수로 넘겨야 한다. (그러지 않으면 바로 리턴되기 때문에 대기 상태가 되지 않는다.)
 * 스타터나 엔더를 동작시킬때 !boolean을 사용하지 않는 이유는, 작동하지 않는 경우가 있기 때문이다.
 * @param func 실행할 함수
 * @param msDelay 함수 실행 지연 시간
 * @returns [trigger, isPending, result] 트리거 함수, 대기 상태, 결과
 */
function usePendingFunction<T, P = any>(
  func: (props?: P) => T | Promise<T>,
  msDelay: number = 0
): [
  (props?: P) => void, // trigger 함수
  boolean, // isPending 상태
  T | undefined // result 값
] {
  // state들을 동작시키기 위한 트리거
  const get_num = (): number => {
    return Date.now() + Math.random();
  };
  // 함수의 매개변수를 저장하기 위한 변수 (trigger 함수 실행 시 props로 받은 값을 저장한다.)
  const propsRef = useRef<P | undefined>(undefined);

  // 함수가 실행되고 있는지 여부
  const [isPending, setIsPending] = useState<boolean>(false);

  // 대기 상태 시작 트리거
  const [pendingStarter, setPendingStarter] = useState<number>(0);

  // 대기 상태 종료 트리거
  const [pendingEnder, setPendingEnder] = useState<number>(0);

  // useMemo를 실행하기 위한 트리거
  // 초기값은 0 / 이후 값은 get_num()으로 동작시킨다.
  const [memoStarter, setMemoStarter] = useState<number>(0);

  // 지연로딩을 위한 Hook
  // memoStarter를 지연로딩하기 위해 deferredMemoStarter를 사용한다.
  const deferredMemoStarter = useDeferredValue(memoStarter);

  // pending 상태 동안 입력이 있는지 체크하기 위한 변수
  const [pendingInput, setPendingInput] = useState<number>(0);

  // 매개변수로 받은 함수 실행을 위해 리턴할 트리거 함수
  const trigger = (props?: P): void => {
    propsRef.current = props;
    setPendingStarter(() => get_num());
  };

  // 처음 실행될 때, memoStarter를 0으로 변경한다.
  // pendingStarter가 동작하면, isPending를 true로 변경하고, memoStarter를 동작시킨다.
  useEffect(() => {
    if (memoStarter === 0) {
      setMemoStarter(() => get_num());
    } else if (!isPending) {
      setIsPending(() => true);
      setPendingInput(() => 0);
      setMemoStarter(() => get_num());
    } else {
      setPendingInput((prev) => prev + 1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingStarter]);

  // 지연로딩된 deferredMemoStarter가 동작하면, 함수를 실행한다.
  // pending 상태가 아닐 경우, 함수를 실행하지 않는다.
  // func 매개변수가 함수가 아닐 경우, 에러를 발생시킨다.
  // 함수가 완료되면 pendingEnder를 동작시킨다.
  const result = useMemo<T | undefined>(() => {
    if (!isPending) return undefined;
    if (!(typeof func === "function")) {
      throw new Error("func must be a function");
    }
    const funcResult = func(propsRef.current);
    if (funcResult instanceof Promise) {
      funcResult.finally(() => {
        propsRef.current = undefined;
        setPendingEnder(() => get_num());
      });
      return undefined;
    } else {
      setPendingEnder(() => get_num());
      return funcResult;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deferredMemoStarter]);

  // pendingEnder가 동작하면, isPending를 false로 변경한다.
  useEffect(() => {
    if (isPending) {
      setTimeout(() => {
        setIsPending(() => false);
      }, msDelay);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingEnder]);

  // pending 동안 입력이 있으면 다시 입력받은 함수를 실행한다.
  useEffect(() => {
    if (!isPending && pendingInput > 0) {
      setPendingInput(() => 0);
      setPendingStarter(() => get_num());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPending]);

  // startFunc으로 함수를 실행하고, isPending으로 대기상태를 확인하고, result로 결과를 확인할 수 있다.
  return [trigger, isPending, result];
}

export default usePendingFunction;
