import { ref, h, render } from 'vue';
import Modal from '../components/ui/modal/Modal.vue';
import Button from '../components/ui/Button.vue';

interface ConfirmOptions {
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  confirmVariant?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  persistent?: boolean;
}

export function useModal() {
  const isOpen = ref(false);

  const open = () => {
    isOpen.value = true;
  };

  const close = () => {
    isOpen.value = false;
  };

  const confirm = (options: ConfirmOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      // Create a div to mount the modal
      const container = document.createElement('div');
      document.body.appendChild(container);

      // Create a function to clean up the modal
      const cleanup = () => {
        render(null, container);
        document.body.removeChild(container);
      };

      // Create the modal with the confirm dialog
      const modalVNode = h(
        Modal,
        {
          modelValue: true,
          'onUpdate:modelValue': (value: boolean) => {
            if (!value) {
              cleanup();
              resolve(false);
            }
          },
          title: options.title || 'Confirm',
          persistent: options.persistent,
          size: options.size || 'sm',
        },
        {
          default: () => h('p', { class: 'text-gray-700 dark:text-gray-300' }, options.message),
          footer: () => [
            h(
              Button,
              {
                variant: 'ghost',
                class: 'mr-2',
                onClick: () => {
                  cleanup();
                  resolve(false);
                },
              },
              { default: () => options.cancelText || 'Cancel' }
            ),
            h(
              Button,
              {
                variant: options.confirmVariant || 'primary',
                onClick: () => {
                  cleanup();
                  resolve(true);
                },
              },
              { default: () => options.confirmText || 'Confirm' }
            ),
          ],
        }
      );

      // Render the modal
      render(modalVNode, container);
    });
  };

  return {
    isOpen,
    open,
    close,
    confirm,
  };
}
