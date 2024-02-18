import angular from 'angular';
import helpFr from '../../../translation/fr/help';
import helpEn from '../../../translation/en/help';
import helpEs from '../../../translation/es/help';

require(__scssPath);

const module = angular.module(__moduleName, []);

module.component(__componentName, {
    bindings: {},
    transclude: true,
    template: require(__templatePath),
    controller: class {
        constructor($rootScope, $sce, $transitions, $state, $translate) {
            'ngInject';

            this.$rootScope = $rootScope;
            this.$sce = $sce;
            this.$state = $state;
            this.$transitions = $transitions;
            this.$translate = $translate;
        }

        $onInit() {
            this.page = this.$state.$current.name;
            this.updateDisplay();

            // Listen for language change event
            this._cancelTranslationChangeListener = this.$rootScope.$on(
                'languageChange',
                this._onLanguageChange.bind(this)
            );

            this._cancelTransitionListener = this.$transitions.onStart(
                {},
                this._onTransition.bind(this)
            );
        }

        $onDestroy() {
            this._cancelTransitionListener();
            this._cancelTranslationChangeListener();
        }

        _onLanguageChange() {
            this.updateDisplay();
        }

        _onTransition(transition) {
            this.page = transition.to().name;
            this.updateDisplay();
        }

        updateDisplay() {
            const help = { fr: helpFr, en: helpEn, es: helpEs }[this.$rootScope.language];
            try {
                this.title = this.$sce.trustAsHtml(help.pages[this.page].title);
                this.paragraph = this.$sce.trustAsHtml(help.pages[this.page].paragraph);
                this.qas = help.qas
                    .filter(qa => qa.prefixes.some(prefix => this.page.startsWith(prefix)))
                    .map(qa => ({
                        question: this.$sce.trustAsHtml(qa.question),
                        answer: this.$sce.trustAsHtml(qa.answer),
                        selected: false,
                    }));
            } catch (e) {
                console.log(`Missing help section: ${this.page}`);
                this.title = this.paragraph = '';
                this.qas = [];
            }
        }

        onQaClick(qa) {
            qa.selected = !qa.selected;
        }
    },
});

export default module.name;
