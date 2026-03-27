'use client';

import { useState, useCallback } from 'react';
import type { StoreCreateRequest, StoreUpdateRequest, Store } from './types';
import * as storeApi from '../api/storeApi';
import { ApiError } from '@/shared/api';

/**
 * 가게 등록/수정 폼 ViewModel
 *
 * 폼 상태 관리, 유효성 검사, API 호출을 캡슐화합니다.
 */

/** 폼 유효성 검사 에러 */
interface FormErrors {
  name?: string;
  category?: string;
  address?: string;
  placeUrl?: string;
  phone?: string;
}

/** 폼 상태 */
interface StoreFormState {
  name: string;
  category: string;
  address: string;
  placeUrl: string;
  phone: string;
}

const INITIAL_FORM_STATE: StoreFormState = {
  name: '',
  category: '',
  address: '',
  placeUrl: '',
  phone: '',
};

export function useStoreForm(initialData?: Store) {
  const [form, setForm] = useState<StoreFormState>(
    initialData
      ? {
          name: initialData.name,
          category: initialData.category,
          address: initialData.address,
          placeUrl: initialData.placeUrl ?? '',
          phone: initialData.phone ?? '',
        }
      : INITIAL_FORM_STATE,
  );

  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  /** 개별 필드 업데이트 */
  const updateField = useCallback(
    (field: keyof StoreFormState, value: string) => {
      setForm((prev) => ({ ...prev, [field]: value }));
      // 입력 시 해당 필드 에러 초기화
      setErrors((prev) => ({ ...prev, [field]: undefined }));
      setApiError(null);
    },
    [],
  );

  /** 클라이언트 유효성 검사 */
  const validate = useCallback((): boolean => {
    const newErrors: FormErrors = {};

    if (!form.name.trim()) {
      newErrors.name = '가게명은 필수입니다.';
    } else if (form.name.length > 100) {
      newErrors.name = '가게명은 100자 이내여야 합니다.';
    }

    if (!form.category.trim()) {
      newErrors.category = '카테고리를 선택해주세요.';
    }

    if (!form.address.trim()) {
      newErrors.address = '주소는 필수입니다.';
    } else if (form.address.length > 300) {
      newErrors.address = '주소는 300자 이내여야 합니다.';
    }

    if (form.placeUrl && form.placeUrl.length > 500) {
      newErrors.placeUrl = '플레이스 URL은 500자 이내여야 합니다.';
    }

    if (form.phone && form.phone.length > 20) {
      newErrors.phone = '전화번호는 20자 이내여야 합니다.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [form]);

  /** 가게 등록 */
  const submitCreate = useCallback(async (): Promise<Store | null> => {
    if (!validate()) return null;
    setIsLoading(true);
    setApiError(null);

    try {
      const request: StoreCreateRequest = {
        name: form.name.trim(),
        category: form.category.trim(),
        address: form.address.trim(),
        placeUrl: form.placeUrl.trim() || undefined,
        phone: form.phone.trim() || undefined,
      };
      const store = await storeApi.createStore(request);
      return store;
    } catch (error) {
      if (error instanceof ApiError) {
        // 백엔드 400 에러의 details 필드를 폼 에러에 매핑
        if (error.details) {
          const fieldErrors: FormErrors = {};
          for (const [field, message] of Object.entries(error.details)) {
            if (field in form) {
              fieldErrors[field as keyof FormErrors] = message;
            }
          }
          setErrors(fieldErrors);
        }
        setApiError(error.message);
      } else {
        setApiError(
          error instanceof Error ? error.message : '가게 등록에 실패했습니다.',
        );
      }
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [form, validate]);

  /** 가게 수정 */
  const submitUpdate = useCallback(
    async (storeId: number): Promise<Store | null> => {
      if (!validate()) return null;
      setIsLoading(true);
      setApiError(null);

      try {
        const request: StoreUpdateRequest = {
          name: form.name.trim(),
          category: form.category.trim(),
          address: form.address.trim(),
          placeUrl: form.placeUrl.trim() || undefined,
          phone: form.phone.trim() || undefined,
        };
        const store = await storeApi.updateStore(storeId, request);
        return store;
      } catch (error) {
        if (error instanceof ApiError) {
          if (error.details) {
            const fieldErrors: FormErrors = {};
            for (const [field, message] of Object.entries(error.details)) {
              if (field in form) {
                fieldErrors[field as keyof FormErrors] = message;
              }
            }
            setErrors(fieldErrors);
          }
          setApiError(error.message);
        } else {
          setApiError(
            error instanceof Error
              ? error.message
              : '가게 수정에 실패했습니다.',
          );
        }
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [form, validate],
  );

  /** 폼 초기화 */
  const resetForm = useCallback(() => {
    setForm(INITIAL_FORM_STATE);
    setErrors({});
    setApiError(null);
  }, []);

  return {
    form,
    errors,
    isLoading,
    apiError,
    updateField,
    validate,
    submitCreate,
    submitUpdate,
    resetForm,
  };
}
