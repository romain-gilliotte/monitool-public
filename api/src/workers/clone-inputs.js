Input.storeInstance.listByProject(ctx.request.query.from).then(inputs => {
    inputs.forEach(input => {
        input._id = ['input', project._id, input.form, input.entity, input.period].join(':');
        input.project = project._id;
    });

    Input.storeInstance.bulkSave(inputs);
});