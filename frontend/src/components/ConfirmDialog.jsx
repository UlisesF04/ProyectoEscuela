import { useRef } from 'react';
import {
  AlertDialog,
  AlertDialogOverlay,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogBody,
  AlertDialogFooter,
  Button,
} from '@chakra-ui/react';

export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirmar',
  message = '¿Está seguro?',
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  confirmColorScheme = 'red',
  isLoading = false,
}) {
  const cancelRef = useRef();

  return (
    <AlertDialog
      isOpen={isOpen}
      leastDestructiveRef={cancelRef}
      onClose={onClose}
    >
      <AlertDialogOverlay />
      <AlertDialogContent>
        <AlertDialogHeader fontFamily="heading" fontSize="lg">
          {title}
        </AlertDialogHeader>
        <AlertDialogBody>
          {message}
        </AlertDialogBody>
        <AlertDialogFooter>
          <Button ref={cancelRef} variant="ghost" onClick={onClose} isDisabled={isLoading}>
            {cancelText}
          </Button>
          <Button
            colorScheme={confirmColorScheme}
            onClick={onConfirm}
            ml={3}
            isLoading={isLoading}
          >
            {confirmText}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
