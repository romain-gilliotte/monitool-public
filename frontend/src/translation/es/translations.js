export default {
    shared: {
        yes: 'Si',
        no: 'No',
        archive: 'Archivar',
        enable: 'Activar',
        disable: 'Deactivar',
        accept_invitation: 'Acceptar',
        refuse_invitation: 'Declinar',
        uninvite: 'Eliminar de mis proyectos',
        no_invitations: 'No tiene invitaciones pendientes!',
        no_invitations_back: 'Regrese a la lista de sus proyectos',

        configure: 'Configuración',
        back: 'Volver',
        project_list: 'Lista de proyectos',
        none: 'Ninguna',
        percentage_done: '{{value}}% realizado',
        percentage_incomplete: '{{value}}% en curso',
        percentage_missing: '{{value}}% por hacer',

        task: 'Tarea',
        state: 'Estado',
        open: 'Abrir',
        loading: 'Cargando...',
        restore: 'Restaurar',
        description: 'Descripción',

        country: 'País',
        apply: 'Aplicar los cambios',
        clone: 'Clonar',
        clone_structure: 'Clonar estructura',
        clone_all: 'Clonar estructura y datos',
        home: 'Inicio',

        date: 'Fecha',

        project: 'Proyecto',
        indicator: 'Indicador',
        indicators: 'Indicadores',
        help: 'Preguntas frecuentes',
        name: 'Nombre',
        start: 'Principio',
        end: 'Fin',

        add: 'Añadir',
        save: 'Guardar',
        remove: 'Quitar',
        remove_changes: 'Cancelar los cambios',
        edit: 'Modificar',
        delete: 'Suprimir',

        members: 'Miembros',

        logical_frames: 'Marcos lógicos',
        reporting: 'Informe',
        reporting_general: 'Informe general',
        colorize: 'Colorear',

        logout: 'Desconectar',

        sure_to_leave:
            'Ha realizado cambios. ¿Esta seguro de querer cambiar de página sin guardar?',
    },
    menu: {
        language: 'Idiomas',
        french: 'Francés',
        spanish: 'Español',
        english: 'Inglés',
    },
    welcome: {
        i_got_it: 'He entendido',
        text: /* html */ `
            <legend>¡Bienvenido!</legend>
            <p>Es su primera visita a Monitool.</p>
            <p>
                Para ayudarlo a comprender la herramienta, hemos creado un primer proyecto en su
                espacio!<br />
                Utiliza la mayor parte de las funcionalidades de la herramienta y puede usarse como referencia.
            </p>
            <ul>
                <li>
                    Para ver sus informes e ingresar nuevos datos, haga clic en
                    <span class="btn btn-default btn-xxs">
                        <i class="fa fa-fw fa-play"></i>
                        <span>Abrir</span>
                    </span>
                </li>
                <li>
                Para acceder a su configuración, haga clic en
                <span class="btn btn-default btn-xxs"><span class="caret"></span></span>
                luego en
                <span class="btn btn-default btn-xxs">
                    <i class="fa fa-fw fa-cogs"></i>
                    <span>Configuración</span>
                </span>
                </li>
            </ul>
            <p>
                En todas las páginas, hay un panel de ayuda disponible.<br />
                Su contenido se adapta a la página en la que se encuentra, ¡no dude en consultarlo!<br />
                Para acceder a él:
            </p>
            <ul style="margin-bottom: 20px">
                <li>Mueva el puntero del mouse sobre la barra lateral a la derecha de su pantalla.</li>
                <li>Espera un momento.</li>
            </ul>
        `,
    },
    invitation: {
        no_invitations_yet: 'Aún no ha invitado a otras personas a participar en su proyecto',
        add_invitation: 'Invitar a una persona',
        email: 'Correo electrónico',
        help_email: '¿Cuál es la dirección de correo electrónico de la persona que desea invitar?',
        help_sites: '¿En qué puntos de recolección puede ingresar esta persona?',
        help_datasources: '¿En qué fuentes de datos puede ingresar esta persona?',
        accepted: 'Aceptado',
        contact: 'Contacto',
        data_entry_perms: 'Permisos para ingresar datos',
        create_invitation: 'Enviar invitación',
        update_invitation: 'Actualizar invitación',
    },
    project: {
        original_file: 'Fichero original',
        uploads: 'Formularios en papel & Excel',
        no_logframe_yet: 'Aún no ha creado ningún marco logico en este proyecto',
        show_all_projects: 'Display all projects ({{count}})',
        no_projects: 'No tiene ningún proyecto',
        download_portrait: 'Descargar PDF (vertical)',
        download_landscape: 'Descargar PDF (horizontal)',
        download_excel: 'Descargar Excel',

        time_to_fill: 'Tiempo de ingreso estimado',
        confirm_delete_site: `Si elimina este sitio, ya no podrá acceder a sus datos en los informes. Confirme para eliminar.`,
        confirm_delete_datasource: `Si elimina esta fuente de datos, ya no podrá acceder a sus datos en informes o a los indicadores que dependen de ella. Confirme para eliminar.`,
        no_invitations_yet: 'Todavía no ha invitado a otras personas a participar en su proyecto',
        add_invitation: 'Invitar a una persona',
        email: 'Correo electrónico',
        user_help_email:
            '¿Cuál es la dirección de correo electrónico del usuario que desea invitar?',
        total: 'Total',
        variables: 'Variables',
        owner: 'Proprietario',
        invitations: 'Invitaciones',
        downloads: 'Descargas',
        last_entry: 'Última entrada',
        show_totals: 'Mostrar totales',
        add_datasource: 'Crear una nueva fuente de datos',
        no_matches: 'Ningún proyecto corresponde a sus criterios de búsqueda',
        is_finished: 'Este proyecto esta terminado',
        was_archived: 'Este proyecto fue archivado',
        show_ongoing_projects: 'Mostrar proyectos en curso ({{count}})',
        show_finished_projects: 'Mostrar proyectos terminados ({{count}})',
        show_archived_projects: 'Mostrar proyectos archivados ({{count}})',
        filter_placeholder: 'Entre texto para buscar proyectos',

        revisions: 'Historial',
        revision_datetime: 'Fecha & Usuario',
        revision_changes: 'Cambios',
        revision_restore: 'Volver a este punto',
        revision_save_to_confirm: 'Guarde para confirmar que desea volver a este punto',
        revision_is_equivalent: 'Este punto es equivalente al estado actual del proyecto',
        revision_none: 'No hay historial en este proyecto',
        revision_show_more: 'Ver cambios mas antiguos',

        history: {
            active_replace: "{{after ? 'Restaura' : 'Elimina'}} el proyecto",
            name_replace:
                'Cambia el nombre del proyecto de <code>{{before}}</code> a <code>{{after}}</code>',
            start_replace:
                'Cambia el inicio del proyecto de <code>{{before|date}}</code> a <code>{{after|date}}</code>',
            end_replace:
                'Cambia el final del proyecto de <code>{{before|date}}</code> a <code>{{after|date}}</code>',
            country_replace:
                'Cambia el país del proyecto de <code>{{before}}</code> a <code>{{after}}</code>',

            entities_add: 'Añade el lugar <code>{{item.name}}</code>',
            entities_move: 'Reordena los lugares del proyecto',
            entities_remove: 'Elimina el lugar <code>{{item.name}}</code>',
            entities_name_replace:
                'Cambia el nombre del lugar <code>{{before}}</code> en <code>{{after}}</code>',
            entities_active_replace:
                "{{after ? 'Activa' : 'Desactiva'}} la entrada de datos en el lugar <code>{{entity.name}}</code>",

            groups_add: 'Añade el grupo <code>{{item.name}}</code>',
            groups_move: 'Reordena los grupos del proyecto',
            groups_remove: 'Elimina el grupo <code>{{item.name}}</code>',
            groups_name_replace:
                'Cambia el nombre del groupo <code>{{before}}</code> en <code>{{after}}</code>',
            groups_members_add:
                'Añade el lugar <code>{{item.name}}</code> al grupo <code>{{group.name}}</code>',
            groups_members_move: 'Reordena los lugares del grupo <code>{{group.name}}</code>',
            groups_members_remove:
                'Elimina el lugar <code>{{item.name}}</code> del grupo <code>{{group.name}}</code>',

            forms_add: 'Añade la fuente de datos <code>{{item.name}}</code>',
            forms_move: 'Reordena las fuentes de datos del proyecto',
            forms_replace:
                'Reemplaca la fuente de datos <code>{{before.name}}</code> por <code>{{after.name}}</code>',
            forms_remove: 'Elimina la fuente de datos <code>{{item.name}}</code>',
            forms_name_replace:
                'Cambia el nombre de la fuente de datos <code>{{before}}</code> en <code>{{after}}</code>',
            forms_periodicity_replace:
                'Cambia la periodicidad de <code>{{form.name}}</code> de <code>{{before}}</code> a <code>{{after}}</code>',
            forms_active_replace:
                "{{after ? 'Activa' : 'Desactiva'}} la entrada de datos en la fuente <code>{{form.name}}</code>",

            forms_entities_add:
                'Añade el lugar <code>{{item.name}}</code> a la fuente de datos <code>{{form.name}}</code>',
            forms_entities_move:
                'Reordena los lugares de la fuente de datos <code>{{form.name}}</code>',
            forms_entities_remove:
                'Elimina el lugar <code>{{item.name}}</code> de la fuente de datos <code>{{form.name}}</code>',
            forms_entities_replace:
                'Reemplaca el lugar <code>{{beforeItem.name}}</code> por <code>{{afterItem.name}}</code> en la fuente de datos <code>{{form.name}}</code>',

            forms_elements_add:
                'Añade la variable <code>{{item.name}}</code> en <code>{{form.name}}</code>',
            forms_elements_move:
                'Reordena las variables de la fuente de datos <code>{{form.name}}</code>',
            forms_elements_replace:
                'Remplaca la variable <code>{{before.name}}</code> por <code>{{after.name}}</code> en la fuente de datos <code>{{form.name}}</code>',
            forms_elements_remove:
                'Elimina la variable <code>{{item.name}}</code> en <code>{{form.name}}</code>',

            forms_elements_name_replace:
                'Cambia el nombre de la variable <code>{{before}}</code> en <code>{{after}}</code>',
            forms_elements_active_replace:
                "{{after ? 'Activa' : 'Desactiva'}} la entrada de datos de la variable <code>{{variable.name}}</code>",
            forms_elements_geoAgg_replace:
                'Cambia la regla de agregación (lugar) de <code>{{variable.name}}</code> de <code>{{before}}</code> a <code>{{after}}</code>',
            forms_elements_timeAgg_replace:
                'Cambia la regla de agregación (tiempo) de <code>{{variable.name}}</code> de <code>{{before}}</code> a <code>{{after}}</code>',
            forms_elements_distribution_replace:
                'Cambia la presentación de la entrada de datos de la variable <code>{{variable.name}}</code>',

            forms_elements_partitions_add:
                'Añade la desagregación <code>{{item.name}}</code> en <code>{{variable.name}}</code>',
            forms_elements_partitions_move:
                'Reordena las desagregaciones de <code>{{variable.name}}</code>',
            forms_elements_partitions_remove:
                'Elimina la desagregación <code>{{item.name}}</code> de <code>{{variable.name}}</code>',
            forms_elements_partitions_name_replace:
                'Cambia el nombre de la desagregación <code>{{before}}</code> en <code>{{after}}</code> en la variable <code>{{variable.name}}</code>',
            forms_elements_partitions_active_replace:
                "{{after ? 'Activa' : 'Desactiva'}} la entrada de datos en la desagregación <code>{{partition.name}}</code> de la variable <code>{{variable.name}}</code>",
            forms_elements_partitions_aggregation_replace:
                'Cambia la regla de agregación de <code>{{before}}</code> a <code>{{after}}</code> para la variable <code>{{variable.name}}</code>',

            forms_elements_partitions_elements_add:
                'Añade el elemento <code>{{item.name}}</code> en la desagregación <code>{{partition.name}}</code> de la variable <code>{{variable.name}}</code>',
            forms_elements_partitions_elements_move:
                'Reordena los elementos de la desagregación <code>{{partition.name}}</code> de la variable <code>{{variable.name}}</code>',
            forms_elements_partitions_elements_remove:
                'Elimina el elemento <code>{{item.name}}</code> en la desagregación <code>{{partition.name}}</code> de la variable <code>{{variable.name}}</code>',
            forms_elements_partitions_elements_name_replace:
                'Cambia el nombre de <code>{{before}}</code> en <code>{{after}}</code> en la desagregación <code>{{partition.name}}</code> de la variable <code>{{variable.name}}</code>',
            forms_elements_partitions_elements_active_replace:
                "{{after ? 'Activa' : 'Desactiva'}} la entrada de datos del elemento <code>{{element.name}}</code> en la desagregación <code>{{partition.name}}</code> de la variable <code>{{variable.name}}</code>",

            forms_elements_partitions_groups_add:
                'Añade el grupo <code>{{item.name}}</code> en la desagregación <code>{{partition.name}}</code> de la variable <code>{{variable.name}}</code>',
            forms_elements_partitions_groups_move:
                'Reordena los grupos de la desagregación <code>{{partition.name}}</code> de la variable <code>{{variable.name}}</code>',
            forms_elements_partitions_groups_remove:
                'Elimina el grupo <code>{{item.name}}</code> en la desagregación <code>{{partition.name}}</code> de la variable <code>{{variable.name}}</code>',
            forms_elements_partitions_groups_name_replace:
                'Cambia el nombre del groupo <code>{{before}}</code> en <code>{{after}}</code> en la desagregación <code>{{partition.name}}</code> de la variable <code>{{variable.name}}</code>',
            forms_elements_partitions_groups_members_add:
                'Añade <code>{{item.name}}</code> al grupo <code>{{group.name}}</code> en la desagregación <code>{{partition.name}}</code> de la variable <code>{{variable.name}}</code>',
            forms_elements_partitions_groups_members_move:
                'Reordena los miembros del grupo <code>{{group.name}}</code> en la desagregación <code>{{partition.name}}</code> de la variable <code>{{variable.name}}</code>',
            forms_elements_partitions_groups_members_remove:
                'Elimina <code>{{item.name}}</code> del grupo <code>{{group.name}}</code> en la desagregación <code>{{partition.name}}</code> de la variable <code>{{variable.name}}</code>',

            logicalFrames_add: 'Añade el marco lógico <code>{{item.name}}</code>',
            logicalFrames_move: 'Reordena los marcos lógicos',
            logicalFrames_remove: 'Elimina el marco lógico <code>{{item.name}}</code>',

            logicalFrames_entities_add:
                'Añade el lugar <code>{{item.name}}</code> al marco lógico <code>{{logicalFrame.name}}</code>',
            logicalFrames_entities_move:
                'Reordena los lugares del marco lógico <code>{{logicalFrame.name}}</code>',
            logicalFrames_entities_remove:
                'Elimina el lugar <code>{{item.name}}</code> del marco lógico <code>{{logicalFrame.name}}</code>',

            logicalFrames_name_replace:
                'Cambia el nombre del marco lógico <code>{{before}}</code> en <code>{{after}}</code>',
            logicalFrames_goal_replace:
                'Cambia el objectivo general <code>{{before}}</code> en <code>{{after}}</code> en el marco lógico <code>{{logicalFrame.name}}</code>',
            logicalFrames_start_replace:
                'Cambia el inicio <code>{{before}}</code> en <code>{{after}}</code> en el marco lógico <code>{{logicalFrame.name}}</code>',
            logicalFrames_end_replace:
                'Cambia el final <code>{{before}}</code> en <code>{{after}}</code> en el marco lógico <code>{{logicalFrame.name}}</code>',

            logicalFrames_purposes_add:
                'Añade el objectivo especifico <code>{{item.description}}</code> al marco lógico <code>{{logicalFrame.name}}</code>',
            logicalFrames_purposes_move:
                'Reordena los objectivos especificos del marco lógico <code>{{logicalFrame.name}}</code>',
            logicalFrames_purposes_remove:
                'Elimina el objectivo especifico <code>{{item.description}}</code> del marco lógico <code>{{logicalFrame.name}}</code>',
            logicalFrames_purposes_description_replace:
                'Cambia la descripción del objectivo especifico <code>{{before}}</code> en <code>{{after}}</code> en el marco lógico <code>{{logicalFrame.name}}</code>',
            logicalFrames_purposes_assumptions_replace:
                'Cambia las hypotesis del objectivo especifico <code>{{purpose.description}}</code> de <code>{{before}}</code> en <code>{{after}}</code> en el marco lógico <code>{{logicalFrame.name}}</code>',

            logicalFrames_purposes_outputs_add:
                'Añade el resultado <code>{{item.description}}</code> al marco lógico <code>{{logicalFrame.name}}</code>',
            logicalFrames_purposes_outputs_move:
                'Reordena los resultados del marco lógico <code>{{logicalFrame.name}}</code>',
            logicalFrames_purposes_outputs_remove:
                'Elimina el resultado <code>{{item.description}}</code> del marco lógico <code>{{logicalFrame.name}}</code>',
            logicalFrames_purposes_outputs_description_replace:
                'Cambia la descripción del resultado <code>{{before}}</code> en <code>{{after}}</code> en el marco lógico <code>{{logicalFrame.name}}</code>',
            logicalFrames_purposes_outputs_assumptions_replace:
                'Cambia las hypotesis del resultado <code>{{output.description}}</code> de <code>{{before}}</code> a <code>{{after}}</code> en el marco lógico <code>{{logicalFrame.name}}</code>',

            logicalFrames_purposes_outputs_activities_add:
                'Añade la actividad <code>{{item.description}}</code> al marco lógico <code>{{logicalFrame.name}}</code>',
            logicalFrames_purposes_outputs_activities_move:
                'Reordena las actividades del marco lógico <code>{{logicalFrame.name}}</code>',
            logicalFrames_purposes_outputs_activities_remove:
                'Elimina la actividad <code>{{item.description}}</code> del marco lógico <code>{{logicalFrame.name}}</code>',
            logicalFrames_purposes_outputs_activities_description_replace:
                'Cambia la descripción de la actividad <code>{{before}}</code> en <code>{{after}}</code> en el marco lógico <code>{{logicalFrame.name}}</code>',

            logicalFrames_indicators_add:
                'Añade el indicador <code>{{item.display}}</code> al marco lógico <code>{{logicalFrame.name}}</code>',
            logicalFrames_indicators_move:
                'Reordena los indicadores del marco lógico <code>{{logicalFrame.name}}</code>',
            logicalFrames_indicators_remove:
                'Elimina el indicador <code>{{item.display}}</code> del marco lógico <code>{{logicalFrame.name}}</code>',
            logicalFrames_indicators_baseline_replace:
                'Cambia el valor inicial del indicador <code>{{indicator.display}}</code> de <code>{{before}}</code> a <code>{{after}}</code> en el marco lógico <code>{{logicalFrame.name}}</code>',
            logicalFrames_indicators_target_replace:
                'Cambia el objetivo del indicador <code>{{indicator.display}}</code> de <code>{{before}}</code> a <code>{{after}}</code> en el marco lógico <code>{{logicalFrame.name}}</code>',
            logicalFrames_indicators_display_replace:
                'Cambia el nombre del indicador <code>{{before}}</code> en <code>{{after}}</code> en el marco lógico <code>{{logicalFrame.name}}</code>',
            logicalFrames_indicators_colorize_replace:
                'Cambia la colorización del indicador <code>{{indicator.display}}</code> de <code>{{before}}</code> a <code>{{after}}</code> en el marco lógico <code>{{logicalFrame.name}}</code>',
            logicalFrames_indicators_computation_replace:
                'Cambia el cálculo del indicador <code>{{indicator.display}}</code> del marco lógico <code>{{logicalFrame.name}}</code>',

            extraIndicators_add: 'Añade el indicador adicional <code>{{item.display}}</code>',
            extraIndicators_move: 'Reordena les indicadores adicionales',
            extraIndicators_remove: 'Elimina el indicador adicional <code>{{item.display}}</code>',
            extraIndicators_baseline_replace:
                'Cambia el valor inicial del indicador adicional <code>{{extraIndicator.display}}</code> de <code>{{before}}</code> a <code>{{after}}</code>',
            extraIndicators_target_replace:
                'Cambia el objetivo del indicador adicional <code>{{extraIndicator.display}}</code> de <code>{{before}}</code> a <code>{{after}}</code>',
            extraIndicators_display_replace:
                'Cambia el nombre del indicador adicional <code>{{before}}</code> en <code>{{after}}</code>',
            extraIndicators_colorize_replace:
                'Cambia la colorización del indicador adicional <code>{{extraIndicator.display}}</code> de <code>{{before}}</code> a <code>{{after}}</code>',
            extraIndicators_computation_replace:
                'Cambia el cálculo del indicador adicional <code>{{extraIndicator.display}}</code>',
        },

        form_error_short: 'Algunos campos del formulario no son validos.',
        form_persisted_short: 'No ha realizado cambios.',
        form_changed_short: 'Ha realizado cambios.',

        form_error: 'Algunos campos del formulario no son validos, arreglelos para poder guardar.',
        form_persisted: 'Sus datos estan guardados.',
        form_changed: 'Ha realizado cambios. No olvide hacer click en Guardar.',

        show_more_inputs: 'Ver la fechas anteriores',
        all_elements: 'Todo',
        no_extra_indicators: 'Ningún indicador adicional ha sido creado.',
        no_data_source_yet: 'Ninguna fuente de datos ha sido creada.',
        no_data_source:
            '<span style="font-style: italic">Ninguna fuente de datos esta lista para entrar datos</span>',
        general_info: 'Información general',
        indicator_computation_missing: 'Falta el cálculo',
        which_variable: 'De que variable viene esta información?',
        which_partitions: 'Qué desagregaciones son relevantes?',
        value_unknown: 'Valor desconocido',

        computations: {
            unavailable: 'No es posible calcular este indicador',
            copy: 'Copiar un valor (desde una fuente de datos)',
            percentage: 'Porcentaje (desde fuentes de datos)',
            permille: 'Por mil (desde fuentes de datos)',
            formula: 'Formula personalizada (desde fuentes de datos)',
        },

        formula: {
            copied_value: 'Valor a copiar',
            denominator: 'Denominador',
            numerator: 'Numerador',
        },

        specific_start: 'Fecha de inicio específica',
        specific_end: 'Fecha de final específica',

        partition_edit: 'Edición desagregación',
        partition_help_name:
            'Este nombre aparecera en varios informes. Identifica la desagregación que desea crear en su variable',
        partition_help_elements:
            'Los elementos de la desagregación deben ser mutualmente exclusivos, y se debe poder calcular el valor total agregandolos.',
        partition_help_aggregation:
            'Como calcular el valor total agregando los elementos describidos?',
        partition_help_groups: 'Los grupos permiten hacer agregaciones intermediarias',
        logical_frame: 'Marco lógico',

        no_data: 'Datos no disponibles',

        saving_failed:
            'No se pudieron guardar los cambios, probablemente porque no esta conectado a internet. Intente guardar de nuevo cuando se conecte a internet.',

        partition_general: 'General',
        partition_general_placeholder:
            'ej: Grupos de edad, sexo, motivo de consulta, patología, ...',
        partition_elements: 'Elementos',
        aggregation_lab: 'Como compilar los elements juntos?',
        partition_name: 'Nombre',
        partition_name_placeholder: 'ex: Menor de 12 años, hombre, consultación social, gripe, ...',
        no_partition_elements: 'Pulse "Añadir" para añadir un elemento en la desagregación',

        partition_group_name: 'Nombre',
        partition_group_name_placeholder: 'ej: Menores de edad, patologias crónicas, ...',
        no_partition_groups: 'Pulse "Añadir" para añadir un grupo en la desagregación',
        use_groups: 'Usar grupos',

        no_inputs: 'Ninguna entrada de datos en espera',
        no_variable:
            'Ninguna variable esta definida en esta fuente de datos. ¡Haga click en "Añadir una variable" para create una nueva!',
        no_partitions: 'Ninguna desagregación esta definida en esta variable',

        dimensions: {
            day: 'Días',
            month_week_sat: 'Semana (sábado a viernes / cortado por mes)',
            month_week_sun: 'Semana (domingo a sábado / cortado por mes)',
            month_week_mon: 'Semana (lunes a domingo / cortado por mes)',
            week_sat: 'Semanas (sábado a viernes)',
            week_sun: 'Semanas (domingo a sábado)',
            week_mon: 'Semanas (lunes a domingo)',
            month: 'Meses',
            quarter: 'Trimestres',
            semester: 'Semestres',
            year: 'Años',
            entity: 'Lugar de colecta',
            group: 'Grupo de colecta: {{name}}',
            partition: 'Desagregación: {{name}}',
            partition_group: 'Desagregación: {{name}} / {{groupName}}',
        },

        edit_user: 'Editar usuario',
        update_user: 'Actualizar el usuario',

        user: 'Usuario',

        parameter: 'Parametro',
        unnamed_logframe: 'Marco lógico sin nombre',

        edit_indicator: 'Editar indicador',
        display: 'Nombre',
        display_ph: 'ej: Tasa de consultaciones prenatales en las estructuras de salud',
        computation: 'Cálculo',

        show_finished: 'Ver todas las entradas',
        are_you_sure_to_uninvite:
            '¿Esta seguro de querer quitar este proyecto de su lista? El proprietario debera invitarle de nuevo si necesita tener acceso. Confirme para quitarlo',
        data_selection: 'Seleccione los datos',
        filters: 'Filtros',
        input_status: {
            done: 'Editar ({{100*value|number:0}}%)',
            expected: 'Crear',
        },
        cols: 'Columnas',
        rows: 'Linear',
        entity: 'Lugar de colecta',
        select_cols: 'Selecione las columnas',
        select_rows: 'Selecione las lineas',
        pivot_table: 'Tabla dinámica',

        groups: 'Grupos',
        basics: 'Datos de base',
        general: 'General',

        partitions: 'Desagregaciones',

        add_variable: 'Añadir una variable',
        remove_variable: 'Quitar esta variable',
        add_partition: 'Añadir una desagregación',

        aggregation: {
            sum: 'Suma',
            average: 'Promedio',
            highest: 'Número mayor',
            lowest: 'Número menor',
            last: 'Último valor',
            none: 'No es posible compilar',
        },

        covered_period: 'Periodo cubierto',

        collection_site_list: 'Lugares de colecta',
        collection_form_list: 'Fuentes de datos',

        collection_site: 'Lugar de colecta',
        collection_form: 'Fuente de datos',
        collection_form_paper: 'Formulario en papel',
        collection_form_excel: 'Formulario en Excel',

        collection_form_planning: 'Calendario',
        collection_form_structure: 'Estructura',

        variable: 'Variable',

        no_purposes: 'Ningun objetivo específico ha sido definido',

        form_name_ph: 'ej: Datos SNIS, Ficha de colecta ante-natal, Ficha sanidad primaria, ...',

        entity_name: 'Nombre de la estructura o del lugar de intervención',
        group_name: 'Nombre del grupo',
        entity_name_placeholder: 'ej: Centro de salud X, Hospital X, ...',
        group_name_placeholder: 'ej: Hospitales regionales, parte Norte del país, ...',

        create: 'Crear un nuevo proyecto',
        periodicity: 'Periodicidad',
        start: 'Principio del proyecto',
        end: 'Fin del proyecto',

        periodicities: {
            day: 'Diario',
            month_week_sat: 'Cada semana (sábado a viernes / cortado por mes)',
            month_week_sun: 'Cada semana (domingo a sábado / cortado por mes)',
            month_week_mon: 'Cada semana (lunes a domingo / cortado por mes)',
            week_sat: 'Cada semana (sábado a viernes)',
            week_sun: 'Cada semana (domingo a sábado)',
            week_mon: 'Cada semana (lunes a domingo)',
            month: 'Cada mes',
            quarter: 'Cada trimestre',
            semester: 'Cada semestre',
            year: 'Cada año',
        },

        no_input_entities: '¡Ningún lugar de colecta ha sido creado!',
        no_input_groups: '¡Ningún grupo de colecta ha sido creado!',

        input: 'Entrar datos',

        baseline: 'Valor de base',
        target: 'Objectivo',

        goal: 'Objectivo global',
        intervention_logic: 'Logica de intervención',

        start_date: 'Fecha de inicio',
        end_date: 'Fecha de fin',
        country_ph: 'ej: Gondawa',
        name_ph: 'ej: Acceso a atención de calidad para las personas afectadas por la crisis',
        add_indicator: 'Añadir un indicador',

        purpose: 'Objectivo específico',
        purposes: 'Objectivos específicos',
        assumptions: 'Hipotesis',
        output: 'Resultado',

        indicator_is_computed: 'Valido',
        indicator_is_not_computed: 'Invalido',

        intervention_logic_goal_ph:
            'ej. Reducir la mortalidad y la morbididad de la población afectada por la crisis',
        intervention_logic_purpose_ph:
            'ej. Mejorar el acceso a la salud para la población afectada por la crisis en los districtos de Bimbo y Begoua',
        output_desc_ph:
            'ej. Mejorar la atención de salud primaria en los centros de salud de Bimbo y Begoua',
        assumptions_purpose_ph: '',
        output_assumptions_ph: '',
        logframe_ph_name: 'ej. ECHO',

        specific_dates: 'Período de validez',
        specific_dates_yes: 'Usar fechas específicas para este marco lógico',
        specific_dates_use_project: 'Usa las mismas fechas que el proyecto',
        logframe_edit_help_specificdates: `Si este marco lógico solo es válido durante una parte de la duración del proyecto, puede indicarlo aquí`,
        logframe_edit_help_start:
            'Fecha a partir de la cual desea calcular los indicadores para este marco lógico',
        logframe_edit_help_end:
            'Fecha hasta la que desea calcular los indicadores de este marco lógico se calcularán',

        logframe_help_sites:
            'Entre los lugares identificados en "Lugares de colecta", cuales son relevantes para este marco lógico?',
        logframe_help_name:
            'Nombre este marco lógico para poder identificarlo facilment. Por ejemplo con el nombre del donante relevante',
        logframe_help_goal:
            'Descripción de la contribución del proyecto a los objectivos (impacto) de una política o de un programa',
        logframe_help_goal_indicators:
            'Entre los indicadores que permiten medir el objectivo general',
        logframe_help_purpose_desc:
            'Describa las ventajas tangibles que se proporcionan a los beneficiarios',
        logframe_help_purpose_assumptions:
            'Factores externos susceptibles de comprometer el alcanze del objectivo específico',
        logframe_help_purpose_indicators:
            'Entre los indicadores que permiten medir el objectivo específico',
        logframe_help_output_desc: 'Producto o servicio tangible proporcionado por el proyecto',
        logframe_help_output_assumptions:
            'Factores externos susceptibles de comprometer el alcanze del resultado',
        logframe_help_output_indicators: 'Entre los indicadores que permiten medir el resultado',

        add_output: 'Añadir un resultado',
        add_purpose: 'Añadir un objetivo específico',

        basics_help_country:
            'En que país tiene lugar su proyecto? Si es un proyecto regional, entre el nombre de la región.',
        basics_help_name:
            'El nombre del proyecto le permite encontrarlo en Monitool. Elija algo que sea suficientemente informativo, o copie el objectivo general.',
        basics_help_begin:
            'La fecha de inicio es el momento en el que su proyecto empieza a colectar datos (usualemente, con la primeras actividades)',
        basics_help_end:
            'La fecha de fin es el momento en el que termina la colecta de datos. Si no es conocida, entre una fecha en el futuro.',

        collection_edit_help_name:
            'Cual es el nombre de la fuente de datos de la que quiere extraer datos? ej. "Historiales clínicos electronicos", "Fichas de colecta", "Informe SNIS", ...',
        collection_edit_help_sites:
            'Entre los lugares identificados en "Lugares de colecta", cuales son los que colectan esta fuente de datos?',
        collection_edit_help_periodicity:
            'Cada cuanto son disponibles estos datos? Tenga ciudado, no entre aqui la frecuencia a la que hace sus informes.',

        collection_edit_help_varname:
            'Nombre la variable que quiere extraer de <code>{{name}}</code>. ej: "Número de diagnosticos".',
        collection_edit_help_geoagg:
            'En un proyecto que trabaja en dos lugares, si <code>{{name}}</code> vale 10 en el primero, y 20 en el segundo, cual es el valor para el proyecto entero?',
        collection_edit_help_timeagg:
            'En un proyecto que colecta datos mensuales, si <code>{{name}}</code> vale 10 en enero, 20 en febrero y 30 en marzo, que vale para el trimer trimestre?',
        collection_edit_help_partition:
            '¿Quiere poder diferenciar <code>{{name}}</code> por edad, sexo, tipo de consulta, motivo de consulta, patología, hora del dia, ...? <br/>No desagrege por zona geográfica: los lugares de colecta ya se rellenaron en la otra página.',
        collection_edit_help_distribution:
            'Si va a imprimir formulario en A4, prefiera tener columnas a la izquierda para que las tablas sean menor anchas.',
        collection_edit_help_order:
            'En que ordén quiere que aparescan la desagregaciones en las tablas de entrada de datos?',

        download_portrait: 'Descargar PDF (vertical)',
        download_landscape: 'Descargar PDF (horizontal)',

        titles: 'Título',
        data: 'Datos',
        general_informations: 'Informaciones generales',
        fill_with_last_input: 'Rellenar con los datos de la última entrada',
        fill_with_zeros: 'Reemplazar valores faltantes con cero',

        variable_name_label: 'Qué esta midiendo?',
        variable_name_ph: 'ej: Número de diagnosticos',
        site_agg_label: 'Como compilar entradas provenientes de diferentes lugares?',
        time_agg_label: 'Como compilar entradas provenientes de diferentes periodos?',
        partitions_label: 'Que desagregaciones quiere usar en esta variable?',
        distribution_label: 'Como mostrar la desagregaciones en el formulario de colecta?',
        order_label: 'En que ordén mostrar las desagregaciones en el formulario de colecta?',
        delete_purpose: 'Suprimir el objectivo especifico',
        delete_result: 'Suprimir el resultado',

        no_element_selected: 'Ningún elemento esta seleccionado',

        indicator_ph_fixed: 'Entre el valor constante del indicador (ej: "12")',
        indicator_help_description: 'Contexto de colecta, detalles sobre el método de cálculo...',
        indicator_help_display:
            'Nombre su indicador. Es preferible obtener el nombre a partir de un catalogo para ser consistente con otros proyectos.',
        indicator_help_baseline:
            'Cual era el valor del indicador antes de empezar la actividades? Marque la casilla para especificar un valor.',
        indicator_help_target:
            'Cual es el objectivo para este indicador? Marque la casilla para especificar un valor.',
        indicator_help_colorize:
            'Desea tener colores (rojo, naranja, verde) en informes para este indicador?',
        indicator_help_computation:
            'Como se calcula este indicador a partir de las variables que ha colectado en fuentes de datos?',

        activity: 'Actividad',
        add_activity: 'Añadir una actividad',
        delete_activity: 'Suprimir la actividad',
        activity_desc_ph: 'ej. Realizar sesiones de sensibilización sobre la transmision del VIH',
        logframe_help_activity_desc: 'Actividad realizada por la ONG',
        logframe_help_activity_indicators: 'Entre los indicadores que permiten medir la actividad',

        form_is_not_associated_with_site:
            'Esta fuente de datos no esta asociada a ningún lugar de colecta.',
    },

    form: {
        create_blank: 'Añadir un marco lógico en blanco',
    },

    indicator: {
        missing_description: '<i>El descriptivo de este indicador no fue rellenado</i>',
        extra: 'Indicadores adicionales',
    },
};
