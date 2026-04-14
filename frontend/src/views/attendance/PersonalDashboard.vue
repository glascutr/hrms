<template>
	<BaseLayout :pageTitle="__('Personal Dashboard')" :showBackButton="true">
		<template #body>
			<div class="flex flex-col gap-6 p-4 pb-24">
				<!-- Date Filters -->
				<div class="grid grid-cols-2 gap-3 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
					<div class="flex flex-col gap-1">
						<label class="text-xs font-medium text-gray-500">{{ __("From Date") }}</label>
						<input 
							type="date" 
							v-model="filters.from_date" 
							class="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
						/>
					</div>
					<div class="flex flex-col gap-1">
						<label class="text-xs font-medium text-gray-500">{{ __("To Date") }}</label>
						<input 
							type="date" 
							v-model="filters.to_date" 
							class="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
						/>
					</div>
				</div>

				<!-- Metrics Grid -->
				<div v-if="dashboard.data" class="grid grid-cols-2 gap-4">
					<SummaryCard :label="__('Time Worked')" :value="dashboard.data.metrics?.total_time_worked || '0h'" />
					<SummaryCard :label="__('Avg Check-in')" :value="dashboard.data.metrics?.avg_check_in || '--:--'" />
					<SummaryCard :label="__('Leave Taken')" :value="dashboard.data.metrics?.leave_taken || 0" />
					<SummaryCard :label="__('WFH Days')" :value="dashboard.data.metrics?.wfh_days || 0" />
				</div>

				<!-- Breakdown Section -->
				<div v-if="dashboard.data?.charts?.leave_summary" class="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
					<h3 class="text-base font-bold text-gray-900 mb-4">{{ __("Leave Breakdown") }}</h3>
					<div class="flex flex-col gap-5">
						<template v-for="item in dashboard.data.charts.leave_summary" :key="item.leave_type">
							<div v-if="item.total > 0 || item.taken > 0" class="flex flex-col gap-2">
								<div class="flex justify-between items-center text-sm">
									<div class="flex flex-col">
										<span class="font-medium text-gray-700">{{ __(item.leave_type) }}</span>
										<span class="text-[10px] text-gray-400 font-normal">
											{{ item.left }} {{ __("Days Available") }}
										</span>
									</div>
									<div class="text-right">
										<span class="font-bold text-gray-900">{{ item.taken }}</span>
										<span class="text-gray-400"> / {{ item.total }}</span>
									</div>
								</div>
								<div class="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden flex">
									<div 
										class="bg-blue-600 h-full transition-all duration-500" 
										:style="{ width: Math.min((item.taken / (item.total || 1)) * 100, 100) + '%' }"
									></div>
								</div>
							</div>
						</template>
						<div v-if="!dashboard.data.charts.leave_summary.some(i => i.total > 0 || i.taken > 0)" class="text-sm text-gray-500 text-center py-4">
							{{ __("No leave data for this period") }}
						</div>
					</div>
				</div>

				<!-- Punctuality -->
				<div v-if="dashboard.data?.charts?.punctuality" class="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
					<h3 class="text-base font-bold text-gray-900 mb-4">{{ __("Punctuality") }}</h3>
					<div class="flex flex-row gap-4 items-center">
						<div class="flex-1 flex flex-col gap-3">
							<div class="flex justify-between text-sm">
								<span class="text-gray-600">{{ __("On Time") }}</span>
								<span class="font-bold text-green-600">{{ dashboard.data.charts.punctuality['On Time'] }}</span>
							</div>
							<div class="flex justify-between text-sm">
								<span class="text-gray-600">{{ __("Late") }}</span>
								<span class="font-bold text-red-600">{{ dashboard.data.charts.punctuality['Late'] }}</span>
							</div>
						</div>
						<div class="w-px h-12 bg-gray-100"></div>
						<div class="flex-1 text-center">
							<div class="text-2xl font-black text-gray-900">
								{{ Math.round((dashboard.data.charts.punctuality['On Time'] / (dashboard.data.charts.punctuality['On Time'] + dashboard.data.charts.punctuality['Late'] || 1)) * 100) }}%
							</div>
							<div class="text-xs text-gray-500 uppercase tracking-wider">{{ __("Punctuality Rate") }}</div>
						</div>
					</div>
				</div>

				<!-- Recent Records Table -->
				<div v-if="dashboard.data" class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
					<div class="p-5 border-b border-gray-100">
						<h3 class="text-base font-bold text-gray-900">{{ __("Recent Attendance") }}</h3>
					</div>
					<div v-if="dashboard.data.table_data && dashboard.data.table_data.length" class="overflow-x-auto">
						<table class="w-full text-left border-collapse">
							<thead>
								<tr class="bg-gray-50 text-[10px] uppercase tracking-widest text-gray-500 font-bold">
									<th class="px-5 py-3">{{ __("Date") }}</th>
									<th class="px-5 py-3">{{ __("Timing") }}</th>
									<th class="px-5 py-3">{{ __("Status") }}</th>
								</tr>
							</thead>
							<tbody class="divide-y divide-gray-100">
								<tr v-for="row in dashboard.data.table_data.slice(0, 15)" :key="row.name" class="text-xs">
									<td class="px-5 py-4 text-gray-900 whitespace-nowrap font-medium">{{ row.attendance_date }}</td>
									<td class="px-5 py-4 whitespace-nowrap">
										<div class="flex flex-col">
											<span v-if="row.in_time" class="text-gray-900 text-[10px]">{{ row.in_time.split(' ')[1] }}</span>
											<span v-if="row.out_time" class="text-gray-400 text-[10px]">{{ row.out_time.split(' ')[1] }}</span>
											<span v-if="!row.in_time" class="text-gray-400 italic text-[10px]">--:--</span>
										</div>
									</td>
									<td class="px-5 py-4">
										<div class="flex flex-col gap-1 items-start">
											<span 
												class="px-2 py-0.5 rounded text-[10px] font-bold uppercase transition-colors"
												:class="{
													'bg-green-50 text-green-700': row.status === 'Present',
													'bg-blue-50 text-blue-700': row.status === 'Work From Home',
													'bg-orange-50 text-orange-700': row.status === 'Half Day',
													'bg-red-50 text-red-700': row.status === 'On Leave'
												}"
											>
												{{ __(row.status) }}
											</span>
											<div class="flex gap-1">
												<span v-if="row.late_entry" class="bg-red-100 text-red-700 px-1 rounded text-[9px] font-black uppercase">
													{{ __("Late") }}
												</span>
												<span v-if="row.early_exit" class="bg-orange-100 text-orange-700 px-1 rounded text-[9px] font-black uppercase">
													{{ __("Early Exit") }}
												</span>
											</div>
										</div>
									</td>
								</tr>
							</tbody>
						</table>
					</div>
					<div v-else class="p-10 text-center text-sm text-gray-500">
						{{ __("No records found for the selected period") }}
					</div>
				</div>

				<!-- Loading State -->
				<div v-if="dashboard.loading" class="flex justify-center items-center py-20">
					<LoadingIndicator class="w-8 h-8 text-blue-600" />
				</div>
			</div>
		</template>
	</BaseLayout>
</template>

<script setup>
import { inject, reactive, watch } from "vue"
import { createResource, LoadingIndicator } from "frappe-ui"
import BaseLayout from "@/components/BaseLayout.vue"
import SummaryCard from "@/components/SummaryCard.vue"

const __ = inject("$translate")
const employee = inject("$employee")
const dayjs = inject("$dayjs")

const filters = reactive({
	from_date: dayjs().startOf("month").format("YYYY-MM-DD"),
	to_date: dayjs().format("YYYY-MM-DD"),
})

const dashboard = createResource({
	url: "hrms.hr.page.attendance_records.attendance_records.get_dashboard_data",
	params: {
		filters: {
			from_date: filters.from_date,
			to_date: filters.to_date,
			employee: employee.data?.name,
		},
	},
	auto: false,
})

// Reload when filters or employee change
watch(
	() => [filters.from_date, filters.to_date, employee.data?.name],
	([from, to, emp]) => {
		if (emp) {
			dashboard.submit({
				filters: {
					from_date: from,
					to_date: to,
					employee: emp
				}
			})
		}
	},
	{ immediate: true }
)
</script>
