exports.gotoLogin = async page => {
  await page.goto('#!/login');
  await page.waitForURL(/#!\/login/);
  await page.getByTestId('login-form').waitFor({ state: 'visible' });
};

exports.login = async (page, email, password) => {
  await page.getByTestId('email-input').fill(email);
  await page.getByTestId('password-input').fill(password);
  await page.getByTestId('login-submit').click();
};

exports.expectLoginFormVisible = async page => {
  await page.getByTestId('login-form').waitFor({ state: 'visible' });
  await Promise.all([
    page.getByTestId('email-input').waitFor({ state: 'visible' }),
    page.getByTestId('password-input').waitFor({ state: 'visible' }),
    page.getByTestId('login-submit').waitFor({ state: 'visible' }),
  ]);
};

exports.expectOAuthButtonsVisible = async page => {
  await Promise.all([
    page.getByText('Continue with Google').waitFor({ state: 'visible' }),
    page.getByText('Continue with Microsoft').waitFor({ state: 'visible' }),
  ]);
};
