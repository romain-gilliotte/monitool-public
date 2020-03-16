const Router = require('koa-router');
const PdfPrinter = require('pdfmake');
const Project = require('../resource/model/project');

const router = new Router();

/**
 * More boilerplate needed to start-up pdfmake
 */
const styles = {
    header: { fontSize: 16, bold: true, alignment: 'center', margin: [100, 0, 100, 0] },
    header3: { fontSize: 16, bold: true, alignment: 'center', margin: [0, 0, 0, 10] },
    header2: { fontSize: 14, bold: true, margin: [0, 15, 0, 0] },
    variableName: { fontSize: 10, bold: true, margin: [0, 10, 0, 5] },
    bold: { bold: true },
    normal: { fontSize: 9 },
    italic: { fontSize: 9, italics: true, margin: [10, 0, 0, 0] }
};

/**
 * Create preconfigured printer
 */
const printer = new PdfPrinter({
    Roboto: {
        normal: 'node_modules/roboto-fontface/fonts/Roboto/Roboto-Regular.ttf',
        bold: 'node_modules/roboto-fontface/fonts/Roboto/Roboto-Medium.ttf',
        italics: 'node_modules/roboto-fontface/fonts/Roboto/Roboto-RegularItalic.ttf',
        bolditalics: 'node_modules/roboto-fontface/fonts/Roboto/Roboto-MediumItalic.ttf'
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
    const project = await Project.storeInstance.get(ctx.params.id);
    const logicalFramework = project.getLogicalFrameById(ctx.params.logicalFrameId)

    // Create document definition.
    const title = logicalFramework.name || 'logical-framework';
    const docDef = logicalFramework.getPdfDocDefinition(ctx.request.query.orientation, project.forms, ctx.request.query.language);
    docDef.styles = styles;

    // Send to user.
    ctx.response.type = 'application/pdf';
    ctx.response.body = printer.createPdfKitDocument(docDef);
    ctx.response.attachment(title + '.pdf');
    ctx.response.body.end();
});


function getPdfDocDefinition(pageOrientation, dataSources, language = 'en') {
    var doc = {};
    doc.pageSize = "A4";
    doc.pageOrientation = pageOrientation;

    doc.content = [
        { text: this.name, style: 'header3' }
    ];

    var table = {
        headersRows: 1,
        width: ['auto', 'auto', 'auto', 'auto'],
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
            { text: this.goal, style: 'normal' }
        ],
        ...this._computeIndicatorsSources(this.indicators, dataSources),
        ""
    ]);

    this.purposes.forEach(function (purpose, purposeIndex) {
        table.body.push([
            [
                { text: strings[language].purpose + " " + (this.purposes.length > 1 ? " " + (purposeIndex + 1) : ""), style: "bold" },
                { text: purpose.description, style: 'normal' }
            ],
            ...this._computeIndicatorsSources(purpose.indicators, dataSources),
            { text: purpose.assumptions, style: 'normal' }
        ]);
    }, this);

    this.purposes.forEach(function (purpose, purposeIndex) {
        purpose.outputs.forEach(function (output, outputIndex) {
            table.body.push([
                [
                    { text: strings[language].output + " " + (this.purposes.length > 1 ? " " + (purposeIndex + 1) + '.' : "") + (outputIndex + 1), style: "bold" },
                    { text: output.description, style: 'normal' }
                ],
                ...this._computeIndicatorsSources(output.indicators, dataSources),
                { text: output.assumptions, style: 'normal' }
            ]);
        }, this);
    }, this);

    this.purposes.forEach(function (purpose, purposeIndex) {
        purpose.outputs.forEach(function (output, outputIndex) {
            output.activities.forEach(function (activity, activityIndex) {

                table.body.push([
                    [
                        { text: strings[language].activity + " " + (this.purposes.length > 1 ? " " + (purposeIndex + 1) + '.' : "") + (outputIndex + 1) + '.' + (activityIndex + 1), style: "bold" },
                        { text: activity.description, style: 'normal' }
                    ],
                    ...this._computeIndicatorsSources(activity.indicators, dataSources),
                    " "
                ]);
            }, this);
        }, this);
    }, this);


    doc.content.push({ table: table });
    return doc;
}

function _computeIndicatorsSources(indicators, dataSources) {
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

                return i.display + (indexes.length ? ' [' + indexes.join(', ') + ']' : '');
            }),
            style: 'normal'
        },
        {
            ul: myDataSources.map(ds => {
                return [
                    ds.name,
                    ...ds.elements.map(variable => {
                        return { text: variable.index + '. ' + variable.name, style: 'italic' }
                    })
                ]
            }),
            style: 'normal'
        }
    ];
}



module.exports = router;
