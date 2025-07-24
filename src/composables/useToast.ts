import {type ToastProps } from '../components/ui/toast/Toast.vue';

type ToastOptions = Omit<ToastProps, 'id'>;

const TOAST_EVENT = 'toast-event';

export function useToast() {
  const toast = (options: ToastOptions) => {
    const event = new CustomEvent(TOAST_EVENT, {
      detail: {
        type: 'add',
        toast: options,
      },
    });
    window.dispatchEvent(event);
  };

  const success = (message: string, options?: Partial<Omit<ToastOptions, 'message' | 'type'>>) => {
    toast({
      type: 'success',
      message,
      ...options,
    });
  };

  const error = (message: string, options?: Partial<Omit<ToastOptions, 'message' | 'type'>>) => {
    toast({
      type: 'error',
      message,
      ...options,
    });
  };

  const warning = (message: string, options?: Partial<Omit<ToastOptions, 'message' | 'type'>>) => {
    toast({
      type: 'warning',
      message,
      ...options,
    });
  };

  const info = (message: string, options?: Partial<Omit<ToastOptions, 'message' | 'type'>>) => {
    toast({
      type: 'info',
      message,
      ...options,
    });
  };

  const clearAll = () => {
    const event = new CustomEvent(TOAST_EVENT, {
      detail: {
        type: 'clear',
      },
    });
    window.dispatchEvent(event);
  };

  return {
    toast,
    success,
    error,
    warning,
    info,
    clearAll,
  };
}
