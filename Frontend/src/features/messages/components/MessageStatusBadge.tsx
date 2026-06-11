import type { MessageStatus } from '../../../shared/types';

const STATUS_CONFIG: Record<
  MessageStatus,
  { labelKey: string; className: string }
> = {
  queued: {
    labelKey: 'chat.status.queued',
    className: 'bg-slate-100 text-slate-600',
  },
  processing: {
    labelKey: 'chat.status.processing',
    className: 'bg-amber-100 text-amber-700',
  },
  sent: {
    labelKey: 'chat.status.sent',
    className: 'bg-blue-100 text-blue-700',
  },
  delivered: {
    labelKey: 'chat.status.delivered',
    className: 'bg-green-100 text-green-700',
  },
  read: {
    labelKey: 'chat.status.read',
    className: 'bg-green-100 text-green-800',
  },
  failed: {
    labelKey: 'chat.status.failed',
    className: 'bg-red-100 text-red-700',
  },
};

interface MessageStatusBadgeProps {
  status: MessageStatus;
  label: string;
}

export function MessageStatusBadge({ status, label }: MessageStatusBadgeProps) {
  const config = STATUS_CONFIG[status];

  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${config.className}`}
    >
      {label}
    </span>
  );
}

export { STATUS_CONFIG };
