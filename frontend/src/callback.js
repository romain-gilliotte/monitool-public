import auth from './auth';

auth.userhandler = {
    onSuccess: function (result) {
        window.location.href = auth.getState() || '/';
    },
    onFailure: function (err) {
        console.log("Error!", err);
    }
};

auth.parseCognitoWebResponse(window.location.href);
