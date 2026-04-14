<template>
	<BaseLayout>
		<template #body>
			<div class="flex flex-col gap-6 p-4 overflow-y-auto pb-20">
				<div class="flex flex-col gap-4">
					<h2 class="text-2xl font-bold text-gray-900">
						{{ __("Hey, {0} 👋", [employee?.data?.first_name]) }}
					</h2>
					<div class="grid grid-cols-3 gap-4">
						<SummaryCard :label="__('Leave Taken')" :value="dashboardMetrics.data?.leave_taken || 0" />
						<SummaryCard :label="__('WFH')" :value="dashboardMetrics.data?.wfh_count || 0" />
						<SummaryCard :label="__('Adjustments')" :value="dashboardMetrics.data?.adjustment_count || 0" />
					</div>
				</div>
				<QuickLinks :items="quickLinks" :title="__('Quick Links')" />
				<RequestPanel />
			</div>
		</template>

		<template #fixed>
			<ion-fab slot="fixed" vertical="bottom" horizontal="end">
				<ion-fab-button @click="() => $router.push({ name: 'AttendanceRequestFormView' })">
					<FeatherIcon name="plus" class="h-6 w-6" />
				</ion-fab-button>
			</ion-fab>
		</template>
	</BaseLayout>
</template>

<script setup>
import { inject, markRaw, computed, watch } from "vue"
import { createResource, FeatherIcon } from "frappe-ui"
import { IonFab, IonFabButton } from "@ionic/vue"

import SummaryCard from "@/components/SummaryCard.vue"
import QuickLinks from "@/components/QuickLinks.vue"
import BaseLayout from "@/components/BaseLayout.vue"
import RequestPanel from "@/components/RequestPanel.vue"
import AttendanceIcon from "@/components/icons/AttendanceIcon.vue"
import ShiftIcon from "@/components/icons/ShiftIcon.vue"
import LeaveIcon from "@/components/icons/LeaveIcon.vue"
import DashboardIcon from "@/components/icons/DashboardIcon.vue"
import AdjustIcon from "@/components/icons/AdjustIcon.vue"
import HistoryIcon from "@/components/icons/HistoryIcon.vue"
import ExpenseIcon from "@/components/icons/ExpenseIcon.vue"
import EmployeeAdvanceIcon from "@/components/icons/EmployeeAdvanceIcon.vue"
import SalaryIcon from "@/components/icons/SalaryIcon.vue"

import { dashboardMetrics } from "@/data/dashboard"

const __ = inject("$translate")
const employee = inject("$employee")

watch(
	() => employee.data,
	(employeeData) => {
		if (employeeData?.name) {
			dashboardMetrics.params.employee = employeeData.name
			dashboardMetrics.reload()
		}
	},
	{ immediate: true }
)



const quickLinks = [
	{
		icon: markRaw(DashboardIcon),
		title: __("Dashboard"),
		route: "PersonalDashboardView",
	},
	{
		icon: markRaw(AttendanceIcon),
		title: __("Request Attendance"),
		route: "AttendanceRequestFormView",
	},
	{
		icon: markRaw(HistoryIcon),
		title: __("Attendance History"),
		route: "AttendanceRequestListView",
	},
	{
		icon: markRaw(AdjustIcon),
		title: __("Request Attendance Adjustment"),
		route: "AttendanceAdjustmentRequestFormView",
	},
	{
		icon: markRaw(HistoryIcon),
		title: __("Adjustment History"),
		route: "AttendanceAdjustmentRequestListView",
	},
	{
		icon: markRaw(ShiftIcon),
		title: __("Request a Shift"),
		route: "ShiftRequestFormView",
	},
	{
		icon: markRaw(LeaveIcon),
		title: __("Request Leave"),
		route: "LeaveApplicationFormView",
	},
	{
		icon: markRaw(ExpenseIcon),
		title: __("Claim an Expense"),
		route: "ExpenseClaimFormView",
	},
	{
		icon: markRaw(EmployeeAdvanceIcon),
		title: __("Request an Advance"),
		route: "EmployeeAdvanceFormView",
	},
	{
		icon: markRaw(SalaryIcon),
		title: __("View Salary Slips"),
		route: "SalarySlipsDashboard",
	},
]
</script>
