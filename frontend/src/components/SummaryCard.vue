<template>
	<div class="flex flex-col bg-white rounded shadow-sm p-4 w-full items-center justify-center border border-gray-100">
		<div class="text-2xl font-bold text-gray-900">{{ value }}</div>
		<div class="text-xs font-medium text-gray-500 uppercase tracking-wider mt-1">{{ label }}</div>
	</div>
</template>

<script setup>
defineProps({
	label: String,
	value: [String, Number]
})
</script>
