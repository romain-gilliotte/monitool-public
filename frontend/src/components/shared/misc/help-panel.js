import angular from 'angular';
import helpFr from '../../../translation/fr/help';
import helpEn from '../../../translation/fr/help';
import helpEs from '../../../translation/fr/help';

require(__scssPath);

const module = angular.module(__moduleName, []);

module.component(__componentName, {
    bindings: {},
    transclude: true,
    template: require(__templatePath),
    controller: class {

        constructor($rootScope, $sce, $transitions, $state) {
            "ngInject";

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
            try {
                this.title = this.$sce.trustAsHtml(help.pages[this.page].title);
                this.paragraph = this.$sce.trustAsHtml(help.pages[this.page].paragraph);
                this.qas = help.qas
                    .filter(qa => qa.prefixes.some(prefix => this.page.startsWith(prefix)))
                    .map(qa => ({
                        question: this.$sce.trustAsHtml(qa.question),
                        answer: this.$sce.trustAsHtml(qa.answer),
                        selected: false
                    }));
            }
            catch (e) {
                console.log(`Missing help section: ${this.page}`);
                this.title = this.paragraph = '';
                this.qas = [];
            }
        }

        onQaClick(qa) {
            qa.selected = !qa.selected;
        }

    }
});

export default module.name;
