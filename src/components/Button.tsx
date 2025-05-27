'use client';
import { ModalKey, useModalStore } from '../store/useModalStore';
import { ReactNode } from 'react';
import Tooltip from './Tooltip';
import clsx from 'clsx';
import {
  ArchiveRestore,
  ClipboardList,
  Copy,
  Download,
  Grid2x2Plus,
  ListFilter,
  Loader2,
  LucideIcon,
  Minus,
  Package,
  PaintBucket,
  Plus,
  Send,
  SquarePen,
  Trash2,
  Upload,
} from 'lucide-react';

// USO DEL COMPONENTE BUTTON:
// <Button
//   modalKey="modalIdentifier"    apre una modale tramite lo store
//   onClick={handleClick}          gestisce azioni personalizzate al click
//   variant="primary"              stili disponibili: primary, secondary, danger, outline, ghost, toolbar
//   type="button"                  tipo HTML: button, submit, reset
//   isLoading={true}               mostra spinner e disabilita il bottone
//   disabled={true}                disabilita il bottone manualmente
//   icon={Plus}                    componente icona React da mostrare a sinistra
//   iconName="plus"                chiave per selezionare l’icona dalla mappa interna
//   className="..."                classi Tailwind extra
//   tooltip="testo tooltip"        mostra tooltip al passaggio del mouse se non ci sono children
// >
//   Testo del bottone
// </Button>

type Variant = 'primary' | 'secondary' | 'danger' | 'outline' | 'ghost' | 'toolbar';
type IconName =
  | 'plus'
  | 'minus'
  | 'paintBucket'
  | 'send'
  | 'package'
  | 'archiveRestore'
  | 'copy'
  | 'trash'
  | 'edit'
  | 'clipboard'
  | 'filter'
  | 'loadin'
  | 'loadout'
  | 'loadnew';

interface ButtonProps {
  children?: ReactNode;
  modalKey?: ModalKey;
  onClick?: () => void; // FORSE DA CAMBIARE IN FUTURO
  variant?: Variant;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
  isLoading?: boolean;
  disabled?: boolean;
  icon?: LucideIcon;
  iconName?: IconName;
  iconClass?: string;
  tooltip?: string;
}

export default function Button({
  children,
  modalKey,
  onClick,
  variant = 'primary',
  className,
  type = 'button',
  isLoading = false,
  disabled = false,
  icon: Icon,
  iconName,
  iconClass,
  tooltip,
}: ButtonProps) {
  const openModal = useModalStore((state) => state.openModal);
  const baseStyles = 'flex flex-row items-center gap-2 rounded-lg text-lg font-medium transition-colors duration-200 relative';

  const variantStyles: Record<Variant, string> = {
    primary: 'bg-[var(--bg-btn-primary)] text-[var(--text-btn-primary)] hover:bg-[var(--hover-btn-primary)] px-3 py-2',
    secondary: 'bg-[var(--bg-btn-secondary)] text-[var(--text-btn-secondary)] hover:bg-[var(--hover-btn-secondary)] px-3 py-2',
    danger: 'bg-[var(--bg-btn-danger)] text-[var(--text-btn-danger)] hover:bg-[var(--hover-btn-danger)] px-3 py-2',
    outline: 'border text-[var(--text-btn-outline)] hover:bg-[var(--hover-btn-outline)] border-[var(--border-btn-outline)] px-3 py-2',
    ghost: 'bg-transparent text-[var(--text-btn-ghost)] hover:bg-[var(--hover-btn-ghost)] px-3 py-2',
    toolbar: 'bg-transparent',
  };

  const iconsMap: Record<IconName, LucideIcon> = {
    plus: Plus,
    minus: Minus,
    paintBucket: PaintBucket,
    send: Send,
    package: Package,
    archiveRestore: ArchiveRestore,
    copy: Copy,
    trash: Trash2,
    edit: SquarePen,
    clipboard: ClipboardList,
    filter: ListFilter,
    loadin: Download,
    loadout: Upload,
    loadnew: Grid2x2Plus,
  };

  const handleClick = () => {
    if (disabled || isLoading) return;
    if (onClick) {
      onClick();
    } else if (modalKey) {
      openModal(modalKey);
    }
  };

  // Se è specificato iconName e mappa contiene la chiave, usalo; altrimenti usa Icon
  const IconComponent = iconName && iconsMap[iconName] ? iconsMap[iconName] : Icon;

  const buttonElement = (
    <button
      type={type}
      className={clsx(baseStyles, variantStyles[variant], className, {
        'opacity-50 cursor-not-allowed': isLoading || disabled,
        'cursor-pointer': !(isLoading || disabled),
      })}
      onClick={handleClick}
      disabled={disabled || isLoading}
    >
      {isLoading && <Loader2 className="animate-spin w-5 h-5" />}
      {!isLoading && IconComponent && <IconComponent className={clsx(iconClass) ?? 'size-5'} />}
      {children}
    </button>
  );

  if (!children && tooltip) {
    return <Tooltip tooltip={tooltip}>{buttonElement}</Tooltip>;
  }

  return buttonElement;
}
