import ActivityLogModel from './activityLog.model';
import { TActionType, TRefModel } from './activityLog.interface';
import { Types } from 'mongoose';

// reusable helper — সব জায়গা থেকে call করা যাবে
export const createActivityLog = async ({
  action,
  description,
  performedBy,
  refModel,
  refId,
  metadata,
}: {
  action: TActionType;
  description: string;
  performedBy?: Types.ObjectId;
  refModel?: TRefModel;
  refId?: Types.ObjectId;
  metadata?: Record<string, unknown>;
}) => {
  await ActivityLogModel.create({
    action,
    description,
    performedBy,
    refModel,
    refId,
    metadata,
  });
};

// dashboard + activity feed এর জন্য
const getActivityLogsFromDB = async (query: {
  limit?: string;
  action?: string;
  refModel?: string;
  refId?: string;
}) => {
  const filter: Record<string, unknown> = {};

  if (query.action) filter.action = query.action;
  if (query.refModel) filter.refModel = query.refModel;
  if (query.refId) filter.refId = new Types.ObjectId(query.refId);

  const limit = Math.min(Number(query.limit) || 10, 50);

  const logs = await ActivityLogModel.find(filter)
    .populate('performedBy', 'name email')
    .sort({ createdAt: -1 })
    .limit(limit);

  return logs;
};

export const ActivityLogService = {
  getActivityLogsFromDB,
};