<template>
	<ion-page>
		<ListView
			doctype="Attendance Adjustment Request"
			:pageTitle="__('Adjustment Request History')"
			:fields="FIELDS"
			:filterConfig="FILTER_CONFIG"
		/>
	</ion-page>
</template>

<script setup>
import { IonPage } from "@ionic/vue"
import ListView from "@/components/ListView.vue"
import { inject } from "vue"

const __ = inject("$translate")

const FIELDS = ["name", "adjustment_type", "date", "status", "docstatus"]
const FILTER_CONFIG = [
	{
		fieldname: "adjustment_type",
		fieldtype: "Select",
		label: __("Adjustment Type"),
		options: "\nLate Entry\nEarly Exit",
	},
	{ fieldname: "date", fieldtype: "Date", label: __("Date") },
]
</script>
