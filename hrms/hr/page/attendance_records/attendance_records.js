frappe.pages['attendance-records'].on_page_load = function(wrapper) {
	var page = frappe.ui.make_app_page({
		parent: wrapper,
		title: __('Attendance Records'),
		single_column: true
	});

	let dashboard = new AttendanceDashboard(page);
	dashboard.show();
}

class AttendanceDashboard {
	constructor(page) {
		this.page = page;
		this.setup_filters();
		this.setup_layout();
	}

	show() {
		this.refresh();
	}

	setup_filters() {
		this.page.add_field({
			fieldname: 'date_range',
			label: __('Select date range'),
			fieldtype: 'DateRange',
			default: [frappe.datetime.month_start(), frappe.datetime.get_today()],
			change: () => this.refresh()
		});

		this.page.add_field({
			fieldname: 'employee',
			label: __('Employee'),
			fieldtype: 'Link',
			options: 'Employee',
			change: () => this.refresh()
		});

		this.page.add_field({
			fieldname: 'department',
			label: __('Department'),
			fieldtype: 'Link',
			options: 'Department',
			change: () => this.refresh()
		});
	}

	setup_layout() {
		this.container = $('<div class="attendance-dashboard">').appendTo(this.page.main);
		this.container.html(`
			<div class="metrics-row"></div>
			<div class="charts-row">
				<div class="chart-container" id="leave-bar-chart">
					<div class="chart-title">${__('Leave Days')}</div>
					<div class="chart-canvas"></div>
				</div>
				<div class="chart-container" id="wfh-pie-chart">
					<div class="chart-title">${__('WFH & Leave Breakdown')}</div>
					<div class="chart-canvas"></div>
				</div>
				<div class="chart-container" id="punctuality-pie-chart">
					<div class="chart-title">${__('Punctuality (On Time vs Late)')}</div>
					<div class="chart-canvas"></div>
				</div>
			</div>
			<div class="table-section">
				<table class="attendance-table">
					<thead>
						<tr>
							<th>${__('Date')}</th>
							<th>${__('Employee Name')}</th>
							<th>${__('In Time')}</th>
							<th>${__('Out Time')}</th>
							<th>${__('Duration')}</th>
							<th>${__('Status')}</th>
						</tr>
					</thead>
					<tbody></tbody>
				</table>
			</div>
		`);
	}

	refresh() {
		const dr = this.page.fields_dict.date_range.get_value();
		const filters = {
			from_date: dr ? dr[0] : null,
			to_date: dr ? dr[1] : null,
			employee: this.page.fields_dict.employee.get_value(),
			department: this.page.fields_dict.department.get_value()
		};

		frappe.call({
			method: "hrms.hr.page.attendance_records.attendance_records.get_dashboard_data",
			args: { filters: filters },
			callback: (r) => {
				if (r.message) {
					this.render_metrics(r.message.metrics);
					this.render_charts(r.message.charts);
					this.render_table(r.message.table_data);
				}
			}
		});
	}

	render_metrics(metrics) {
		const row = this.container.find('.metrics-row');
		row.empty();
		const items = [
			{ label: __('Total Time Worked'), value: metrics.total_time_worked },
			{ label: __('Avg. Check In'), value: metrics.avg_check_in },
			{ label: __('Avg. Check Out'), value: metrics.avg_check_out },
			{ label: __('Leave Taken'), value: metrics.leave_taken },
			{ label: __('WFH Days'), value: metrics.wfh_days }
		];

		items.forEach(item => {
			$(`
				<div class="metric-card">
					<div class="metric-value">${item.value}</div>
					<div class="metric-label">${item.label}</div>
				</div>
			`).appendTo(row);
		});
	}

	render_charts(charts) {
		this.render_bar("#leave-bar-chart .chart-canvas", charts.leave_summary);
		this.render_pie("#wfh-pie-chart .chart-canvas", charts.breakdown);
		this.render_pie("#punctuality-pie-chart .chart-canvas", charts.punctuality);
	}

	render_bar(selector, leave_summary) {
		if (!leave_summary || leave_summary.length === 0) {
			$(selector).html(`<div class="text-muted text-center">${__('No data')}</div>`);
			return;
		}

		const labels = leave_summary.map(d => d.leave_type);
		const taken = leave_summary.map(d => d.taken);
		const left = leave_summary.map(d => d.left);

		new frappe.Chart(selector, {
			data: {
				labels: labels,
				datasets: [
					{ name: __('Taken'), values: taken, chartType: 'bar' },
					{ name: __('Days Left'), values: left, chartType: 'bar' }
				]
			},
			type: 'bar',
			height: 250,
			colors: ['#0bc5ea', '#ed64a6'],
			barOptions: { stacked: 1 }
		});
	}

	render_pie(selector, breakdown) {
		const labels = Object.keys(breakdown);
		const values = Object.values(breakdown);

		if (values.length === 0 || values.every(v => v === 0)) {
			$(selector).html(`<div class="text-muted text-center">${__('No data')}</div>`);
			return;
		}

		new frappe.Chart(selector, {
			data: {
				labels: labels,
				datasets: [{ values: values }]
			},
			type: 'pie',
			height: 250,
			colors: ['#3182ce', '#38b2ac', '#9f7aea', '#ed64a6', '#f6ad55']
		});
	}

	render_table(data) {
		const tbody = this.container.find('.attendance-table tbody');
		tbody.empty();

		if (!data || data.length === 0) {
			tbody.append(`<tr><td colspan="6" class="text-center">${__('No records found')}</td></tr>`);
			return;
		}

		data.forEach(r => {
			const punctuality_class = r.late_entry ? 'late' : 'on-time';
			const punctuality_label = r.late_entry ? __('Late') : __('On Time');
			const in_time = r.in_time ? frappe.datetime.get_time(r.in_time) : '-';
			const out_time = r.out_time ? frappe.datetime.get_time(r.out_time) : '-';
			const duration = r.working_hours ? `${flt(r.working_hours, 2)} hrs` : '-';

			tbody.append(`
				<tr>
					<td>${frappe.datetime.str_to_user(r.attendance_date)}</td>
					<td>${r.employee_name}</td>
					<td>${in_time}</td>
					<td>${out_time}</td>
					<td>${duration}</td>
					<td><span class="punctuality-badge ${punctuality_class}">${punctuality_label}</span></td>
				</tr>
			`);
		});
	}
}
