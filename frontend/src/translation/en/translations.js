

export default {
	shared: {
		enable: "Enable data entry",
		disable: "Disable data entry",
		accept_invitation: "Accept",
		refuse_invitation: "Refuse",
		uninvite: "Remove from my projects",
		no_invitations: "You have no invitations waiting for approval!",
		no_invitations_back: "Go back to your projects",

		configure: "Configuration",
		back: "Back",
		project_list: "Projects list",
		none: "None",
		percentage_done: "{{value}}% done",
		percentage_incomplete: "{{value}}% incomplete",
		percentage_missing: "{{value}}% missing",

		task: "Task",
		state: "State",
		open: "Open",
		loading: "Loading...",
		restore: "Restore",
		description: "Description",

		country: "Country",
		apply: "Apply changes",
		clone: "Clone",
		clone_structure: "Clone structure",
		clone_all: "Clone structure and data",
		home: "Home",

		date: "Date",

		project: 'Project',
		indicator: 'Indicator',
		indicators: 'Indicators',
		help: 'Frequently Asked Questions',
		name: 'Name',
		start: 'Start',
		end: 'End',

		add: 'Add',
		save: 'Save',
		remove: 'Remove',
		remove_changes: 'Reset changes',
		edit: 'Edit',
		'delete': 'Delete',

		members: 'Members',

		logical_frames: 'Logical Frameworks',
		reporting: 'Reporting',
		reporting_general: 'General reporting',
		colorize: 'Colorize',
		download_plot: 'Download plot',

		logout: 'Log Out',

		sure_to_leave: 'You made changes. Click OK to confirm that you want to leave without saving.',
	},
	menu: {
		language: "Language",
		french: "French",
		spanish: "Spanish",
		english: "English",
	},

	project: {
		portrait: 'Portrait Version',
		landscape: 'Landscape Version',

		time_to_fill: "Estimated time to fill",
		confirm_delete_site: `If you delete this collection site, you won't be able to access its data in reporting. Confirm to delete.`,
		confirm_delete_datasource: `If you delete this data source, you won't be able to access its data in reporting anymore, nor any indicator which depended on it. Confirm to delete.`,
		no_invitations_yet: "You have not invited other person to your project yet",
		add_invitation: "Invite a new person",
		email: "Email",
		user_help_email: "What is the email of the person that you wish to invite?",
		total: "Total",
		variables: "Variables",
		owner: "Owner",
		invitations: "Invitations",
		downloads: "Downloads",
		last_entry: "Last entry",
		show_totals: "Show totals",
		add_datasource: "Create a new data source",
		no_matches: "No projects match the selected criterias",
		is_finished: "This project is finished",
		was_deleted: "This project was deleted",
		show_ongoing_projects: "Show ongoing projects",
		show_finished_projects: "Show finished projects",
		show_deleted_projects: "Show deleted projects",
		filter_placeholder: "Enter text here to filter the projects",

		revisions: "History",
		revision_datetime: "Date & User",
		revision_changes: "Changes",
		revision_restore: "Revert to this version",
		revision_save_to_confirm: "Save to confirm reverting to this version",
		revision_is_equivalent: "This version is equivalent to the current state of the project",
		revision_none: "No history is available on this project",
		revision_show_more: "Load more revisions",

		history: {
			active_replace: "{{after ? 'Restore' : 'Delete'}} the project",
			name_replace: "Rename the project from <code>{{before}}</code> to <code>{{after}}</code>",
			start_replace: "Change the project start date of the project from <code>{{before|date}}</code> to <code>{{after|date}}</code>",
			end_replace: "Change the project end date from <code>{{before|date}}</code> to <code>{{after|date}}</code>",
			country_replace: "Change the project country from <code>{{before}}</code> to <code>{{after}}</code>",

			entities_add: "Add the new site <code>{{item.name}}</code>",
			entities_move: "Reorder the sites of the project",
			entities_remove: "Remove the site <code>{{item.name}}</code>",
			entities_name_replace: "Rename the site <code>{{before}}</code> to <code>{{after}}</code>",
			entities_active_replace: "{{after ? 'Enable' : 'Disable'}} data entry on site <code>{{entity.name}}</code>",

			groups_add: "Create the group <code>{{item.name}}</code>",
			groups_move: "Reorder the project groups",
			groups_remove: "Remove the group <code>{{item.name}}</code>",
			groups_name_replace: "Rename the group <code>{{before}}</code> to <code>{{after}}</code>",
			groups_members_add: "Add the site <code>{{item.name}}</code> to the group <code>{{group.name}}</code>",
			groups_members_move: "Reorder the sites of the group <code>{{group.name}}</code>",
			groups_members_remove: "Remove the site <code>{{item.name}}</code> from the group <code>{{group.name}}</code>",

			forms_add: "Create the data source <code>{{item.name}}</code>",
			forms_move: "Reorder the data sources of the project",
			forms_replace: "Replace data sources <code>{{before.name}}</code> by <code>{{after.name}}</code>",
			forms_remove: "Delete the data source <code>{{item.name}}</code>",
			forms_name_replace: "Rename the data source <code>{{before}}</code> to <code>{{after}}</code>",
			forms_periodicity_replace: "Change the periodicity of the data source <code>{{form.name}}</code> from <code>{{before}}</code> to <code>{{after}}</code>",
			forms_active_replace: "{{after ? 'Enable' : 'Disable'}} data entry on data source <code>{{form.name}}</code>",

			forms_entities_add: "Add the site <code>{{item.name}}</code> to the data source <code>{{form.name}}</code>",
			forms_entities_move: "Reorder the sites of the data source <code>{{form.name}}</code>",
			forms_entities_remove: "Remove the site <code>{{item.name}}</code> from the data source <code>{{form.name}}</code>",
			forms_entities_replace: "Replace the site <code>{{beforeItem.name}}</code> by <code>{{afterItem.name}}</code> in data source <code>{{form.name}}</code>",

			forms_elements_add: "Add the variable <code>{{item.name}}</code> to <code>{{form.name}}</code>",
			forms_elements_move: "Reorder the variables of the data source <code>{{form.name}}</code>",
			forms_elements_remove: "Remove the variable <code>{{item.name}}</code> from <code>{{form.name}}</code>",
			forms_elements_replace: "Replace variable <code>{{before.name}}</code> by <code>{{after.name}}</code> in <code>{{form.name}}</code>",

			forms_elements_name_replace: "Rename the variable <code>{{before}}</code> to <code>{{after}}</code>",
			forms_elements_active_replace: "{{after ? 'Enable' : 'Disable'}} data entry on variable <code>{{variable.name}}</code>",
			forms_elements_geoAgg_replace: "Change the aggregation rule (location) of <code>{{variable.name}}</code> from <code>{{before}}</code> to <code>{{after}}</code>",
			forms_elements_timeAgg_replace: "Change the aggregation rule (time) of <code>{{variable.name}}</code> from <code>{{before}}</code> to <code>{{after}}</code>",
			forms_elements_distribution_replace: "Change the format of the input table of <code>{{variable.name}}</code>",

			forms_elements_partitions_add: "Create the disaggregation <code>{{item.name}}</code> in <code>{{variable.name}}</code>",
			forms_elements_partitions_move: "Reorder the disaggregations of <code>{{variable.name}}</code>",
			forms_elements_partitions_remove: "Delete the disaggregation <code>{{item.name}}</code> from <code>{{variable.name}}</code>",
			forms_elements_partitions_name_replace: "Rename the disaggregation <code>{{before}}</code> to <code>{{after}}</code> in variable <code>{{variable.name}}</code>",
			forms_elements_partitions_active_replace: "{{after ? 'Enable' : 'Disable'}} data entry on disaggregation <code>{{partition.name}}</code> of variable <code>{{variable.name}}</code>",
			forms_elements_partitions_aggregation_replace: "Change aggregation mode from <code>{{before}}</code> to <code>{{after}}</code> in disaggregation <code>{{partition.name}}</code> of variable <code>{{variable.name}}</code>",

			forms_elements_partitions_elements_add: "Add element <code>{{item.name}}</code> in disaggregation <code>{{partition.name}}</code> of variable <code>{{variable.name}}</code>",
			forms_elements_partitions_elements_move: "Reorder elements of disaggregation <code>{{partition.name}}</code> of variable <code>{{variable.name}}</code>",
			forms_elements_partitions_elements_remove: "Delete element <code>{{item.name}}</code> in disaggregation <code>{{partition.name}}</code> of variable <code>{{variable.name}}</code>",
			forms_elements_partitions_elements_name_replace: "Rename element <code>{{before}}</code> to <code>{{after}}</code> in disaggregation <code>{{partition.name}}</code> of variable <code>{{variable.name}}</code>",
			forms_elements_partitions_elements_active_replace: "{{after ? 'Enable' : 'Disable'}} data entry on disaggregation element <code>{{element.name}}</code> in disaggregation <code>{{partition.name}}</code> of variable <code>{{variable.name}}</code>",

			forms_elements_partitions_groups_add: "Add group <code>{{item.name}}</code> in disaggregation <code>{{partition.name}}</code> of variable <code>{{variable.name}}</code>",
			forms_elements_partitions_groups_move: "Reorder groups in <code>{{partition.name}}</code> of variable <code>{{variable.name}}</code>",
			forms_elements_partitions_groups_remove: "Delete group <code>{{item.name}}</code> in disaggregation <code>{{partition.name}}</code> of variable <code>{{variable.name}}</code>",
			forms_elements_partitions_groups_name_replace: "Rename group <code>{{before}}</code> to <code>{{after}}</code> in disaggregation <code>{{partition.name}}</code> of variable <code>{{variable.name}}</code>",
			forms_elements_partitions_groups_members_add: "Add <code>{{item.name}}</code> to group <code>{{group.name}}</code> in disaggregation <code>{{partition.name}}</code> of variable <code>{{variable.name}}</code>",
			forms_elements_partitions_groups_members_move: "Reorder group members of <code>{{group.name}}</code> in disaggregation <code>{{partition.name}}</code> of variable <code>{{variable.name}}</code>",
			forms_elements_partitions_groups_members_remove: "Remove <code>{{item.name}}</code> from group <code>{{group.name}}</code> in disaggregation <code>{{partition.name}}</code> of variable <code>{{variable.name}}</code>",

			logicalFrames_add: "Create logical framework <code>{{item.name}}</code>",
			logicalFrames_move: "Reorder logical frameworks",
			logicalFrames_remove: "Remove logical framework <code>{{item.name}}</code>",

			logicalFrames_entities_add: "Add the site <code>{{item.name}}</code> to the logical framework <code>{{logicalFrame.name}}</code>",
			logicalFrames_entities_move: "Reorder the sites of the logical framework <code>{{logicalFrame.name}}</code>",
			logicalFrames_entities_remove: "Remove the site <code>{{item.name}}</code> from the logical framework <code>{{logicalFrame.name}}</code>",

			logicalFrames_name_replace: "Rename logical framework <code>{{before}}</code> to <code>{{after}}</code>",
			logicalFrames_goal_replace: "Change general objective <code>{{before}}</code> to <code>{{after}}</code> in logical framework <code>{{logicalFrame.name}}</code>",
			logicalFrames_start_replace: "Change start date <code>{{before}}</code> to <code>{{after}}</code> in logical framework <code>{{logicalFrame.name}}</code>",
			logicalFrames_end_replace: "Change end date <code>{{before}}</code> to <code>{{after}}</code> in logical framework <code>{{logicalFrame.name}}</code>",

			logicalFrames_purposes_add: "Add specific objective <code>{{item.description}}</code> to logical framework <code>{{logicalFrame.name}}</code>",
			logicalFrames_purposes_move: "Reorder specific objectives of logical framwork <code>{{logicalFrame.name}}</code>",
			logicalFrames_purposes_remove: "Remove specific objective <code>{{item.description}}</code> from logical framework <code>{{logicalFrame.name}}</code>",
			logicalFrames_purposes_description_replace: "Change description of specific objective <code>{{before}}</code> to <code>{{after}}</code> in logical framework <code>{{logicalFrame.name}}</code>",
			logicalFrames_purposes_assumptions_replace: "Change assumptions of specific objective <code>{{purpose.description}}</code> de <code>{{before}}</code> to <code>{{after}}</code> in logical framework <code>{{logicalFrame.name}}</code>",

			logicalFrames_purposes_outputs_add: "Add result <code>{{item.description}}</code> to logical framework <code>{{logicalFrame.name}}</code>",
			logicalFrames_purposes_outputs_move: "Reorder results in logical framework <code>{{logicalFrame.name}}</code>",
			logicalFrames_purposes_outputs_remove: "Remove result <code>{{item.description}}</code> from logical framework <code>{{logicalFrame.name}}</code>",
			logicalFrames_purposes_outputs_description_replace: "Change result description <code>{{before}}</code> to <code>{{after}}</code> in logical framework <code>{{logicalFrame.name}}</code>",
			logicalFrames_purposes_outputs_assumptions_replace: "Change result assumptions <code>{{output.description}}</code> from <code>{{before}}</code> to <code>{{after}}</code> in logical framework <code>{{logicalFrame.name}}</code>",

			logicalFrames_purposes_outputs_activities_add: "Add activity <code>{{item.description}}</code> to logical framework <code>{{logicalFrame.name}}</code>",
			logicalFrames_purposes_outputs_activities_move: "Reorder activities in logical framework <code>{{logicalFrame.name}}</code>",
			logicalFrames_purposes_outputs_activities_remove: "Remove activity <code>{{item.description}}</code> from logical framework <code>{{logicalFrame.name}}</code>",
			logicalFrames_purposes_outputs_activities_description_replace: "Change activity description <code>{{before}}</code> to <code>{{after}}</code> in logical framework <code>{{logicalFrame.name}}</code>",

			logicalFrames_indicators_add: "Add indicator <code>{{item.display}}</code> in logical framework <code>{{logicalFrame.name}}</code>",
			logicalFrames_indicators_move: "Move indicator <code>{{item.display}}</code> in logical framework <code>{{logicalFrame.name}}</code>",
			logicalFrames_indicators_remove: "Remove indicator <code>{{item.display}}</code> from logical framework <code>{{logicalFrame.name}}</code>",
			logicalFrames_indicators_baseline_replace: "Change baseline of indicator <code>{{indicator.display}}</code> from <code>{{before}}</code> vers <code>{{after}}</code> in logical framework <code>{{logicalFrame.name}}</code>",
			logicalFrames_indicators_target_replace: "Change target of indicator <code>{{indicator.display}}</code> from <code>{{before}}</code> to <code>{{after}}</code> in logical framework <code>{{logicalFrame.name}}</code>",
			logicalFrames_indicators_display_replace: "Rename indicator <code>{{before}}</code> to <code>{{after}}</code> in logical framework <code>{{logicalFrame.name}}</code>",
			logicalFrames_indicators_colorize_replace: "Change indicator <code>{{indicator.display}}</code> colorization from <code>{{before}}</code> to <code>{{after}}</code> in logical framework <code>{{logicalFrame.name}}</code>",
			logicalFrames_indicators_computation_replace: "Change indicator <code>{{indicator.display}}</code> computation in logical framework <code>{{logicalFrame.name}}</code>",

			extraIndicators_add: "Add extra indicator <code>{{item.display}}</code>",
			extraIndicators_move: "Reorder extra indicators",
			extraIndicators_remove: "Deletee extra indicator <code>{{item.display}}</code>",
			extraIndicators_baseline_replace: "Change baseline of extra indicator <code>{{extraIndicator.display}}</code> from <code>{{before}}</code> to <code>{{after}}</code>",
			extraIndicators_target_replace: "Change target of extra indicator <code>{{extraIndicator.display}}</code> from <code>{{before}}</code> to <code>{{after}}</code>",
			extraIndicators_display_replace: "Rename extra indicator <code>{{before}}</code> to <code>{{after}}</code>",
			extraIndicators_colorize_replace: "Change extra indicator <code>{{extraIndicator.display}}</code> colorization from <code>{{before}}</code> to <code>{{after}}</code>",
			extraIndicators_computation_replace: "Change extra indicator <code>{{extraIndicator.display}}</code> computation",
		},

		form_error_short: "Some fields are invalid in the form.",
		form_persisted_short: "You did not made changes.",
		form_changed_short: "You made changes.",

		form_error: "Some fields are invalid in the form, fix them in order to save.",
		form_persisted: "Your data is saved.",
		form_changed: "You made changes. Don't forget to click on Save.",

		show_more_inputs: "See older dates",
		all_elements: "All",
		no_extra_indicators: "No extra indicator has been created yet. Click on \"Add indicator\" to create one!",
		no_data_source: "<span style=\"font-style: italic\">No data sources are ready for data entry</span>",
		general_info: "General information",
		indicator_computation_missing: "Calculation is missing",
		which_variable: "From which variable does this information comes from?",
		which_partitions: "Which disaggregations are relevant?",
		value_unknown: "Unknown value",

		computations: {
			unavailable: "It is not possible to compute this indicator",
			copy: "Copy a value (from a data source)",
			percentage: "Percentage (from data sources)",
			permille: "Per thousands (from data sources)",
			formula: "Custom formula (from data sources)"
		},

		formula: {
			copied_value: "Value to copy",
			denominator: "Denominator",
			numerator: "Numerator"
		},

		specific_start: "Specific start date",
		specific_end: "Specific end date",

		partition_edit: "Disaggregation edition",
		partition_help_name: "This name will appear on multiple reporting tables. It names the disaggregation that you want to create on your variable",
		partition_help_elements: 'Elements from the disaggregation must be mutually exclusive, and it should be possible to find the total value by aggregating them.',
		partition_help_aggregation: 'How to find the total value by aggregating the elements described above?',
		partition_help_groups: 'Groups allow making intermediary aggregations',
		logical_frame: "Logical framework",

		no_data: "This data is not available",

		saving_failed: "Unable to save the changes, probably because of connectivity issues. Keep this window open, and try saving again once you are connected to the internet.",

		partition_general: "General",
		partition_general_placeholder: "ex: Age group, gender, motive for consultation, pathology, referral status, ...",
		partition_elements: "Elements",
		aggregation_lab: "How to group elements together?",
		partition_name: "Name",
		partition_name_placeholder: "ex: Less than 12 years old, male, social consultation, flu, community referral, ...",
		no_partition_elements: "Click \"Add\" to add a new element to the disaggregation",

		partition_group_name: "Name",
		partition_group_name_placeholder: "ex: Minors, chronic pathologies, ...",
		no_partition_groups: "Click \"Add\" to add a new group to the disaggregation",
		use_groups: "Use groups",

		no_inputs: "You are all done. There are no expected inputs",
		no_variable: "No variable is defined on this data source. Click \"Add a variable\" to create one!",
		no_partitions: "No disaggregations are defined on this variable",

		dimensions: {
			day: "Days",
			month_week_sat: 'Weeks (saturday to friday / split by month)',
			month_week_sun: 'Weeks (sunday to saturday / split by month)',
			month_week_mon: 'Weeks (monday to sunday / split by month)',
			week_sat: "Weeks (saturday to friday)",
			week_sun: "Weeks (sunday to saturday)",
			week_mon: "Weeks (monday to sunday)",
			month: "Months",
			quarter: "Quarters",
			semester: "Semesters",
			year: "Years",
			entity: "Collection site",
			group: "Collection group"
		},

		edit_user: "User edition",
		update_user: "Update the user",

		user: "User",

		parameter: "Parameter",
		unnamed_logframe: "Unnamed logical framework",

		edit_indicator: "Edit indicator",
		display: "Name",
		display_ph: "i.e. ANC1 rate for the health centers",
		computation: "Computation",

		show_finished: "See all data entries",
		are_you_sure_to_uninvite: "Are you sure that you want to remove this project from your list? The owner will have to invite you again if you need access later. Confirm to remove.",
		are_you_sure_to_delete: "Are you sure that you want to delete this project? Confirm to delete.",
		data_selection: "Data selection",
		filters: "Filters",
		input_status: {
			'done': "Edit ({{100*value|number:0}}%)",
			'expected': "Create",
		},
		cols: "Columns",
		rows: "Rows",
		entity: "Collection site",
		select_cols: "Please select columns",
		select_rows: "Please select rows",
		pivot_table: "Pivot table",

		groups: "Groups",
		basics: "Basics",
		general: "General",

		partitions: "Disaggregations",

		add_variable: "Add a variable",
		remove_variable: "Remove this variable",
		add_partition: "Add a disaggregation",

		aggregation: {
			sum: "Sum",
			average: "Average",
			highest: "Take highest value",
			lowest: "Take lowest value",
			last: "Take last value",
			none: "It's not possible to compute this"
		},

		covered_period: "Covered period",

		collection_site_list: "Collection sites",
		collection_form_list: "Data sources",

		collection_site: "Collection site",
		collection_form: "Data source",
		collection_form2: "Data entry sheet",

		collection_form_planning: "Calendar",
		collection_form_structure: "Structure",

		variable: "Variable",

		no_purposes: "No purposes were defined yet",

		form_name_ph: "For instance: NHIS data, Ante-natal care tally sheet, PHC tally sheet, ...",

		entity_name: "Site name",
		group_name: "Group name",
		entity_name_placeholder: "For instance: Health center X, Hospital X, ...",
		group_name_placeholder: "ex: Regional hospitals, North of the country, ...",

		create: "Create new project",
		periodicity: "Periodicity",
		start: 'Project start',
		end: 'Project end',

		periodicities: {
			day: "Every day",
			month_week_sat: 'Every weeks (saturday to friday / split by month)',
			month_week_sun: 'Every weeks (sunday to saturday / split by month)',
			month_week_mon: 'Every weeks (monday to sunday / split by month)',
			week_sat: "Every week (saturday to friday)",
			week_sun: "Every week (sunday to saturday)",
			week_mon: "Every week (monday to sunday)",
			month: 'Every month',
			quarter: 'Every quarter',
			semester: 'Every semester',
			year: "Every year",
		},

		no_input_entities: 'No collection site was created yet!',
		no_input_groups: 'No collection group was created yet!',

		input: 'Input',

		baseline: 'Baseline',
		target: 'Target',

		goal: 'General objective',
		intervention_logic: 'Description',

		start_date: "Begin date",
		end_date: "End date",
		country_ph: 'For instance: CAR',
		name_ph: 'e.g. Access to quality care for people affected by the crisis',
		add_indicator: 'Add indicator',

		purpose: 'Specific objective',
		purposes: 'Specific objectives',
		assumptions: 'Assumptions',
		output: "Result",

		indicator_is_computed: "Valid",
		indicator_is_not_computed: "Invalid",

		intervention_logic_goal_ph: 'e.g. Reduce mortality and morbidity of the populations affected by the crisis',
		intervention_logic_purpose_ph: 'e.g. Improve access to health care for population affected by the crisis in the districts of Bimbo and Begoua',
		output_desc_ph: 'e.g. Improve primary health care at Bimbo and Begoua health centers',
		assumptions_purpose_ph: '',
		output_assumptions_ph: '',
		logframe_ph_name: "e.g. ECHO",

		specific_dates: 'Validity duration',
		specific_dates_yes: 'Use dates which are specific to this logical framework',
		specific_dates_use_project: 'Use the same dates than the project',
		logframe_edit_help_specificdates: `If this logical frame is valid only during a part of the project, it can be entered here`,
		logframe_edit_help_start: "Date from which indicators will be computed for this logical framework",
		logframe_edit_help_end: "Date until which indicators will be computed for this logical framework",

		logframe_help_sites: "Among sites identified in \"Collection sites\", which one are relevant for this logical framework?",
		logframe_help_name: "Name this logical framework to be able to identify it easily. For instance, with the name of the relevant donor",
		logframe_help_goal: "Describe the project\'s contribution on a program or policy",
		logframe_help_goal_indicators: "Enter here the indicators that allow to measure the general objective",
		logframe_help_purpose_desc: "Describe the tangible advantages that are provided to the beneficiaries",
		logframe_help_purpose_assumptions: "External factors that could jeopardize reaching the specific objective",
		logframe_help_purpose_indicators: "Enter here the indicators that allow to measure the specific objective",
		logframe_help_output_desc: "Product or tangible service brought by the project",
		logframe_help_output_assumptions: "External factors that could jeopardize reaching the result",
		logframe_help_output_indicators: "Enter here the indicators that allow to measure the result",

		add_output: 'Add a new result',
		add_purpose: 'Add a new specific objective',

		basics_help_country: "In which country does your project takes place? If it's a regional project enter the name of the region.",
		basics_help_name: "The project's name allow finding your project in Monitool. Choose something that is informative enought, or copy the general objective.",
		basics_help_begin: "The begin date is the moment when your projects starts collecting data (usually, with the first activities)",
		basics_help_end: "The end date is the moment when your project closes its data collection. If unknown, enter a date far into the future.",

		collection_edit_help_name: "What is the name of the data source that you want to extract data from? i.e. \"Electronic medical record\", \"Health center tally sheet\", \"NHIS report\", ...",
		collection_edit_help_sites: "Among sites identified in \"Collection sites\", which one collect this data source?",
		collection_edit_help_periodicity: "How often is this data available? Take care, this is not the same thing as the frenquency of the reports that you need to provide.",

		collection_edit_help_varname: "Name the variable that you want to extract from <code>{{name}}</code>. i.e. \"Number of diagnostics\".",
		collection_edit_help_geoagg: "In a project with two sites, if <code>{{name}}</code> is 10 for the first and 20 for the second, what is the value for the complete project?",
		collection_edit_help_timeagg: "In a project collecting monthly data, if <code>{{name}}</code> is 10 in january, 20 in february and 30 in march, what is the value for the first quarter?",
		collection_edit_help_partition: "Do we want to be able to differenciate <code>{{name}}</code> by age, gender, type of care, consultation motive, pathology, hour of the day, referral type, ...?<br/>Do not disaggregate by location: your collection sites were already filled in the relevant page.",
		collection_edit_help_distribution: "If you wish to print the forms in A4 format, prefer having the titles at the left of the tables, to shorten their width.",
		collection_edit_help_order: "How do you wish to show the disaggregations on the input form?",

		download_portrait: "Download PDF (portrait)",
		download_landscape: "Download PDF (landscape)",

		titles: "Titles",
		data: "Data",
		general_informations: "General informations",
		fill_with_last_input: "Fill with data from the previous entry",
		fill_with_zeros: "Fill missing data with zeros",

		variable_name_label: "What are your measuring?",
		variable_name_ph: "ex: Number of diagnostics",
		site_agg_label: "How to group entries from different sites?",
		time_agg_label: "How to group entries from different periods?",
		partitions_label: "Which disaggregations should be used on this variable?",
		distribution_label: "Where should disaggregation elements be displayed on the forms?",
		order_label: "In which order should the disaggregations be shown?",
		delete_purpose: "Delete specific objective",
		delete_result: "Delete result",

		no_element_selected: "No element is selected",

		indicator_ph_fixed: "Enter the constant value for the indicator (e.g. 12)",
		indicator_help_description: "Context of the data collection, details on how to compute the indicator...",
		indicator_help_display: "Name your indicator. The name should come from a catalog to be consistent with other projects.",
		indicator_help_baseline: "What was the value of the indicator before the first activities? Tick the checkbox to specify.",
		indicator_help_target: "What is the target for this indicator? Tick the checkbox to specify.",
		indicator_help_colorize: "Do you wish to have colors (red, orange, green) on reporting for this indicator?",
		indicator_help_computation: "How to compute this indicator from the variables that you collected in data sources?",

		activity: "Activity",
		add_activity: "Add a new activity",
		delete_activity: "Delete activity",
		activity_desc_ph: "e.g. Awareness sessions on HIV transmission",
		logframe_help_activity_desc: "Activity realized by the NGO",
		logframe_help_activity_indicators: "Enter here the indicators that allows to measure the activity progress",

		form_is_not_associated_with_site: "This data source is not associated with any collection site."
	},

	form: {
		create_blank: "Create a blank logical framework",
	},

	indicator: {
		missing_description: "<i>The description of this indicator was not filled</i>",
		extra: "Extra indicators",
	}
};

