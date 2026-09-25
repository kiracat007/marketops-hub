export const taskTypes = ["Follow-up","Call","Email","Meeting","Preparation","Other"] as const;
export const taskStatuses = ["Open","In Progress","Completed","Cancelled"] as const;
export const taskPriorities = ["Low","Medium","High"] as const;
export type TaskType=(typeof taskTypes)[number]; export type TaskStatus=(typeof taskStatuses)[number]; export type TaskPriority=(typeof taskPriorities)[number];
export type Task={id:string;title:string;description:string;type:TaskType;status:TaskStatus;priority:TaskPriority;owner:string;dueAt:string;leadId:string;opportunityId:string;campaignId:string;activityId:string;createdAt:string;updatedAt:string;completedAt:string;};
export type TaskDraft=Omit<Task,"id"|"createdAt"|"updatedAt"|"completedAt"> & {completedAt?:string};
