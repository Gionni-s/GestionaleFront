import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from './ui/dialog';
import { Button } from './ui/button';
import { CircleHelp } from 'lucide-react';
import { t } from 'i18next';

/**
 * Props per il componente Modal.
 * @typedef {Object} ModalProps
 * @property {React.ReactNode} children - Il contenuto da visualizzare all'interno del modal.
 * @property {string} [className] - Classi CSS opzionali da applicare al pulsante trigger.
 * @property {() => void} [onOpen] - Funzione da eseguire quando il modal viene aperto.
 * @property {() => void | Promise<void>} onSave - Funzione da eseguire quando viene premuto il pulsante di salvataggio.
 * @property {() => void} [onCancel] - Funzione opzionale da eseguire quando viene premuto il pulsante di annullamento o il modal viene chiuso.
 * @property {string} [title] - Titolo del modal, predefinito a "settings" tradotto.
 * @property {string} [triggerText] - Testo del pulsante trigger, predefinito a "settings" tradotto.
 * @property {string} [saveText] - Testo del pulsante di salvataggio, predefinito a "saveSettings" tradotto.
 * @property {string} [cancelText] - Testo del pulsante di annullamento, predefinito a "cancel" tradotto.
 * @property {boolean} [showCancelButton] - Se mostrare il pulsante di annullamento, predefinito a true.
 * @property {React.ReactNode} [icon] - Icona da visualizzare nel pulsante trigger, predefinito a CircleHelp.
 */
type ModalProps = {
  children: React.ReactNode;
  className?: string;
  onOpen?: () => void;
  onSave: () => void | Promise<void>;
  onCancel?: () => void;
  title?: string;
  triggerText?: string;
  saveText?: string;
  cancelText?: string;
  isEdit?: string;
  editText?: string;
  showCancelButton?: boolean;
  icon?: React.ReactNode;
};

/**
 * Componente Modal personalizzabile per visualizzare contenuto in un dialog.
 *
 * Il componente fornisce un pulsante trigger che, quando cliccato, mostra un dialog modale
 * con intestazione, contenuto e pulsanti di azione (salva e opzionalmente annulla).
 *
 * @param {ModalProps} props - Le proprietà del componente
 * @returns {JSX.Element} Il componente Modal renderizzato
 *
 * @example
 * // Modal base con contenuto personalizzato
 * <Modal onSave={() => console.log('Salvato')}>
 *   <p>Contenuto del modal</p>
 * </Modal>
 *
 * @example
 * // Modal completamente personalizzato
 * <Modal
 *   className="bg-blue-500"
 *   onOpen={() => fetchData()}
 *   onSave={handleSave}
 *   onCancel={handleCancel}
 *   title="Impostazioni Avanzate"
 *   triggerText="Apri Impostazioni"
 *   saveText="Applica"
 *   cancelText="Chiudi"
 *   showCancelButton={true}
 *   icon={<Settings className="h-4 w-4 mr-2" />}
 * >
 *   <SettingsForm />
 * </Modal>
 */
const Modal: React.FC<ModalProps> = ({
  children,
  className = '',
  onOpen = () => {},
  onSave,
  onCancel,
  title = t('add'),
  triggerText = t('add'),
  saveText = t('save'),
  cancelText = t('cancel'),
  showCancelButton = true,
  isEdit = '',
  editText = t('edit'),
  icon = <CircleHelp className="mr-2 h-4 w-4" />,
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isEdit) {
      setModalVisible(true);
    }
  }, [isEdit]);

  const handleOpen = () => {
    if (onOpen) onOpen();
  };

  /**
   * Gestisce l'azione di annullamento e chiude il modal.
   */
  const handleCancel = () => {
    if (onCancel) onCancel();
    setModalVisible(false);
  };

  /**
   * Gestisce l'azione di salvataggio, supportando anche Promise.
   * Mostra uno stato di caricamento durante l'esecuzione di azioni asincrone.
   */
  const handleSave = async () => {
    try {
      setIsSaving(true);
      const result = onSave();

      // Gestisci il caso in cui onSave restituisca una Promise
      if (result instanceof Promise) {
        await result;
      }

      setModalVisible(false);
    } catch (error) {
      console.error('Errore durante il salvataggio:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog
      open={modalVisible}
      onOpenChange={(open) => {
        setModalVisible(open);
        if (!open && onCancel) onCancel();
      }}
    >
      <DialogTrigger asChild>
        <Button onClick={handleOpen} className={className}>
          {icon}
          {triggerText}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <div className="py-4">{children}</div>

        <DialogFooter className="flex flex-col sm:flex-row gap-2">
          {showCancelButton && (
            <Button
              variant="outline"
              className="w-full sm:w-auto"
              onClick={handleCancel}
              disabled={isSaving}
            >
              {cancelText}
            </Button>
          )}
          <Button
            className="w-full sm:w-auto"
            onClick={handleSave}
            disabled={isSaving}
          >
            {isEdit
              ? isSaving
                ? t('saving', 'Salvataggio in corso...')
                : editText
              : isSaving
              ? t('saving', 'Salvataggio in corso...')
              : saveText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default Modal;
