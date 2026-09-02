export const activityLogModules = ["Campaign", "Partner", "Activity", "Lead"] as const;
export const activityLogTypes = ["Created", "Updated", "Status Changed", "Deleted"] as const;

export type ActivityLogModule = (typeof activityLogModules)[number];
export type ActivityLogType = (typeof activityLogTypes)[number];

export type ActivityLogEntry = {
  id: number;
  action: string;
  module: ActivityLogModule;
  description: string;
  user: string;
  timestamp: string;
  type: ActivityLogType;
};
