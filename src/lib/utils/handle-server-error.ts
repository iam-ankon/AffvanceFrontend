'use client';

import { AxiosError } from 'axios';
import { toast } from 'sonner';

export function handleServerError(error: unknown) {
  // Only show a toast for errors not handled specifically in QueryProvider.onError
  let skipToast = false;
  let status: number | undefined;

  if (error && typeof error === 'object') {
    // Check for both status and code
    const errObj = error as { status?: unknown; code?: unknown };
    if ('status' in errObj && errObj.status !== undefined) {
      status = typeof errObj.status === 'number' ? errObj.status : Number(errObj.status);
    } else if ('code' in errObj && errObj.code !== undefined) {
      status = typeof errObj.code === 'number' ? errObj.code : Number(errObj.code);
    }
  }
  if (error instanceof AxiosError) {
    status = status ?? error.response?.status ?? error.response?.data?.code;
  }

  // Skip toast for handled statuses
  if (typeof status === 'number' && [401, 403, 500, 304].includes(status)) {
    skipToast = true;
  }

  if (!skipToast) {
    let errMsg = 'Something went wrong!';
    if (status === 204) {
      errMsg = 'Content not found.';
    } else if (error instanceof AxiosError) {
      errMsg = error.response?.data?.title || errMsg;
    }
    toast.error(errMsg);
  }
}
