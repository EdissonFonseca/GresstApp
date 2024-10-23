import { EventEmitter } from "@angular/core";

export interface Card {
  id: string;
  title: string;
  status: string;
  type: string;

  actionName?: string | undefined;
  description?: string | undefined | null;
  iconName?: string | undefined | null;
  iconSource?: string | undefined | null;
  parentId?: string | null | undefined;
  pendingItems?: number | null | undefined;
  quantity?: number | null | undefined;
  rejectedItems?: number | null | undefined;
  successItems?: number | null | undefined;
  volume?: number | null | undefined;
  weight?: number | null | undefined;

  color?: string | undefined | null;
  summary?: string | undefined | null;
  showAction?: boolean | undefined | null;
  showApprove?: boolean | undefined | null;
  showReject?: boolean | undefined | null;
  showItems?: boolean | undefined | null;
  showSummary?: boolean | undefined | null;
}
