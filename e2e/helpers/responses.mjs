// Shared Playwright response matchers for the API calls specs wait on. Arm one
// before the action that triggers the request, e.g.
//   await Promise.all([waitInputSaved(page), saveBtn.click()]);
// axios prefixes /api, so URLs contain /project/<id>; we match the HTTP method
// and require an ok() status.

// PUT /project/<id> — saving an existing project's configuration. Pass a pid to
// tighten the URL match when the spec knows exactly which project it saved.
export function waitProjectSaved(page, pid = '[^/]+') {
    const re = new RegExp(`/project/${pid}(\\?|$)`);
    return page.waitForResponse(r => r.request().method() === 'PUT' && re.test(r.url()) && r.ok());
}

// POST /project — creating a new project.
export function waitProjectCreated(page) {
    return page.waitForResponse(
        r => r.request().method() === 'POST' && /\/project(\?|$)/.test(r.url()) && r.ok()
    );
}

// POST /project/<id>/input — persisting a data-entry form.
export function waitInputSaved(page) {
    return page.waitForResponse(
        r =>
            r.request().method() === 'POST' &&
            /\/project\/[^/]+\/input(\?|$)/.test(r.url()) &&
            r.ok()
    );
}

// GET /project/<id>/report/<query> — a (re)computed report response.
export function waitReport(page) {
    return page.waitForResponse(r => /\/project\/[^/]+\/report\//.test(r.url()) && r.ok());
}
