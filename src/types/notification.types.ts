export type NotificationType = "notification" | "warning";

export interface NotificationData {
  id: string;
  type: NotificationType;
  title: string;
  text: string;
  read?: boolean;
}

export interface NotificationState {
  maintenance: boolean;
  notifications: NotificationData[];
}
