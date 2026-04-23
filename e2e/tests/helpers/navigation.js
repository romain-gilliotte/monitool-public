exports.ensureAngularApp = async page => {
  if (!page.url().includes('app.html')) {
    await page.goto('/app.html');
    await page.waitForURL(/app\.html/);
  }
};
