import frappe
from frappe import _
from frappe.utils import getdate

@frappe.whitelist()
def get_home_metrics(employee):
	if not employee:
		return {
			"leave_taken": 0,
			"wfh_count": 0,
			"adjustment_count": 0
		}

	from frappe.utils import get_first_day, nowdate
	from_date = get_first_day(nowdate())
	to_date = nowdate()

	# Attendance records for the current year
	attendance_records = frappe.get_all("Attendance", {
		"employee": employee,
		"attendance_date": ["between", [from_date, to_date]],
		"docstatus": 1
	}, ["status"])

	leave_taken = 0
	wfh_count = 0

	for r in attendance_records:
		if r.status == "On Leave":
			leave_taken += 1
		elif r.status == "Work From Home":
			wfh_count += 1
		elif r.status == "Half Day":
			leave_taken += 0.5

	# Adjustments (Count from Attendance Adjustment Request)
	# Using the doctype from bizboost_reports as identified
	adjustment_count = frappe.db.count("Attendance Adjustment Request", {
		"employee": employee,
		"date": ["between", [from_date, to_date]],
		"docstatus": ["!=", 2]
	})

	return {
		"leave_taken": leave_taken,
		"wfh_count": wfh_count,
		"adjustment_count": adjustment_count
	}
