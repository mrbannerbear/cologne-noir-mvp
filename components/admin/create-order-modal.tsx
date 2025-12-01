'use client';

import { GSAPModal } from '@/components/shared/gsap-modal';
import { CreateOrderForm } from './create-order-form';

interface CreateOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function CreateOrderModal({ isOpen, onClose, onSuccess }: CreateOrderModalProps) {
  const handleSuccess = () => {
    onSuccess();
    onClose();
  };

  return (
    <GSAPModal
      isOpen={isOpen}
      onClose={onClose}
      title="Create New Order"
      size="xl"
    >
      <CreateOrderForm onSuccess={handleSuccess} onCancel={onClose} />
    </GSAPModal>
  );
}
