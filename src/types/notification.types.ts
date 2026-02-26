export interface NotificationData {
  id: string;
  type: string;
  title: string;
  text: string;
  read?: boolean;
}

export interface NotificationState {
  maintenance: boolean;
  notifications: NotificationData[];
}
