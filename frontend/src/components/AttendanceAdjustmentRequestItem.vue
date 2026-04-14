<template>
	<ListItem
		:isTeamRequest="props.isTeamRequest"
		:employee="props.doc.employee"
		:employeeName="props.doc.employee_name"
		>
		<template #left>
			<AdjustIcon class="h-5 w-5 text-gray-500" />
			<div class="flex flex-col items-start gap-1.5">
				<div class="text-base font-normal text-gray-800">
					{{ props.doc.adjustment_type }}
				</div>
				<div class="text-xs font-normal text-gray-500">
					<span>{{ dayjs(props.doc.date).format("D MMM YYYY") }}</span>
				</div>
			</div>
		</template>
		<template #right>
			<Badge variant="outline" :theme="colorMap[status]" :label="__(status)" size="md" />
			<FeatherIcon name="chevron-right" class="h-5 w-5 text-gray-500" />
		</template>
	</ListItem>
</template>

<script setup>
import { computed, inject } from "vue"
import { Badge, FeatherIcon } from "frappe-ui"

import ListItem from "@/components/ListItem.vue"
import AdjustIcon from "@/components/icons/AdjustIcon.vue"

const dayjs = inject("$dayjs")

const props = defineProps({
	doc: {
		type: Object,
	},
	isTeamRequest: {
		type: Boolean,
		default: false,
	},
})

const status = computed(() => {
	return props.doc.status || (props.doc.docstatus ? "Submitted" : "Open")
})

const colorMap = {
	Open: "gray",
	Approved: "green",
	Rejected: "red",
	Cancelled: "orange",
}
</script>
