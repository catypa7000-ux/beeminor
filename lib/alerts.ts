/**
 * Web-compatible alert utilities
 * Replaces React Native Alert.alert with browser-native alerts
 */

export const showAlert = (title: string, message?: string) => {
  const fullMessage = message ? `${title}\n\n${message}` : title;
  window.alert(fullMessage);
};

export const showConfirm = (
  title: string,
  message: string,
  onConfirm: () => void,
  onCancel?: () => void
) => {
  const fullMessage = `${title}\n\n${message}`;
  const confirmed = window.confirm(fullMessage);
  
  if (confirmed) {
    onConfirm();
  } else if (onCancel) {
    onCancel();
  }
};
