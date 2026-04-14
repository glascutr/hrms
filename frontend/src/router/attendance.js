const routes = [
	{
		name: "AttendanceRequestListView",
		path: "/attendance-requests",
		component: () => import("@/views/attendance/AttendanceRequestList.vue"),
	},
	{
		name: "AttendanceRequestFormView",
		path: "/attendance-requests/new",
		component: () => import("@/views/attendance/AttendanceRequestForm.vue"),
	},
	{
		name: "AttendanceRequestDetailView",
		path: "/attendance-requests/:id",
		props: true,
		component: () => import("@/views/attendance/AttendanceRequestForm.vue"),
	},
	{
		name: "ShiftRequestListView",
		path: "/shift-requests",
		component: () => import("@/views/attendance/ShiftRequestList.vue"),
	},
	{
		name: "ShiftRequestFormView",
		path: "/shift-requests/new",
		component: () => import("@/views/attendance/ShiftRequestForm.vue"),
	},
	{
		name: "ShiftRequestDetailView",
		path: "/shift-requests/:id",
		props: true,
		component: () => import("@/views/attendance/ShiftRequestForm.vue"),
	},
	{
		name: "ShiftAssignmentListView",
		path: "/shift-assignments",
		component: () => import("@/views/attendance/ShiftAssignmentList.vue"),
	},
	{
		name: "ShiftAssignmentFormView",
		path: "/shift-assignments/new",
		component: () => import("@/views/attendance/ShiftAssignmentForm.vue"),
	},
	{
		name: "ShiftAssignmentDetailView",
		path: "/shift-assignments/:id",
		props: true,
		component: () => import("@/views/attendance/ShiftAssignmentForm.vue"),
	},
	{
		name: "EmployeeCheckinListView",
		path: "/employee-checkins",
		component: () => import("@/views/attendance/EmployeeCheckinList.vue"),
	},
	{
		name: "AttendanceAdjustmentRequestListView",
		path: "/attendance-adjustment-requests",
		component: () => import("@/views/attendance/AttendanceAdjustmentRequestList.vue"),
	},
	{
		name: "AttendanceAdjustmentRequestFormView",
		path: "/attendance-adjustment-requests/new",
		component: () => import("@/views/attendance/AttendanceAdjustmentRequestForm.vue"),
	},
	{
		name: "AttendanceAdjustmentRequestDetailView",
		path: "/attendance-adjustment-requests/:id",
		props: true,
		component: () => import("@/views/attendance/AttendanceAdjustmentRequestForm.vue"),
	},
]

export default routes
