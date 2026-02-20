export interface NotificationData {
  type: string;
  title: string;
  text: string;
}

export interface NotificationState {
  maintenance: boolean;
  notifications: NotificationData[];
}
