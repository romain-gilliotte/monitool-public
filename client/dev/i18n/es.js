"use strict";

var SPANISH_LOCALE = {
	id: "es-es",
	DATETIME_FORMATS: {
		AMPMS: [ "a. m.", "p. m." ],
		DAY: [ "domingo", "lunes", "martes", "mi\u00e9rcoles", "jueves", "viernes", "s\u00e1bado" ],
		MONTH: [ "enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre" ],
		SHORTDAY: [ "dom.", "lun.", "mar.", "mi\u00e9.", "jue.", "vie.", "s\u00e1b." ],
		SHORTMONTH: [ "ene.", "feb.", "mar.", "abr.", "may.", "jun.", "jul.", "ago.", "sept.", "oct.", "nov.", "dic." ],
		fullDate: "EEEE, d 'de' MMMM 'de' y",
		longDate: "d 'de' MMMM 'de' y",
		medium: "d 'de' MMM 'de' y H:mm:ss",
		mediumDate: "d 'de' MMM 'de' y",
		mediumTime: "H:mm:ss",
		short: "d/M/yy H:mm",
		shortDate: "d/M/yy",
		shortTime: "H:mm"
	},
	NUMBER_FORMATS: {
		CURRENCY_SYM: "\u20ac",
		DECIMAL_SEP: ",",
		GROUP_SEP: ".",
		PATTERNS: [
			{
				gSize: 3,
				lgSize: 3,
				maxFrac: 3,
				minFrac: 0,
				minInt: 1,
				negPre: "-",
				negSuf: "",
				posPre: "",
				posSuf: ""
			},
			{
				gSize: 3,
				lgSize: 3,
				maxFrac: 2,
				minFrac: 2,
				minInt: 1,
				negPre: "-",
				negSuf: "\u00a0\u00a4",
				posPre: "",
				posSuf: "\u00a0\u00a4"
			}
		]
	},
	pluralCat: function(n, opt_precision) {
		if (n == 1)
			return PLURAL_CATEGORY.ONE;
		return PLURAL_CATEGORY.OTHER;
	}
};






var SPANISH_TRANSLATION = {
	shared: {
		sum: "Suma",
		include: "Incluir",
		toggle: "Cambiar",
		toggle_all: "Cambiar todos",

		date: "Fecha",
		administrator: "Administrador",

		back_to_intranet: "Volver a la intranet",
		settings: "Configuración",
		projects: 'Proyectos',
		project: 'Proyecto',
		users: "Usuarios",
		indicator: 'Indicador',
		indicators: 'Indicadores',
		indicators_catalog: 'Catálogo de indicadores',
		help: 'Ayuda',
		input_entities: 'Lugares de actividad',
		input_groups: 'Grupos de actividad',
		input_entity: 'Lugar de actividad',
		input_group: 'Grupo de actividad',

		name: 'Nombre',
		begin: 'Principio',
		end: 'Fin',

		add: 'Añadir',
		save: 'Guardar',
		remove: 'Quitar',
		remove_changes: 'Cancelar los cambios',
		edit: 'Modificar',
		'delete': 'Suprimir',

		view_stats: 'Ver las estadísticas',
		members: 'Miembros',
		
		day: 'Dia',
		week: 'Semana',
		month: 'Mes',
		quarter: "Trimestre",
		year: "Año",

		done: 'Hecho',
		copy: 'Copiar',
		choose: 'Elegir',
		edition: 'Edición',
		cancel: 'Cancelar',
		logical_frame: 'Marco lógico',
		description: 'Descripción',
		reporting: 'Estadísticas',
		reporting_analysis: "Análisis descriptivo",
		columns: "Columnas",
		colorize: 'Colorear',
		display: 'Mostrar',
		values: 'Indicadores marco lógico',
		target_percentage: 'Progreso marco lógico',
		plot: 'Mostrar gráfico',
		download_plot: 'Descargar el gráfico',
		download_table: 'Descargar la tabla',
		unknown_indicator: "Indicador no conocido",
		active: "Activo",

		choose_indicator: 'Elige un indicador',
		list: 'Lista',
		logout: 'Desconectar',
		change_password: "Cambiar contraseña",
		detach: "Desconectar",

		stay_here_check: 'Ha realizado cambios. Selectione acceptar para quedarse en esta página, cancelar para perder los cambios.',
		filter: "Filtro"
	},
	menu: {
		toggle_nav: "Ver el menu",
		language: "Idiomas",
		french: "Francés",
		spanish: "Español",
		english: "Inglés",
	},
	project: {
		running: "Proyectos en progreso",
		finished: "Proyectos terminados",
		noproject: "Ningún proyecto corresponde a este criterio",
		inputs: "Entradas",

		last_input: "Última entrada: ",

		value: "Valor",
		raw_data: "Datos en bruto",
		planning: "Planificación",
		indicators_computation: "Cálculo de los indicadores",
		partition: "Partición",
		additional_partition: "Partición adicional",
		new_partition: "Añadir una partición",
		variable: "Variable",
		new_variable: "Añadir una variable",
		section: "Apartado",
		new_section: "Añadir un apartado",
		see_partitions: "Ver las particiones selectionadas",

		unknown: "Desconocido",
		color: "Color",
		red_for_target: "Rojo si el objetivo esta alcanzado a",
		orange_for_target: "Naranja para objetivo entre {{value}}% y ",
		green_for_target: "Verde para objetivo alcanzado a {{value}}%",
		what_is_progress: "¿Qué es un \"objetivo alcanzado a 34%\"?",
		what_is_progress_detail:
			"Se pueden colorear unicamente los indicadores que informan su valor de base <strong>y</strong> objetivo.<br/>" + 
			"Luego se compara proporcionalmente cada entrada entre esos dos valores.",

		specs: "Especificaciones",
		indicators_management: "Seguimiento de indicadores",
		additional_indicators: "Indicadores adicionales",
		no_additional_indicators: "Ningun indicador adicional ha sido definido",
		no_purposes: "Ningun objetivo específico ha sido definido",

		input_form_list: "Lista de los formularios",
		indicator_distribution: "Distribución de los indicadores por formulario y período",
		add_new_indicator_to_form: "Añadir un nuevo indicator al formulario",

		form_name_ph: "ej: Recuperación mensual en los centros de salud",
		collect: "Recuperar por",

		analysis: "Análisis",
		analysis_insert_data: "Insertar datos",
		analysis_insert_text: "Insertar texto",
		analysis_up_next: "Subir",
		analysis_down_next: "Bajar",
		analysis_delete_next: "Suprimir",
		analysis_data: "Mostrar",
		analysis_table: "Tabla",
		analysis_graph: "Gráfico",
		analysis_both: "Tabla & Gráfico",
		report_name_ph: "ex: Análisis descriptivo mensual de mayo 2015",
		no_reports: "Ningún analisis descriptivo ha sido creado!",

		source: "Origen",
		source_ph: "Ej: NHIS local",
		in_charge: "Persona responsable",
		in_charge_ph: "Ex: Enfermera del proyecto",

		missing_mandatory_indicators: "Indicadores obligatorios",
		other_indicators: "Otros indicadores",
		see_other_themes: "Ver tambien las otra temáticas",

		entity_name: "Nombre de la estructura o del lugar de intervención",
		group_name: "Nombre del grupo",
		entity_name_placeholder: "ej: Centro de salud X, Hospital X, ...",
		group_name_placeholder: "ej: Hospitales regionales, parte Norte del país, ...",

		logical_frame_tooltip: 'Describe los objectivos, resultados esperados et actividades del proyecto.',
		input_entities_tooltip: 'Lista de los lugares de actividad donde se collectan los indicadores. Por ejemplo hospitales, centros de salud, pueblos...',
		input_groups_tooltip: 'Permite reunir lugares de actividad en categorias logicas.',
		input_forms_tooltip: 'Contiene la declaración de los diferentes formularios que permiten collectar los indicadores.',
		waiting_inputs_tooltip: '',
		reporting_tooltip: '',

		create: "Crear un nuevo proyecto",
		input_forms: 'Formularios',
		input_form: 'Formulario',
		data_collection: 'Recuperación de los datos',
		periodicity: "Periodicidad",
		begin: 'Principio del proyecto',
		end: 'Fin del proyecto',

		sumable: 'Somable',
		input_field: 'Campo de entrada',
		value_source: 'Origen del valor',
		input_mode: 'Modo de entrada',
		manual_input: 'Entrada manual',

		periodicities: {
			day: 'Diario',
			week: 'Cada semana',
			month: 'Cada mes',
			quarter: 'Cada trimestre',
			year: 'Cada año',
		},
		collects: {
			entity: "Lugar de actividad",
			project: "Proyecto"
		},
		
		planned: 'Planificado',
		add_intermediary: "Añadir una fecha",
		intermediary_periods: "Fechas adicionales",

		no_input_entities: '¡Ningún lugar de actividad ha sido creado!',
		no_input_groups: '¡Ningún grupo de actividad ha sido creado!',
		no_forms: '¡Ningún formulario ha sido creado!',
		no_indicators: 'Ningún indicador ha sido definido en este proyecto',

		waiting_inputs: 'Entradas en espera',
		finished_inputs: 'Entradas realizadas',
		invalid_inputs: 'Entradas fuera de calendario',

		no_inputs: 'Ninguna entrada corresponder a este criterio.',
		input: 'Entrar datos',

		relevance: 'Pertinencia',
		relevance_ph: '¿Porqué quiere colectar este indicador?',
		limits: 'Limites',
		minimum_ph: 'minimo',
		maximum_ph: 'maximo',
		orange_zone: 'Zona Naranja',
		green_zone: 'Zona Verde',
		baseline: 'Valor de base',
		baseline_ph: 'Valor de referencia',
		target_ph: 'Valor del objetivo',
		target: 'Objectivo',
		add_target: 'Añadir un objetivo',
		general_data: 'Datos generales',

		goal: 'Objectivo global',
		goal_short: "OG",
		intervention_logic: 'Logica de intervención',
		intervention_logic_goal_ph: 'Descripción de la contribución del proyecto a los objectivos (impacto) de una política o de un programa',
		intervention_logic_purpose_ph: 'Descripción de las ventajas directas destinadas a los beneficiarios',
		assumptions_purpose_ph: 'Factores externos susceptibles de comprometer el alcanze del objetivo',
		purpose_short: 'OS',
		output_short: 'R',

		begin_date: "Fecha de inicio",
		end_date: "Fecha de fin",
		name_ph: 'Por ejemplo: [Laos] Reducción de riesgos',
		add_indicator: 'Añadir un indicador',

		purpose: 'Objectivo Específico',
		purposes: 'Objectivos Específicos',
		assumptions: 'Hipotesis',
		output: "Resultado",
		activity: 'Actividad',
		activities: 'Actividades',
		prerequisite: 'Requisito previo',
		activity_prereq_ph: '¿Qué requisitos previos se deben verificar antes de poder empezar esta actividad?',
		activity_desc_ph: 'Producto o servicio tangible aportado por el proyecto.',
		output_assumptions_ph: 'Factores externos susceptibles de comprometer el alcanze del resultado',
		output_desc_ph: 'Producto o servicio tangible aportado por el proyecto.',

		add_activity: 'Añadir una actividad',
		add_output: 'Añadir un resultado esperado',
		add_purpose: 'Añadir un objetivo específico',

		users: "Usuarios",
		owners: "Proprietarios",
		dataEntryOperators: "Capturistas",

		move_up: "Subir",
		move_down: "Bajar",

		indicator_source: "Adquisición",
		you_are_owner: "Puede editar este proyecto",
		you_are_editor: "Puede entrar indicadores en este proyecto",
		you_are_not_owner: "No puede editar este proyecto",
		you_are_not_editor: "No puede entrar indicadores en este proyecto",
		
		status_green: "Este indicador esta en zona verde",
		status_orange: "Este indicador esta en zona naranja",
		status_red: "Este indicador esta en zona roja",
		status_unknown: "Este indicador esta fuera<br/>de los limites establecidos<br/>en el marco lógico",

		formula: "Formula: {{name}}",
		link: "Vínculo: {{name}}",
		links: "Vínculos"
	},
	indicator: {
		search: "Buscar",
		search_ph: "Entre por lo menos 3 caracteres",

		standard: "Norma",
		sources: "Origen",
		comments: "Notas",
		standard_ph: "¿A que norma pertenece este indicador?",
		sources_ph: "¿Dónde se puede colectar este indicador?",
		comments_ph: "¿En qué casos es pertinente usar este indicador, y con qué limites?",
		metadata: "Metadatos",

		target: "Relación con el objetivo",
		higher_is_better: "Alcanzado si la entrada es superior al objetivo",
		lower_is_better: "Alcanzado si la entrada es inferior al objetivo",
		around_is_better: "Alcanzado si la entrada es igual al objetivo",
		non_relevant: "No pertinente",

		no_theme: 'Sin temática',
		no_type: 'Sin tipo',

		operation: "Modo de operación",

		name_ph: 'Por ejemplo: Porcentaje de fichas de paciente completas',
		definition_ph: 'Por ejemplo: Medir el nivel de formación del personal medical que completa las fichas de pacientes. Medir este indicador es facil en proyectos pequeños, evitar usarlo en otras circunstancias.',
		definition: 'Definición',
		core: 'Recomendado',
		unit: 'Unidad',
		other: 'Otro',
		percent: 'Porcentaje (%)',
		permille: 'Por mil (‰)',
		types: 'Tipos',
		themes: 'Temáticas',
		select_types: 'Selectione uno o varios tipos',
		select_themes: 'Selectione una o varias tématicas',
		categorization: 'Categorización',
		computation: 'Cálculo',
		sum_allowed: 'Somable',
		formula: 'Formula',
		formulas: 'Formulas',
		formula_name_ph: 'Por ejemplo: Porcentaje entre fichas completas y total',
		formula_expression_ph: 'Por ejemplo: 100 * a / b',
		add_formula: "Añadir una formula",
		parameter: 'Parametro',

		order_by: 'Ordenar por',
		alphabetical_order: 'Orden alfabético',
		num_inputs: 'Número de entradas',
		num_projects: 'Número de proyectos',
		create_new: 'Crear un nuevo indicador',

		themes_list: "Lista de temáticas",
		types_list: "Lista de tipos",
		num_indicators: 'Número de indicadores',
		
		new_type_name: "Nombre del nuevo tipo",
		new_theme_name: "Nombre de la nueva temática",
		only_core: "Ver unicamente los indicadores recomendados",

		is_mandatory: "Este indicador es obligatorio para esta temática",
		is_recommended: "Este indicador proviene del catálogo temático",
		is_common: "Este indicador es opcional",
		is_forbidden: "Este indicador es histórico y esta prohibido de uso para nuevos proyectos",
		is_external: "Este indicator viene de otra temática",

		time_aggregation: "Agregación en el tiempo",
		time_aggregation_sum: "Suma (por ejemplo: número de consultaciones, de nacimientos, ...)",
		time_aggregation_average: "Promedia no ponderada (por ejemplo: poblaciones, número de medicos, de vehiculos...)",
		time_aggregation_none: "No agregación directa posible (todas las tasas, porcentajes, indicadores calculados, ...)",

		what_is_aggregation: "¿Como llenar estos campos?",
		time_aggregation_help: [
			"<strong>Ayuda a la entrada</strong>",
			"<ul>",
				"<li>",
					"Si un hospital realiza 100 consultaciones en enero, febrero y marzo, habra realizado 300 en",
					"el curso del primer trimestre del año. El modo de agregación del indicador <strong>\"Número de consultaciones\"</strong>",
					"es <strong>\"suma\"</strong>",
				"</li>",
				"<li>",
					"Si una zona quirúrgica tiene una tasa de mortalidad de 5% en enero, 7% en febrero y 10% en marzo, no se puede calcular",
					"su tasa de mortalidad en el primer trimestre del año sin conocer el número de operaciones de cada mes.",
					"El modo de agregación del indicador <strong>\"Tasa de mortalidad postoperatoria\"</strong> valdra <strong>\"No agregación directa posible\"</strong>",
				"</li>",
				"<li>",
					"Si un pueblo tiene una población de 510 habitantes en enero, 600 en febrero y 550 en marzo, podemos decir que su población",
					"en el primero trimestre del año vale 553. El modo de agregación del indicador <strong>\"Población\"</strong> es",
					"<strong>\"Promedia no ponderada\"</strong>",
				"</li>",
			"</ul>"
		].join(' '),

		geo_aggregation: "Agregación geografica",
		geo_aggregation_sum: "Suma (por ejemplo: población, número de medicos, de vehiculos disponibles, de consultaciones, de nacimientos, ...)",
		geo_aggregation_average: "Promedia no ponderada (usar unicamente para indicadores que son promedios por lugar de actividad)",
		geo_aggregation_none: "No agregación directa posible (todas las tasas, porcentajes, indicadores calculados, ...)",
	},
	login: {
		error: "Usuario o contraseña inválido",
		please_connect: "Conectese",
		login: 'Usuario',
		password: "Contraseña",
		connect: "Conectar",
		change_password_please: "Entre su nueva contraseña",
		new_password: "Contraseña",
		new_password_again: "Repita su contraseña",
		change_password: "Cambiar"
	},
	form: {
		mandatory: "Este campo es obligatorio",
		begin_lower_than_end: 'La fecha de inicio tiene que ser inferior a la de fin',
		end_greater_than_begin: 'la fecha de fin tiene que ser superior a la de inicio',
	}
};

