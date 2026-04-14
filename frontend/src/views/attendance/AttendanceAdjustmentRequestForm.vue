<template>
	<ion-page>
		<ion-content :fullscreen="true">
			<FormView
				v-if="formFields.data"
				doctype="Attendance Adjustment Request"
				v-model="adjustmentRequest"
				:isSubmittable="true"
				:fields="formFields.data"
				:id="props.id"
				@validateForm="validateForm"
			/>
		</ion-content>
	</ion-page>
</template>

<script setup>
import { IonPage, IonContent } from "@ionic/vue"
import { createResource } from "frappe-ui"
import { ref, watch, inject } from "vue"

import FormView from "@/components/FormView.vue"

const employee = inject("$employee")
const __ = inject("$translate")

const props = defineProps({
	id: {
		type: String,
		required: false,
	},
})

const adjustmentRequest = ref({})

const formFields = createResource({
	url: "hrms.api.get_doctype_fields",
	params: { doctype: "Attendance Adjustment Request" },
	auto: true,
	transform(data) {
		if (props.id) return data
		return data.filter(
			(field) => !["employee", "employee_name", "status", "company", "department"].includes(field.fieldname)
		)
	},
})

const approverResource = createResource({
	url: "bizboost_reports.bizboost_reports.doctype.attendance_adjustment_request.attendance_adjustment_request.get_aar_approver",
})

const reviewerResource = createResource({
	url: "bizboost_reports.bizboost_reports.doctype.attendance_adjustment_request.attendance_adjustment_request.get_aar_reviewer",
})

watch(
	() => [employee.data, adjustmentRequest.value.employee],
	([empData, selectedEmp]) => {
		const empName = selectedEmp || empData?.name
		if (empName && !props.id) {
			fetchApproverAndReviewer(empName)
		}
	},
	{ immediate: true }
)

function fetchApproverAndReviewer(empName) {
	approverResource.submit({ employee: empName }).then((res) => {
		if (res) {
			adjustmentRequest.value.approver = res.user_id
			adjustmentRequest.value.approver_name = res.full_name
		}
	})
	reviewerResource.submit({ employee: empName }).then((res) => {
		if (res) {
			adjustmentRequest.value.reviewer = res.user_id
			adjustmentRequest.value.reviewer_name = res.full_name
		}
	})
}

function validateForm() {
	adjustmentRequest.value.employee = employee.data.name
}
</script>
