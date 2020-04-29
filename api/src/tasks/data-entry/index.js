const axios = require('axios');
const _ = require('lodash');
const cv = require('opencv4nodejs');
const client = require('twilio')();
const { extractPage } = require('./cv/extract-page');
const { readQrCode } = require('./cv/extract-context');
const { extractVariables } = require('./cv/extract-variables');

const width = 1050;
const height = 1485;

queue.process('process-whatapp-msg', async job => {
    const projects = database.collection('project');
    const dataentries = database.collection('input_img');
    const { From, To, MediaUrl0, Body } = job.data;

    let reply;
    try {
        // Load image & convert to grayscale.
        const response = await axios.get(MediaUrl0, { responseType: 'arraybuffer' });
        const image = cv.imdecode(response.data);
        // try to have createCLAHE working, which looks very promising to improve the pictures.

        // Extract page.
        const page = extractPage(image, width, height);

        // Read code, load form and reply
        const { projectId, dataSourceIdPrefix, pageNo, orientation, language } = readQrCode(page);
        const project = await projects.findOne({ _id: projectId });
        const dataSource = project.forms.find(ds => ds.id.startsWith(dataSourceIdPrefix));

        dataentries.insertOne({
            projectId: project._id,
            dataSourceId: dataSource.id,
            receivedAt: new Date(),
            from: From,
            to: To,
            body: Body,
            page: toPNG(page),
            sections: _.mapValues(
                extractVariables(project, dataSource, orientation, language, page, pageNo),
                toPNG
            ),
        });

        reply = `J'ai recu une photo de la page ${pageNo} de ${dataSource.name} dans le project ${project.name}`;
    } catch (e) {
        if (e.message.includes('"url" argument must be of type string')) {
            reply = `Bonjour! Je ne suis pas un robot conversationel. Je ne comprend que les photos de formulaires!`;
        } else if (e.message.includes('getPoints')) {
            reply = `J'arrive pas à différencier le formulaire du fond. Tu peux prendre la photo autrement?`;
        } else if (e.message.includes('QR-Code')) {
            reply = `Je vois bien le formulaire, mais j'arrive pas à lire le QR-Code`;
        } else if (e.message.includes(`Cannot read property 'forms' of null`)) {
            reply = `Votre photo ressemble bien à un formulaire Monitool, mais je ne trouve pas le projet qui correspond.`;
        } else {
            reply = `J'ai eu une erreur que j'attendais pas: ${e.message}`;
        }

        console.log(e);
    }

    await client.messages.create({ from: To, to: From, body: reply });
});

function toPNG(image) {
    const clean = image.cvtColor(cv.COLOR_BGR2GRAY).normalize(0, 255, cv.NORM_MINMAX);
    return cv.imencode('.png', clean, [cv.IMWRITE_PNG_COMPRESSION, 9]);
}
