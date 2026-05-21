import { softDeleteFilter } from "@/lib/soft-delete";

export abstract class BaseService {
  protected readonly activeFilter = softDeleteFilter;
}
