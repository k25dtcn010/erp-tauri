export interface MidDayLeaveRequest {
  id: string;
  employeeId: string;
  date: string; // yyyy-MM-dd
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  totalHours: number;
  reason: string;
  status: "pending" | "approved" | "rejected" | "cancelled";
  type: string;
  createdAt: string;
}

export class MidDayLeaveService {
  private static STORAGE_KEY = "midDayLeaveRequests";

  /**
   * Get all mid-day leave requests for current employee
   */
  static getMidDayLeaveRequests(): MidDayLeaveRequest[] {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      if (!data) return [];

      const requests = JSON.parse(data) as MidDayLeaveRequest[];
      const employeeId = localStorage.getItem("cached_employeeId") || "";

      // Filter by current employee
      return requests.filter(req => req.employeeId === employeeId);
    } catch (error) {
      console.error("Failed to get mid-day leave requests", error);
      return [];
    }
  }

  /**
   * Get recent mid-day leave requests (last 5)
   */
  static getRecentRequests(limit = 5): MidDayLeaveRequest[] {
    const requests = this.getMidDayLeaveRequests();
    return requests
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit);
  }

  /**
   * Get pending mid-day leave requests count
   */
  static getPendingCount(): number {
    const requests = this.getMidDayLeaveRequests();
    return requests.filter(req => req.status === "pending").length;
  }

  /**
   * Convert mid-day leave to LeaveRequest format for display
   */
  static convertToLeaveRequest(midDayRequest: MidDayLeaveRequest) {
    return {
      id: midDayRequest.id,
      startDate: midDayRequest.date,
      endDate: midDayRequest.date,
      type: `${midDayRequest.type} (${midDayRequest.startTime} - ${midDayRequest.endTime})`,
      status: midDayRequest.status,
      days: parseFloat((midDayRequest.totalHours / 8).toFixed(2)), // Convert hours to days
      policyName: midDayRequest.type,
      reason: midDayRequest.reason,
    };
  }

  /**
   * Get all requests in LeaveRequest format
   */
  static getAllAsLeaveRequests() {
    const requests = this.getMidDayLeaveRequests();
    return requests.map(req => this.convertToLeaveRequest(req));
  }

  /**
   * Delete a mid-day leave request
   */
  static deleteRequest(id: string): boolean {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      if (!data) return false;

      const requests = JSON.parse(data) as MidDayLeaveRequest[];
      const filtered = requests.filter(req => req.id !== id);

      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filtered));
      return true;
    } catch (error) {
      console.error("Failed to delete mid-day leave request", error);
      return false;
    }
  }

  /**
   * Clear all mid-day leave requests (for testing)
   */
  static clearAll(): void {
    localStorage.removeItem(this.STORAGE_KEY);
  }
}
