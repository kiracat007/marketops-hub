export const activityTypes = ["Event", "Exhibition", "Field Demo", "Webinar", "Roadshow", "Product Launch", "Offline Promotion", "Other"] as const;
export const activityStatuses = ["Planning", "Confirmed", "Completed", "Cancelled"] as const;

export type ActivityType = (typeof activityTypes)[number];
export type ActivityStatus = (typeof activityStatuses)[number];

export type Activity = {
  id: number;
  name: string;
  type: ActivityType;
  campaign: string;
  partner: string;
  owner: string;
  location: string;
  startDate: string;
  endDate: string;
  status: ActivityStatus;
  expectedAttendees: number;
  actualAttendees: number;
  budget: number;
};

export type ActivityDraft = Omit<Activity, "id">;
