const Router = require('koa-router');
const PdfPrinter = require('pdfmake');
const gm = require('gm');
const { getProject } = require('../storage/queries');

const router = new Router();

/**
 * Create preconfigured printer
 */
const printer = new PdfPrinter({
    Roboto: {
        normal: 'node_modules/roboto-fontface/fonts/roboto/Roboto-Regular.woff',
        bold: 'node_modules/roboto-fontface/fonts/roboto/Roboto-Medium.woff',
        italics: 'node_modules/roboto-fontface/fonts/roboto/Roboto-RegularItalic.woff',
        bolditalics: 'node_modules/roboto-fontface/fonts/roboto/Roboto-MediumItalic.woff'
    }
});


const strings = Object.freeze({
    fr: Object.freeze({
        intervention_logic: "Logique d'intervention",
        indicators: "Indicateurs",
        verification_sources: "Sources de verification",
        assumptions: "Hypothèses",
        goal: "Objectif général",
        purpose: "Objectif spécifique",
        output: "Résultat",
        activity: "Activité"
    }),
    en: Object.freeze({
        intervention_logic: "Intervention logic",
        indicators: "Indicators",
        verification_sources: "Sources of verification",
        assumptions: "Assumptions",
        goal: "Goal",
        purpose: "Purpose",
        output: "Output",
        activity: "Activity"
    }),
    es: Object.freeze({
        intervention_logic: "Lógica de intervención",
        indicators: "Indicadores",
        verification_sources: "Fuentes de verificación",
        assumptions: "Hipótesis",
        goal: "Objetivo general",
        purpose: "Objetivo específico",
        output: "Resultado",
        activity: "Actividad"
    })
});


/**
 * Render a PDF file describing the given logical frame.
 */
router.get('/resources/project/:id/logical-frame/:logicalFrameId.pdf', async ctx => {
    const result = await getPdfStream(
        ctx.state.profile.email,
        ctx.params.id,
        ctx.params.logicalFrameId,
        ctx.request.query.language,
        ctx.request.query.orientation
    );

    if (result) {
        ctx.response.type = 'application/pdf';
        ctx.response.body = result.stream;
        ctx.response.attachment(`${result.title.substr(0, 16)}.pdf`, { type: 'inline' });
    }
});


router.get('/resources/project/:id/logical-frame/:logicalFrameId.png', async ctx => {
    const result = await getPdfStream(
        ctx.state.profile.email,
        ctx.params.id,
        ctx.params.logicalFrameId,
        ctx.request.query.language,
    );

    if (result) {
        const img = gm(result.stream);

        ctx.response.type = 'image/png';
        ctx.response.body = img.crop(595, 400).stream('PNG');
        ctx.response.attachment(result.title + '.png', { type: 'inline' });
    }
});


async function getPdfStream(userEmail, projectId, logicalFrameworkId, language, orientation = 'portrait') {
    const project = await getProject(userEmail, projectId, {
        'logicalFrames': { $elemMatch: { id: logicalFrameworkId } },
        'forms': true
    });

    if (project && project.logicalFrames.length) {
        const logicalFramework = project.logicalFrames[0];

        // Create document definition.
        const title = logicalFramework.name || 'logical-framework';
        const docDef = computeLogFrameDocDef(logicalFramework, orientation, project.forms, language);

        const stream = printer.createPdfKitDocument(docDef);
        stream.end();
        return { title, stream };
    }
}

function computeLogFrameDocDef(logFrame, pageOrientation, dataSources, language = 'en') {
    var doc = {};
    doc.pageSize = "A4";
    doc.pageOrientation = pageOrientation;
    doc.styles = {
        header: { fontSize: 16, bold: true, alignment: 'center', margin: [100, 0, 100, 0] },
        header3: { fontSize: 16, bold: true, alignment: 'center', margin: [0, 0, 0, 10] },
        header2: { fontSize: 14, bold: true, margin: [0, 15, 0, 0] },
        variableName: { fontSize: 10, bold: true, margin: [0, 10, 0, 5] },
        bold: { bold: true },
        normal: { fontSize: 9 },
        italic: { fontSize: 9, italics: true, margin: [10, 0, 0, 0] }
    };

    doc.content = [
        { text: logFrame.name, style: 'header3' }
    ];

    var table = {
        headersRows: 1,
        widths: ['*', '*', '*', '*'],
        body: [
            [
                { text: strings[language].intervention_logic, style: "bold" },
                { text: strings[language].indicators, style: "bold" },
                { text: strings[language].verification_sources, style: "bold" },
                { text: strings[language].assumptions, style: "bold" }
            ]
        ]
    };

    table.body.push([
        [
            { text: strings[language].goal, style: "bold" },
            { text: logFrame.goal, style: 'normal' }
        ],
        ...computeIndicatorsSourcesDocDef(logFrame.indicators, dataSources),
        ""
    ]);

    logFrame.purposes.forEach(function (purpose, purposeIndex) {
        table.body.push([
            [
                { text: `${strings[language].purpose} ${logFrame.purposes.length > 1 ? ` ${purposeIndex + 1}` : ""}`, style: "bold" },
                { text: purpose.description, style: 'normal' }
            ],
            ...computeIndicatorsSourcesDocDef(purpose.indicators, dataSources),
            { text: purpose.assumptions, style: 'normal' }
        ]);
    });

    logFrame.purposes.forEach(function (purpose, purposeIndex) {
        purpose.outputs.forEach(function (output, outputIndex) {
            table.body.push([
                [
                    { text: strings[language].output + " " + (logFrame.purposes.length > 1 ? " " + (purposeIndex + 1) + '.' : "") + (outputIndex + 1), style: "bold" },
                    { text: output.description, style: 'normal' }
                ],
                ...computeIndicatorsSourcesDocDef(output.indicators, dataSources),
                { text: output.assumptions, style: 'normal' }
            ]);
        });
    });

    logFrame.purposes.forEach(function (purpose, purposeIndex) {
        purpose.outputs.forEach(function (output, outputIndex) {
            output.activities.forEach(function (activity, activityIndex) {

                table.body.push([
                    [
                        { text: `${strings[language].activity} ${logFrame.purposes.length > 1 ? ` ${purposeIndex + 1}.` : ""}${outputIndex + 1}.${activityIndex + 1}`, style: "bold" },
                        { text: activity.description, style: 'normal' }
                    ],
                    ...computeIndicatorsSourcesDocDef(activity.indicators, dataSources),
                    " "
                ]);
            });
        });
    });

    doc.content.push({ table: table });
    return doc;
}

function computeIndicatorsSourcesDocDef(indicators, dataSources) {
    let myDataSources = dataSources.map(ds => Object.assign({}, ds));

    let index = 1;
    myDataSources.forEach(ds => {
        ds.elements = ds.elements.filter(variable => {
            return indicators.some(i => {
                return i.computation
                    && Object.values(i.computation.parameters).some(param => param.elementId === variable.id);
            });
        });

        ds.elements.forEach(variable => {
            variable.index = index++;
        });
    });

    myDataSources = myDataSources.filter(ds => ds.elements.length > 0);

    return [
        {
            ul: indicators.map(i => {
                let indexes;
                try {
                    indexes = Object.values(i.computation.parameters).map(param => {
                        return myDataSources
                            .find(ds => ds.elements.some(variable => variable.id == param.elementId))
                            .elements.find(variable => variable.id == param.elementId)
                            .index;
                    });

                    indexes = [...new Set(indexes)].sort();

                    if (indexes.length == 0)
                        indexes = ['F']
                }
                catch (e) {
                    indexes = ['?'];
                }

                return `${i.display}${indexes.length ? ` [${indexes.join(', ')}]` : ''}`;
            }),
            style: 'normal'
        },
        {
            ul: myDataSources.map(ds => {
                return [
                    ds.name,
                    ...ds.elements.map(variable => {
                        return { text: `${variable.index}.${variable.name}`, style: 'italic' }
                    })
                ]
            }),
            style: 'normal'
        }
    ];
}



module.exports = router;
