module.exports = {
    pages: {
        'main.projects': {
            title: 'Lista de proyectos',
            paragraph: /* html */ `
                La lista de proyectos es su punto de entrada para todas las tareas que puede realizar
                en la herramienta.
            `,
        },
        'main.invitations': {
            title: 'Invitaciones',
            paragraph: /* html */ `
                En esta página, encuentre la lista de proyectos en los que ha sido invitado a participar
                por otros usuarios.
            `,
        },
        'project.config.home': {
            title: `Inicio de configuración`,
            paragraph: /* html */ `Vea su progreso en la configuración de su proyecto`,
        },
        'project.config.basics': {
            title: 'Datos básicos',
            paragraph: /* html */ `Los datos básicos ayudan a clasificar su proyecto entre otros de la ONG.`,
        },
        'project.config.collection_site_list': {
            title: 'Sitios de recolección',
            paragraph: /* html */ `
                <p>
                    Cuando un proyecto realiza las mismas actividades en varios lugares, estos deben poder ser
                    seguidos individualmente, por grupos y todos juntos.
                </p>
                <p>
                    Ingrese aquí:
                    <ul>
                        <li>La lista de lugares en los que trabaja el proyecto (por ejemplo: una lista de centros de salud)</li>
                        <li>Agrupaciones que se utilizarán durante el seguimiento (por ejemplo: regiones, tipos de estructuras)</li>
                    </ul>
                </p>`,
        },
        'project.config.collection_form_list': {
            title: 'Lista de fuentes de datos',
            paragraph: /* html */ `
                Las fuentes de datos son los diferentes medios de los cuales se extraen los datos necesarios para el monitoreo del
                proyecto (formularios de seguimiento, historias clínicas, archivos de Excel, ...)<br/>
                En monitool, no se describirá la totalidad de los datos existentes, sino solo la parte
                que se extraerá para el seguimiento del proyecto.<br/>
                Para facilitar la organización del ingreso de datos, las fuentes deben corresponder a herramientas reales
                utilizadas en el terreno.
            `,
        },
        'project.config.collection_form_edition': {
            title: `Edición de una fuente de datos`,
            paragraph: /* html */ `
                `,
        },
        'project.config.logical_frame_list': {
            title: 'Lista de marcos lógicos',
            paragraph: /* html */ `
                Un marco lógico es un documento que describe los objetivos, los resultados esperados y las actividades realizadas
                para alcanzarlos, así como los indicadores que permiten seguir el avance de cada elemento.<br/>
                Todos los indicadores presentes en los marcos lógicos deben ser calculables a partir de los datos
                descritos en las fuentes de datos
            `,
        },
        'project.config.logical_frame_edition': {
            title: `Edición de un marco lógico`,
            paragraph: /* html */ ``,
        },
        'project.config.extra': {
            title: `Indicadores adicionales`,
            paragraph: /* html */ `
                Los indicadores adicionales son indicadores complementarios que no figuran en ningún marco lógico.<br/>
                Permiten seguir elementos específicos del proyecto (datos médicos, logísticos, ...)
            `,
        },
        'project.config.invitation_list': {
            title: `Lista de usuarios`,
            paragraph: /* html */ `
                Varios tipos de usuarios intervienen en la implementación y el seguimiento de un proyecto:
                coordinación, personal de M&E, operadores de entrada de datos, socios, ...<br/>
                Enumere aquí todos los usuarios que deben tener acceso al seguimiento de este proyecto.
            `,
        },
        'project.config.history': {
            title: `Historial`,
            paragraph: /* html */ `
                El historial de modificaciones le permite consultar la lista de modificaciones realizadas en la
                estructura de su proyecto.
            `,
        },
        'project.usage.home': {
            title: `Inicio del proyecto`,
            paragraph: /* html */ `
                La página de inicio del proyecto le presenta los contactos de los diferentes participantes.<br/>
                Si participa en la entrada de datos del proyecto, también puede acceder al seguimiento de su progreso.
            `,
        },
        'project.usage.downloads': {
            title: `Descargas`,
            paragraph: /* html */ `Aquí puede acceder a diferentes archivos para descargar`,
        },
        'project.usage.log': {
            title: `Historial de modificaciones`,
            paragraph: /* html */ `Esta página muestra el historial de todas las entradas de datos realizadas en su proyecto.`,
        },
        'project.usage.preview': {
            title: `Historial de modificaciones`,
            paragraph: /* html */ `Esta página le permite visualizar las modificaciones realizadas durante una entrada de datos en particular.`,
        },
        'project.usage.uploads': {
            title: `Carga de archivos`,
            paragraph: /* html */ `Esta página le permite cargar formularios que hayan sido completados en papel o en Excel por sus equipos.`,
        },
        'project.usage.list': {
            title: `Calendario de entrada de datos`,
            paragraph: /* html */ `El calendario de entrada de datos permite acceder a los formularios de entrada de datos del proyecto`,
        },
        'project.usage.edit': {
            title: `Edición de entrada de datos`,
            paragraph: /* html */ `Asegúrese de verificar el lugar de recolección y el período cubierto del formulario de entrada de datos antes de ingresar sus datos`,
        },
        'project.usage.data_entry': {
            title: `Edición de entrada de datos`,
            paragraph: /* html */ `Permite ingresar formularios en papel`,
        },
        'project.usage.general': {
            title: `Informe general`,
            paragraph: /* html */ `Esta página le permite explorar sus datos jerárquicamente comenzando desde una visión general de su proyecto.`,
        },
        'project.usage.olap': {
            title: `Tabla dinámica`,
            paragraph: /* html */ `Esta página le permite construir tablas que tendrán la forma que desee y descargarlas
                en formato Excel, para incluirlas en informes o crear visualizaciones fuera de Monitool.`,
        },
    },
    qas: [
        {
            prefixes: ['main.projects', 'project.config.home', 'project.config.basics'],
            question: `¿Qué es un proyecto en Monitool?`,
            answer: /* html */ `
                En Monitool, no hablamos de bases de datos, consultas, dimensiones, uniones...<br/>
                Un proyecto es un proyecto en el sentido entendido en una organización humanitaria, el mismo que aquel para el cual 
                usted redacta una propuesta a su financiador.
            `,
        },
        {
            prefixes: ['main.projects'],
            question: `¿Por qué se pueden crear varios proyectos por cuenta, si uno solo es suficiente?`,
            answer: /* html */ `
                No tiene utilidad desde el punto de vista del terreno, pero algunos usuarios deben poder acceder 
                a muchos proyectos que no crean ellos mismos.<br/>
                Especialmente empleados de sede, regionales o consultores.
            `,
        },
        {
            prefixes: ['main.projects'],
            question: `¿Cómo volver a las páginas de configuración de un proyecto que ya he creado?`,
            answer: /* html */ `
                En su proyecto, a la derecha del botón de abrir, haga clic en
                <span class="btn btn-default btn-xs"><span class="caret"></span></span>
                para ver todas las acciones posibles.
            `,
        },
        {
            prefixes: ['main.projects'],
            question: `¿Cuál es la utilidad de poder "Clonar la estructura" de un proyecto?`,
            answer: /* html */ `
                La funcionalidad "Clonar solo la estructura" está pensada para ONG que realizan programas de emergencia. En efecto, en este caso, en lugar de tomar el tiempo necesario para la reflexión
                necesario para la construcción de un proyecto, es frecuente crear de antemano diferentes
                esqueletos de proyectos con todas las fuentes de datos y el marco lógico listos para su uso.
                <br/>
                Cuando comienza una nueva crisis, el sistema de monitoreo puede estar operativo en unos pocos
                minutos. Solo es necesario clonar la estructura del esqueleto adecuado a la situación y renombrar el proyecto,
                la adaptación del proyecto al contexto vendrá en una fase posterior del proyecto.
            `,
        },
        {
            prefixes: ['main.projects'],
            question: `¿Cuál es la utilidad de poder "Clonar estructura y datos" de un proyecto?`,
            answer: /* html */ `
                La funcionalidad "Clonar estructura y datos" generalmente ocurre en el momento de un cambio
                de financiador o un cambio importante en el sistema de monitoreo de un proyecto a largo plazo.<br/>
                Permite tomar una fotografía de un proyecto, con su estructura y todos sus datos en un momento dado
                y conservarlo a largo plazo.
            `,
        },
        {
            prefixes: ['main.projects'],
            question: `¡He archivado mi proyecto por error, cómo puedo recuperarlo?`,
            answer: /* html */ `
                Haga clic en <span class="btn btn-default btn-xs">Mostrar proyectos archivados</span>,
                luego en <span class="btn btn-default btn-xs">Restaurar</span>
            `,
        },
        {
            prefixes: ['main.projects'],
            question: `¿Para qué sirven los símbolos <i class="fa fa-user"></i> y <i class="fa fa-share-alt"></i> en la parte superior izquierda de cada proyecto?`,
            answer: /* html */ `
                Para diferenciar los proyectos que ha creado de los que han sido creados por otros usuarios y que están
                compartidos con usted.
            `,
        },
        {
            prefixes: ['main.projects'],
            question: `¿Para qué sirve el símbolo <i class="fa fa-star"></i> en la parte superior derecha de cada proyecto?`,
            answer: /* html */ `
                Para los usuarios que acceden a muchos proyectos, permite elegir aquellos que
                siempre aparecerán primero en su lista.<br/>
                Para aquellos que aún tienen solo un proyecto, tiene un papel... decorativo. ¡Crea un segundo!
            `,
        },
        {
            prefixes: ['main.projects'],
            question: `¡Mi proyecto ha desaparecido! ¿Dónde está?`,
            answer: /* html */ `
                ¡No entre en pánico!<br/><br/>
                Varias explicaciones son posibles:
                <ul>
                    <li>Su proyecto no coincide con el filtro que ingresó. Vacíe la barra de entrada de texto en la parte superior de la página.</li>
                    <li>Su proyecto ha finalizado. Haga clic en <span class="btn btn-default btn-xs">Mostrar proyectos terminados</span>. Puede editar su fecha de finalización para extenderla.</li>
                    <li>Ha archivado su proyecto. Haga clic en <span class="btn btn-default btn-xs">Mostrar proyectos archivados</span> y luego en
                    <span class="btn btn-default btn-xs">Restaurar</span></li>
                </ul>
                <br/>
                Si su proyecto aún falta, es posible que no haya iniciado sesión con
                la misma cuenta que utilizó para crear su proyecto.<br/>
                Haga clic en <span class="btn btn-default btn-xs"><i class="fa fa-power-off"></i> Desconectar</span>
                luego inicie sesión con la cuenta que usó para crear su proyecto.<br/>
                Si lo desea, puede transferir el proyecto a su nueva cuenta.
            `,
        },
        {
            prefixes: ['main.projects'],
            question: `¿Cuánto tiempo se almacenará mi proyecto en Monitool?`,
            answer: /* html */ `
                Durante toda la vida útil de la herramienta: los costos de almacenamiento de los proyectos son bajos en comparación
                con los costos de desarrollo y alojamiento de la plataforma.<br/>
                Por lo tanto, no es necesario eliminar los proyectos antiguos para "hacer espacio".<br/>
                <br/>
                Si su ONG tiene reglas sobre archivado electrónico para proyectos finalizados, puede
                descargar todos los datos ingresados por proyecto desde la página "Informe General"
            `,
        },
        {
            prefixes: ['main.invitations'],
            question: `No he recibido la invitación que esperaba`,
            answer: /* html */ `
                Para invitarlo a participar en un proyecto, el propietario utiliza su dirección de correo electrónico.<br/>
                Asegúrese de que haya iniciado sesión con la misma dirección de correo electrónico que se utilizó
                para invitarlo.
            `,
        },
        {
            prefixes: ['main.invitations'],
            question: `Rechacé una invitación por error, ¿cómo puedo solucionarlo?`,
            answer: /* html */ `
                Las invitaciones rechazadas ya no se pueden modificar.<br/>
                Solicite al propietario del proyecto al que desea acceder que lo invite nuevamente.
            `,
        },

        // Structure
        {
            prefixes: ['project.config'],
            question: `¿Cómo elegir nombres adecuados para los lugares de recolección, fuentes de datos, variables e indicadores?`,
            answer: /* html */ `Utilice nombres cortos para nombrar los diferentes componentes de su proyecto.<br/>
                Evitar los acrónimos mejora la legibilidad de sus gráficos y tablas y permite una mejor
                comprensión de su proyecto por parte de todos los actores involucrados.`,
        },
        {
            prefixes: ['project.config'],
            question: `Acabo de eliminar algo de mi proyecto por error, pero aún no lo he guardado. ¿Cómo puedo deshacerlo?`,
            answer: /* html */ `
                En caso de error, haga clic en <a class="btn btn-default btn-xs"><i class="fa fa-undo"></i> Deshacer cambios</a> para volver a la
                última versión guardada de su proyecto`,
        },
        {
            prefixes: ['project.config'],
            question: `He eliminado algo de mi proyecto por error y guardé mi modificación. ¿Cómo puedo deshacerlo?`,
            answer: /* html */ `
                Vaya a la página <a class="btn btn-default btn-xs"><i class="fa fa-history"></i> Historial</a> 
                la estructura de su proyecto.<br/>
                Puede ver todas las modificaciones que se han realizado desde la creación del proyecto y
                retroceder al momento que desee`,
        },
        {
            prefixes: ['project.config.basics'],
            question: `No conozco la fecha de finalización de mi proyecto`,
            answer: /* html */ `
                Puede modificarla en cualquier momento, deje el valor predeterminado (en un año).`,
        },
        {
            prefixes: ['project.config.collection_form_list'],
            question: `¿Cómo se estima la duración de la entrada de datos?`,
            answer: /* html */ `
                Esta indicación está aquí para dar una idea general.<br/>
                La fórmula utilizada considera que se necesitan 10 segundos por casilla completada.`,
        },
        {
            prefixes: ['project.config.collection_form_list'],
            question: `
                ¿Qué sucede cuando muevo variables entre fuentes de datos que 
                no tienen las mismas periodicidades o lugares de recolección?`,
            answer: /* html */ `
                Los datos ya ingresados se moverán y se agregarán o interpolarán para adaptarse a la nueva periodicidad.<br/>
                Si los lugares de recolección no son los mismos entre las dos fuentes de datos
                <ul>
                    <li>Los datos que se ingresaron en los lugares adicionales se volverán inaccesibles.</li>
                    <li>Se pedirá a los ingresadores que ingresen retroactivamente los datos faltantes.</li>
                </ul>`,
        },
        {
            prefixes: ['project.config.collection_form_edition'],
            question: `Mis equipos pasan demasiado tiempo ingresando datos, ¿cómo reducirlo?`,
            answer: /* html */ `
                ¡Reduzca la cantidad de datos a recolectar!<br/>
                Por ejemplo, puede desactivar variables o desagregaciones que no analice,
                o reducir la periodicidad de la recolección.`,
        },
        {
            prefixes: ['project.config.collection_form_edition'],
            question: `No entiendo las dos preguntas sobre "Cómo agrupar las entradas"`,
            answer: /* html */ `
                Monitool le muestra informes según la escala de tiempo que elija (semanal, mensual, trimestral...) y no le pide que ingrese sus datos tantas veces como escalas de tiempo haya.<br/>
                Para ello, es necesario saber cómo agregar los datos que se ingresan en la herramienta, y estas reglas dependen
                de la naturaleza de los datos que ingresa.<br/>
                <br/>

                <table class="table table-bordered">
                    <tr>
                        <th>Variable</th>
                        <th>Cómo agrupar en el tiempo</th>
                        <th>Cómo agrupar entre sitios</th>
                    </tr>
                    <tr>
                        <td>Número de consultas médicas</td>
                        <td>Si se realizan 10 consultas por día, eso hace 70 consultas por semana, por lo que es "Suma"</td>
                        <td>10 consultas en París y 10 consultas en Lille hacen 20 consultas, por lo que también es "Suma"</td>
                    </tr>
                    <tr>
                        <td>Número de estructuras apoyadas</td>
                        <td>10 estructuras fueron apoyadas en enero y 15 en febrero y 20 en marzo, el valor a mantener
                        para el trimestre es 15, por lo que es "Promedio"</td>
                        <td>10 estructuras fueron apoyadas en París y 10 en Lille, por lo que son 20 estructuras, por lo que es "Suma"</td>
                    </tr>                    
                </table>`,
        },
        {
            prefixes: ['project.config.collection_form_edition'],
            question: `Quiero cambiar la periodicidad de recolección de mi fuente de datos aunque ya haya realizado entradas`,
            answer: /* html */ `
                ¡No hay problema!<br/>
                Sus informes no cambiarán: aún podrá consultar todos sus datos sin pérdida de precisión.<br/>
                <br/>
                Sin embargo, ¡cuidado! Si cambia a una periodicidad más larga (por ejemplo, semanal a mensual),
                debe tener cuidado de corregir los datos de la última entrada que probablemente esté incompleta y aún así marcada
                como "hecha"!`,
        },
        {
            prefixes: ['project.config.collection_form_edition'],
            question: `Quiero agregar una variable pero ya he realizado entradas.`,
            answer: /* html */ `
                Puede agregar variables en cualquier momento sin pérdida de datos.<br/>
                Luego, tendrá la opción de volver a ingresar los datos correspondientes retroactivamente o dejar las entradas como están,
                que luego se marcarán como "incompletas" en el panel de control del proyecto, sin más consecuencias.`,
        },
        {
            prefixes: ['project.config.collection_form_edition'],
            question: `Quiero dejar de ingresar una variable pero ya he realizado entradas.`,
            answer: /* html */ `
                Puede desactivar variables en cualquier momento sin pérdida de datos.<br/>
                Los datos ingresados previamente seguirán siendo accesibles en sus informes, pero todas las nuevas
                entradas luego se marcarán como "incompletas" en el panel de control del proyecto, sin más consecuencias.<br/><br/>

                Cuando ya no necesite esa variable, podrá eliminarla.`,
        },
        {
            prefixes: ['project.config.collection_form_edition'],
            question: `Quiero eliminar una variable pero ya he realizado entradas.`,
            answer: /* html */ `
                <p>Luego desaparecerá de los formularios de entrada, y retroactivamente de todos sus informes.</p>
                <p>Todos los indicadores que dependan de ella se marcarán como "Imposible de calcular" hasta que corrija su fórmula</p>
                <p>
                    Sus datos no se perderán, pero la única forma de recuperarlos será visitar la página
                    <span class="btn btn-default btn-xs"><i class="fa fa-history"></i> Historial</span> para deshacer la modificación.
                </p>`,
        },
        {
            prefixes: ['project.config.collection_form_edition'],
            question: `Quiero agregar una desagregación pero ya he realizado entradas`,
            answer: /* html */ `
            Por ejemplo, agregar una desagregación por sexo del paciente a un número de consultas médicas, aunque
            solo se diferenciaban por patología.<br/>
            <br/>
            Puede agregar desagregaciones en cualquier momento sin pérdida de datos.<br/>
            Cuando consulte sus informes, los datos de las entradas antiguas que no contenían esta desagregación por
            sexo seguirán apareciendo y no cambiarán.<br/>
            <br/>
            Para permitirle comparar los datos antiguos y los nuevos, si elige desagregar sus informes por
            sexo, Monitool distribuirá los datos antiguos asumiendo que había tantas mujeres como hombres
            antes del cambio.<br/>
                Para no confundirlo, estos datos "interpolados" están claramente indicados en los informes porque
                todos estarán precedidos por el símbolo ≈.`,
        },
        {
            prefixes: ['project.config.collection_form_edition'],
            question: `Quiero eliminar una desagregación pero ya he realizado entradas`,
            answer: /* html */ `
                Todos los datos ingresados hasta la fecha se agregarán, y la desagregación desaparecerá retroactivamente
                de los informes.<br/>
                Ya no podrá ver esta desagregación en los informes, incluso en los datos ingresados antes de la modificación.<br/>
                Una alternativa es desactivar esta desagregación.`,
        },
        {
            prefixes: ['project.config.history'],
            question: `Algunas modificaciones en la estructura del proyecto son realizadas por un usuario que no debería tener acceso`,
            answer: /* html */ `Puede administrar los derechos de los diferentes participantes en el proyecto en la sección "<i class="fa fa-share-alt"> Compartir"`,
        },
        {
            prefixes: ['project.config.history'],
            question: `Quiero deshacer una modificación que realicé hace varias semanas, sin perder todas las otras modificaciones que he realizado desde entonces.`,
            answer: /* html */ `
                Esta interfaz solo le permite retroceder hasta cualquier punto en el tiempo,
                pero no puede retroceder a una modificación en particular.<br/>
                Las modificaciones que realiza en su proyecto dependen unas de otras. Si creó
                una nueva variable en una modificación, luego agregó un indicador que depende de ella en otra, deshacer la primera modificación
                sin deshacer la segunda la haría incoherente.`,
        },

        // Usage
        {
            prefixes: ['project.usage.home'],
            question: `¿Cómo puedo cambiar mi foto en la lista de participantes?`,
            answer: /* html */ `
                ¡La foto proviene de la cuenta que utilizó para iniciar sesión!<br/>
                Vaya a su perfil de Google o Microsoft para modificarla.
                La nueva foto se actualizará automáticamente en Monitool
            `,
        },
        {
            prefixes: ['project.usage.home'],
            question: `¿Cómo puedo ver los roles de los diferentes participantes en mi proyecto?`,
            answer: /* html */ `
                ¡Excepto para el propietario del proyecto (el primer participante en la lista), los roles de los demás no son públicos!<br/>
                Si usted es el propietario, puede ir a la página "Invitaciones" en la configuración de su proyecto
                para acceder a ellos.
            `,
        },
        {
            prefixes: ['project.usage.home'],
            question: `
                Todas las entradas que hice estaban "realizadas" (verde) pero ahora están "incompletas" (amarillas). ¿Qué pasó?
            `,
            answer: /* html */ `
                Probablemente, el propietario del proyecto haya agregado variables a formularios que
                ya había completado, lo que hace que todas sus entradas anteriores estén incompletas.<br/>
                Consulte con él para saber si es necesario volver a ingresar los datos faltantes de forma retrospectiva.
            `,
        },
        {
            prefixes: ['project.usage.downloads'],
            question: `¿Cuál es el uso de los marcos lógicos en PDF?`,
            answer: /* html */ `
                Cuando comunica sobre su proyecto, a menudo es más práctico enviar su
                marco lógico por correo electrónico, en lugar de pedir a un financiador o socio que se conecte
                a una plataforma en línea para acceder a él.<br/>

                Descargarlos le evitará hacer un doble trabajo: diseñe su marco lógico directamente
                en la herramienta y tenga una versión siempre actualizada lista para ser enviada.
            `,
        },
        {
            prefixes: ['project.usage.downloads'],
            question: `¿Cuál es el uso de los formularios de entrada en formato PDF y Excel?`,
            answer: /* html */ `
                En muchos contextos, implementar herramientas de recolección de datos electrónicas
                requiere tiempo y recursos de capacitación.
                <ul>
                    <li>
                        La versión PDF de los formularios de entrada es fácilmente imprimible, no requiere capacitación
                        para ser utilizada y puede estar operativa desde el primer día de su proyecto.
                    </li>
                    <li>
                        La versión Excel es una alternativa para lugares de recolección donde el acceso a la computadora es
                        posible pero no hay acceso a Internet.<br/>
                        Una vez completados, están diseñados para poder ser copiados y pegados en los formularios de entrada
                        de Monitool en cuestión de segundos.
                    </li>
                </ul>
            `,
        },
        {
            prefixes: ['project.usage.downloads'],
            question: `En mis formularios de entrada, las tablas son demasiado anchas y sobresalen de la página.`,
            answer: /* html */ `
                Tiene dos opciones:
                <ul>
                    <li>
                        Hay una versión "horizontal" del mismo formulario disponible haciendo clic en
                        <span class="btn btn-default btn-xs"><span class="caret"></span></span>
                        luego en
                        <span class="btn btn-default btn-xs">
                            <i class="fa fa-file-pdf-o"></i>
                            Descargar PDF (horizontal)                    
                        </span>.
                    </li>
                    <li>
                        Puede pedirle al propietario del proyecto que modifique la presentación de la tabla
                        para que sea menos ancha pero más alta.
                    </li>
                </ul>
            `,
        },
        {
            prefixes: ['project.usage.downloads'],
            question: `Me gustaría descargar mis informes`,
            answer: /* html */ `
                Hay enlaces de descarga disponibles en las páginas asociadas a los informes
            `,
        },
        {
            prefixes: ['project.usage.log', 'project.usage.preview'],
            question: `¿Qué representa una entrada?`,
            answer: /* html */ `
                Una nueva entrada se registra cuando un usuario guarda los datos en
                un formulario, ya sea directamente o desde un formulario en papel o Excel.<br/>
                Para evitar la multiplicación de entradas, si durante una entrada un usuario guarda
                varias veces el mismo formulario, sin salir de la página, esas múltiples guardadas se
                agruparán en una sola acción en el historial.
            `,
        },
        {
            prefixes: ['project.usage.preview'],
            question: `¿Qué significa el símbolo ∅?`,
            answer: /* html */ `
                Este símbolo significa "vacío", denota la ausencia de entrada en un valor.
            `,
        },
        {
            prefixes: ['project.usage.preview'],
            question: `¿Cuál es el significado del código de colores utilizado?`,
            answer: /* html */ `
                Las casillas con texto en gris no han sido modificadas por la entrada que se está visualizando.<br/>
                Las casillas con texto en verde, azul y rojo han sido modificadas, respectivamente, para agregar, modificar o eliminar
                un valor.
            `,
        },
        {
            prefixes: ['project.usage.uploads'],
            question: `¿Qué tipos de formularios puedo subir?`,
            answer: /* html */ `
                Los formularios que se pueden subir son solo aquellos que están disponibles para descargar
                en la sección correspondiente.<br/>
                Hay dos tipos de formularios posibles: en papel o Excel.<br/>
                Para los formularios en papel, los formatos aceptados son imágenes (png, jpg), faxes (tiff) y PDF.<br/>
                Los formularios de Excel deben cargarse en formato "xlsx". No funcionarán si se convierten a otro formato
                (por ejemplo: iWork Numbers, LibreOffice, OpenOffice, ...).
            `,
        },
        {
            prefixes: ['project.usage.uploads'],
            question: `¿Cuál es el tamaño máximo de los archivos que se pueden cargar?`,
            answer: /* html */ `
                Es de 16 megabytes por archivo.<br/>
                Sin embargo, no es necesario cargar fotos cuyo tamaño supere los 2 megabytes:
                las imágenes de alta resolución ralentizan el procesamiento y no mejoran la calidad.
            `,
        },
        {
            prefixes: ['project.usage.uploads'],
            question: `¿Cómo puedo asegurarme de que los formularios en papel tomados en foto sean reconocidos correctamente?`,
            answer: /* html */ `
                Cuando suba formularios en papel, puede escanearlos o tomarles una foto.<br/>
                Una foto de un formulario tomada con un teléfono y enviada por correo electrónico o mensajería generalmente es
                suficiente para que Monitool pueda recortarla e identificar las casillas de entrada.<br/>

                Sin embargo, si tiene problemas de reconocimiento, aquí tiene algunos consejos para obtener
                mejores resultados:
                <ul>
                    <li>
                        El formulario debe ser completamente visible, especialmente el marcador que está
                        posicionado en la parte superior derecha de la página, y los tres marcadores más pequeños que están
                        en la parte inferior de la página.
                    </li>
                    <li>El formulario debe estar colocado en una superficie plana, no sostenido en la mano</li>
                    <li>
                        Si es posible, tenga una foto con buen contraste. Por ejemplo, no coloque el formulario sobre una
                        mesa blanca
                    </li>
                </ul>
                
                Sin embargo, no es necesario:
                <ul>
                    <li>Estar directamente arriba del formulario para tomar la foto.</li>
                    <li>Que los bordes del formulario coincidan con los bordes de la foto</li>
                </ul>
            `,
        },
        {
            prefixes: ['project.usage.uploads'],
            question: `¿Cómo puedo asegurarme de que los formularios en papel escaneados o enviados por fax sean reconocidos correctamente?`,
            answer: /* html */ `
                Los formularios escaneados o enviados por fax no deberían tener problemas de reconocimiento.<br/>
                Asegúrese de que sean completamente visibles (incluidos los tres marcadores de la parte inferior de la página).
            `,
        },
        {
            prefixes: ['project.usage.edit', 'project.usage.data_entry'],
            question: `¿Cómo puedo pasar rápidamente de una casilla a otra?`,
            answer: /* html */ `
                Durante la entrada de datos, la tecla Tab de su teclado le permite navegar entre las casillas.<br/>
                Para retroceder a la casilla anterior, use Shift + Tab
            `,
        },
        {
            prefixes: ['project.usage.edit', 'project.usage.data_entry'],
            question: `Estoy ingresando datos desde formularios en papel enviados por varios colaboradores por lugar de recolección. ¿Cómo puedo ingresarlos más rápidamente?`,
            answer: /* html */ `
                Si tiene varios formularios en papel para ingresar por lugar (por ejemplo, uno por trabajador social),
                y desea sumarlos, puede ingresar sumas en las casillas de entrada: "1+2+3".<br/>
            `,
        },
        {
            prefixes: ['project.usage.list'],
            question: `¿Qué representan los porcentajes indicados en cada ficha?`,
            answer: /* html */ `
                Es el porcentaje de variables que se han ingresado al menos parcialmente.
            `,
        },
        {
            prefixes: ['project.usage.edit', 'project.usage.data_entry'],
            question: `¿Para qué sirve el botón "Llenar con los datos del periodo anterior"?`,
            answer: /* html */ `
                ¡Para ahorrar tiempo en algunos casos especiales!<br/>
                Si su proyecto sigue indicadores que varían poco con el tiempo (número de estructuras apoyadas,
                población del área objetivo, ...), a menudo es más fácil copiar los datos del ingreso anterior y corregir
                las diferencias que realizar el ingreso desde cero.
            `,
        },
        {
            prefixes: ['project.usage.edit', 'project.usage.data_entry'],
            question: `¿Para qué sirve el botón "Reemplazar valores faltantes por cero"?`,
            answer: /* html */ `
                ¡Para ahorrar tiempo en algunos casos especiales!<br/>
                Para algunas variables, es posible que la mayoría de los valores que necesitan ingresarse sean ceros.
                Esto ocurre con frecuencia cuando se utilizan varias desagregaciones en la misma variable.
            `,
        },
        {
            prefixes: ['project.usage.edit', 'project.usage.data_entry'],
            question: `¿Qué sucede si dejo algunas casillas en blanco?`,
            answer: /* html */ `
                ¡Cuidado!<br/>
                Una casilla en blanco no es equivalente a una casilla que contiene un cero. Los datos no ingresados aparecerán como tales
                en los informes.
            `,
        },

        // Reporting
        {
            prefixes: ['project.usage.general'],
            question: `¿Cómo puedo mostrar un gráfico?`,
            answer: /* html */ `
                A la izquierda de cada fila, el símbolo <i class="fa fa-line-chart"></i> le permite mostrar un gráfico
                que contiene los datos de la fila actual.`,
        },
        {
            prefixes: ['project.usage.general'],
            question: `¿Cómo puedo verificar los datos utilizados para calcular un indicador?`,
            answer: /* html */ `En cada indicador, el símbolo <i class="fa fa-plus"></i> le permite acceder a los diferentes componentes utilizados para
                calcular cada indicador: elija "Cálculo".<br/>
                Esta opción solo está disponible para los indicadores calculados a partir de fuentes de datos`,
        },
        {
            prefixes: ['project.usage.general'],
            question: `¿Cómo puedo desagregar mis datos por lugar de recolección?`,
            answer: /* html */ `En cada fila, el símbolo <i class="fa fa-plus"></i> le permite desagregar su resultado por lugar de recolección.`,
        },
        {
            prefixes: ['project.usage.general'],
            question: `¿Cómo puedo desagregar mis datos por grupo de edad, sexo, patología, contenido de formación, ...?`,
            answer: /* html */ `
                Si utilizó desagregaciones durante la recolección de sus datos, estas aparecerán en el
                menú que está disponible en cada fila haciendo clic en el símbolo <i class="fa fa-plus"></i>.<br/>
                Para los indicadores calculados (marcos lógicos e indicadores adicionales), solo es posible desagregar
                los resultados por lugar de recolección y unidad de tiempo.`,
        },
        {
            prefixes: ['project.usage.general', 'project.usage.olap'],
            question: `¿Qué significa el símbolo <i class="fa fa-question-circle-o"></i> que aparece en lugar de mis datos?`,
            answer: /* html */ `Este símbolo significa que la entrada de datos que está intentando consultar aún no se ha realizado.`,
        },
        {
            prefixes: ['project.usage.general', 'project.usage.olap'],
            question: `¿Qué significa el símbolo <i class="fa fa fa-exclamation"></i> que aparece en lugar de mis datos?`,
            answer: /* html */ `
                ¡Este símbolo significa que se ha producido una división por cero!
            `,
        },
        {
            prefixes: ['project.usage.general', 'project.usage.olap'],
            question: `¿Por qué algunos datos están precedidos por el símbolo ≈?`,
            answer: /* html */ `¡Estás consultando estos datos a un nivel de agregación que es inferior al que los recolectaste!<br/>
                Por ejemplo, si realizaste la recolección trimestralmente, pero estás consultando estos datos en una tabla que los muestra
                mensualmente.<br/><br/>
                En este caso, los datos son "interpolados" para permitirte tener órdenes de magnitud y poder
                comparar indicadores que no recolectas con las mismas periodicidades entre ellos.<br/>
                Esto también ocurre si estás consultando un indicador calculado, por ejemplo, un porcentaje, pero el numerador
                y el denominador no se recopilan con la misma periodicidad.<br/><br/>
                Por ejemplo, si recopilaste el número de nacimientos esperados en una maternidad por trimestre, pero
                los consultas por mes, Monitool distribuirá el número de nacimientos trimestrales en cada mes, corrigiendo
                según el número de días que contienen.<br/>
                Por lo tanto, el símbolo ≈ siempre se muestra para recordarte que los datos que estás consultando son aproximaciones
                groseras de la realidad y que solo pueden servir para tener órdenes de magnitud.
            `,
        },
        {
            prefixes: ['project.usage.general', 'project.usage.olap'],
            question: `¿Por qué algunos datos se muestran en <i>itálica</i>?`,
            answer: /* html */ `
                Los datos mostrados en <i>itálica</i> solo se han ingresado parcialmente. La mayoría de las veces, esto significa que
                solo se han ingresado algunos de los lugares de recolección esperados.
                El caso también puede ocurrir si estás consultando una versión agregada (por ejemplo, trimestralmente) de datos recopilados
                a una periodicidad más corta (por ejemplo, mensualmente) y no se han recopilado todos los meses del trimestre considerado.<br/>
                Al desagregar la línea con el botón <i class="fa fa-plus"></i> podrás encontrar fácilmente las entradas que faltan.`,
        },
    ],
};
