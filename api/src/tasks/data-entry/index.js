const axios = require('axios');
const cv = require('opencv4nodejs');
const client = require('twilio')();
const { extractPage } = require('./cv/extract-page');
const { readQrCode } = require('./cv/extract-context');

const width = 1050;
const height = 1485;

queue.process('process-whatapp-msg', async job => {
    const collection = database.collection('project');
    const { From, To, MediaUrl0, Body } = job.data;

    let reply;
    try {
        // Load image.
        const response = await axios.get(MediaUrl0, { responseType: 'arraybuffer' });
        const image = cv.imdecode(response.data).cvtColor(cv.COLOR_BGR2GRAY);

        // Extract page.
        const page = extractPage(image, width, height).normalize(0, 255, cv.NORM_MINMAX);

        // Read code, load form and reply
        const { projectId, dataSourceIdPrefix, pageNum } = readQrCode(page);
        const project = await collection.findOne({ _id: projectId });
        const dataSource = project.forms.find(ds => ds.id.startsWith(dataSourceIdPrefix));

        reply = `J'ai recu une photo de la page ${pageNum} de ${dataSource.name} dans le project ${project.name}`;
    } catch (e) {
        if (e.message.includes('"url" argument must be of type string')) {
            reply = `Bonjour! Je ne suis pas un robot conversationel. Je ne comprend que les photos de formulaires!`;
        } else if (e.message.includes('getPoints')) {
            reply = `J'arrive pas à différencier le formulaire du fond. Tu peux prendre la photo autrement?`;
        } else if (e.message.includes('QR-Code')) {
            reply = `Je vois bien le formulaire, mais j'arrive pas à lire le QR-Code`;
        } else {
            reply = `J'ai eu une erreur que j'attendais pas: ${e.message}`;
        }
    }

    // Reply to user.
    await client.messages.create({ from: To, to: From, body: reply });
});
