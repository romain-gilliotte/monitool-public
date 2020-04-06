import angular from 'angular';
import helpFr from '../../../translation/fr/help';
import helpEn from '../../../translation/fr/help';
import helpEs from '../../../translation/fr/help';

require(__cssPath);

const module = angular.module(__moduleName, []);

module.component(__componentName, {
    bindings: {},
    transclude: true,
    template: require(__templatePath),
    controller: class {

        constructor($rootScope, $sce, $transitions, $state) {
            this.language = $rootScope.language;
            this.$transitions = $transitions;
            this.$sce = $sce;
            this.$state = $state;
        }

        $onInit() {
            this.page = this.$state.$current.name;
            this.updateDisplay();

            this._cancelTransitionListener = this.$transitions.onStart(
                {},
                this._onTransition.bind(this)
            );
        }

        $onDestroy() {
            this._cancelTransitionListener();
        }

        _onTransition(transition) {
            this.page = transition.to().name;
            this.updateDisplay();
        }

        updateDisplay() {
            const help = { fr: helpFr, en: helpEn, es: helpEs }[this.language];
            this.title = this.$sce.trustAsHtml(help.pages[this.page].title);
            this.paragraph = this.$sce.trustAsHtml(help.pages[this.page].paragraph);
            this.qas = help.qas
                .filter(qa => qa.pages.includes(this.page))
                .map(qa => ({
                    question: this.$sce.trustAsHtml(qa.question),
                    answer: this.$sce.trustAsHtml(qa.answer),
                    selected: false
                }));
        }

        onQaClick(qa) {
            qa.selected = !qa.selected;
        }

    }
});

export default module.name;
