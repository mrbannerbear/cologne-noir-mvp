'use client';

import { GSAPModal } from '@/components/shared/gsap-modal';
import { CreateCustomerForm } from './create-customer-form';

interface CreateCustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function CreateCustomerModal({ isOpen, onClose, onSuccess }: CreateCustomerModalProps) {
  const handleSuccess = () => {
    onSuccess();
    onClose();
  };

  return (
    <GSAPModal
      isOpen={isOpen}
      onClose={onClose}
      title="Create New Customer"
      size="lg"
    >
      <CreateCustomerForm onSuccess={handleSuccess} onCancel={onClose} />
    </GSAPModal>
  );
}
