module.exports = {
    pages: {
        project_list: {
            title: 'Liste de projets',
            paragraph: ``,
        },
        basics: {
            title: 'Données de base',
            paragraph:
                '<p>Los datos básicos permiten clasificar su proyecto entre los demas de la ONG.</p>',
        },
        sites: {
            title: 'Lieux de collecte',
            paragraph:
                '<p>Cuando un proyecto tiene las mismas actividades en varios lugares, se deben seguir por lugar, grupos de lugares y a nivel de proyecto.</p>' +
                '<p>Entre aqui:</p>' +
                '<ul>' +
                '<li>La lista de lugares donde su proyecto trabaja (ej: la lista de centros de salud)</li>' +
                '<li>los grupos que se usuran durante la vida del proyecto (ej: por región, o tipo de estructura)</li>' +
                '</ul>',
        },
        datasource_list: {
            title: 'Liste des sources de données',
            paragraph:
                '<p>Las fuentes de datos son los diferentes soportes donde se encuentran los datos necesarios para seguir el proyecto (fichas de colecta, historiales clínicos, ficheros excel, ...).</p>' +
                '<p>En Monitool, no hace falta entrar todos los datos disponibles en las fuentes de datos: solo lo que es relevante</p>' +
                '<p>Para que sea mas facil entrar los datos, la fuentes deben corresponder a herramientas reales usadas en el terreno.</p>',
        },
        datasource_edition: {
            title: `Édition d'une source de données`,
            paragraph: `
            `,
        },
        logframe_list: {
            title: 'Liste des cadres logiques',
            paragraph:
                '<p>Un marco lógico es un documento que describe los objectivos, resultados y actividades de un proyecto, asi como indicadores para seguir el progreso de cada uno de ellos</p>' +
                '<p>Todos los indicadores deben ser calculables a partir de los datos describidos en las fuentes de datos</p>',
        },
        logframe_edit: {
            title: `Édition d'un cadre logique`,
            paragraph: ``,
        },
        extra_indicators: {
            title: `Indicateurs annexés`,
            paragraph:
                '<p>Los indicadores adicionales son indicadores que no estan en ningún marco lógico.</p>' +
                '<p>Permiten seguir elementos especificos del proyecto (datos medicales, logisticos, ...)</p>',
        },
        user_list: {
            title: `Liste des utilisateurs`,
            paragraph:
                '<p>Muchas personas diferentes participan en crear y seguir un proyecto: coordination, equipo M&E, operadores de entrada de datos, partnerarios, ...</p>' +
                '<p>Entre aqui la lista de todos los usuarios que deben tener acceso a los datos del programa.</p>',
        },
        history: {
            title: `Historique`,
            paragraph:
                'El historial de modificaciones le permite consultar todos los cambios hechos en la estructura de su proyecto.',
        },
        input_list: {
            title: `Liste des saisies`,
            paragraph:
                '<p>Este calendario de entrada hace la lista de todas las entradas de datos programadas para la fuente de datos "{{name}}"</p>' +
                '<p>Para limitar los errores de entrada, es preferible entrar los datos cerca de donde se colectaron, directamente en Monitool.</p>' +
                '<p>Si no es posible, una versión PDF del formulario esta provista.</p>',
        },
        input_edition: {
            title: `Édition d'une saisie`,
            paragraph: ``,
        },
        general_reporting: {
            title: `Rapport général`,
            paragraph: `Cette page vous permet d'explorer vos données hierarchiquement en partant d'une vision général de votre projet.`,
        },
        olap_reporting: {
            title: `Tableau croisé dynamique`,
            paragraph: `Cette page vous permet de construire des tableaux qui prendront la forme que vous désirez, et de les télécharger
            en format Excel, afin de les inclure dans des rapports ou de créer des visualisation en dehors de Monitool.`,
        },
    },
    qas: [
        // Structure
        {
            pages: ['basics'],
            question: `Comment choisir des noms adaptés pour les lieux de collecte, sources de données, variables et indicateurs`,
            answer: `
            Use nombres cortos para nombrar ubicaciones de colecciones, fuentes de datos, variables e indicadores.<br />
            Al evitar los acrónimos, mejora la legibilidad de sus cuadros y tablas y permite una mejor comprensión de su
            proyecto por parte de todos los actores.`,
        },
        {
            pages: ['basics'],
            question: `Je viens de supprimer quelque chose de mon projet par erreur, mais je n'ai pas encore sauvegardé. Comment revenir en arrière?`,
            answer: `
            En caso de error, haga clic en
            <span class="btn btn-default btn-xs"><i class="fa fa-undo"></i> Cancelar los cambios</span></span>
            para volver a la última versión guardada.`,
        },
        {
            pages: ['basics'],
            question: `J'ai supprimé quelque chose de mon projet par erreur, et j'ai sauvegardé ma modification. Comment revenir en arrière?`,
            answer: `
                Si ha guardado un error: vaya a la página
                <a class="btn btn-default btn-xs"><i class="fa fa-history"></i> Historial</a>
                y restaure una versión anterior del proyecto.`,
        },
    ],
};
