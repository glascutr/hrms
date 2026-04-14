import frappe
from frappe import _
from frappe.utils import flt, getdate, format_datetime, format_duration, get_time
from datetime import datetime, timedelta

@frappe.whitelist()
def get_dashboard_data(filters):
	if isinstance(filters, str):
		filters = frappe.parse_json(filters)
	
	from_date = filters.get("from_date")
	to_date = filters.get("to_date")
	employee = filters.get("employee")
	department = filters.get("department")
	
	conditions = {"docstatus": 1}
	if from_date:
		conditions["attendance_date"] = [">=", from_date]
	if to_date:
		if "attendance_date" in conditions:
			conditions["attendance_date"] = ["between", [from_date, to_date]]
		else:
			conditions["attendance_date"] = ["<=", to_date]
	if employee:
		conditions["employee"] = employee
	if department:
		conditions["department"] = department
	
	attendance_records = frappe.get_all("Attendance", 
		filters=conditions, 
		fields=["name", "employee", "employee_name", "attendance_date", "status", "in_time", "out_time", "working_hours", "late_entry", "early_exit", "department", "leave_type"],
		order_by="attendance_date desc"
	)
	
	metrics = calculate_metrics(attendance_records)
	charts = calculate_charts(attendance_records, employee, from_date, to_date)
	
	return {
		"metrics": metrics,
		"charts": charts,
		"table_data": attendance_records
	}

def calculate_metrics(records):
	total_time_worked_s = 0
	check_in_times = []
	check_out_times = []
	leave_taken = 0
	wfh_days = 0
	
	for r in records:
		if r.status in ["Present", "Half Day", "Work From Home"]:
			if r.working_hours:
				total_time_worked_s += flt(r.working_hours) * 3600
			
		if r.status == "On Leave":
			leave_taken += 1
		elif r.status == "Work From Home":
			wfh_days += 1
		elif r.status == "Half Day":
			leave_taken += 0.5
			
		if r.in_time:
			t = get_time(r.in_time)
			check_in_times.append(t.hour * 3600 + t.minute * 60 + t.second)
			
		if r.out_time:
			t = get_time(r.out_time)
			check_out_times.append(t.hour * 3600 + t.minute * 60 + t.second)
			
	avg_check_in = sum(check_in_times) / len(check_in_times) if check_in_times else 0
	avg_check_out = sum(check_out_times) / len(check_out_times) if check_out_times else 0
	
	return {
		"total_time_worked": format_duration(total_time_worked_s),
		"avg_check_in": format_seconds(avg_check_in),
		"avg_check_out": format_seconds(avg_check_out),
		"leave_taken": leave_taken,
		"wfh_days": wfh_days
	}

def format_seconds(seconds):
	h = int(seconds // 3600)
	m = int((seconds % 3600) // 60)
	s = int(seconds % 60)
	return f"{h:02}:{m:02}:{s:02}"

def calculate_charts(records, employee, from_date, to_date):
	# Breakdown
	breakdown = {}
	for r in records:
		if r.status == "Work From Home":
			breakdown["WFH"] = breakdown.get("WFH", 0) + 1
		elif r.status in ["On Leave", "Half Day"]:
			lt = r.leave_type or "Other"
			breakdown[lt] = breakdown.get(lt, 0) + (1 if r.status == "On Leave" else 0.5)
			
	# Punctuality
	punctuality = {"On Time": 0, "Late": 0}
	for r in records:
		if r.status in ["Present", "Half Day", "Work From Home"]:
			if r.late_entry:
				punctuality["Late"] += 1
			else:
				punctuality["On Time"] += 1
				
	# Leave Type Summary (for bar chart)
	leave_summary = []
	leave_types = frappe.get_all("Leave Type", fields=["name"])
	
	leave_allocation = {}
	if employee:
		from hrms.hr.doctype.leave_application.leave_application import get_leave_details
		from frappe.utils import nowdate
		res = get_leave_details(employee, nowdate())
		leave_allocation = res.get("leave_allocation", {})

	for lt in leave_types:
		details = leave_allocation.get(lt.name, {})
		taken = flt(details.get("leaves_taken", 0))
		balance = flt(details.get("remaining_leaves", 0))
		total = flt(details.get("total_leaves", 0))
		
		# If no allocation record, it won't be in leave_allocation
		# But we still want to show it if there are taken leaves in the selected period
		if lt.name in breakdown:
			period_taken = breakdown[lt.name]
			if not total: # ensure we show at least the taken amount if total is 0
				total = period_taken
		
		leave_summary.append({
			"leave_type": lt.name,
			"taken": taken,
			"left": balance,
			"total": total
		})
	
	# Handle leaves with no assigned type
	if breakdown.get("Other", 0) > 0:
		leave_summary.append({
			"leave_type": _("Other"),
			"taken": breakdown["Other"],
			"left": 0
		})
			
	return {
		"breakdown": breakdown,
		"punctuality": punctuality,
		"leave_summary": leave_summary
	}
