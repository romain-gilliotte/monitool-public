// Always start the Angular app and let it handle authentication
import('./app')
  .then(startApp => startApp.default())
  .catch(e => {
    console.error('Failed to start app:', e);
    document.body.innerHTML = `<div style="text-align: center; margin-top: 50px;"><h1>Application Error</h1><p>${e.message}</p></div>`;
  });
