import { createResource } from "frappe-ui"
import { employeeResource } from "./employee"

export const dashboardMetrics = createResource({
	url: "hrms.api.dashboard.get_home_metrics",
	params: {
		employee: employeeResource.data?.name,
	},
	auto: true,
})
