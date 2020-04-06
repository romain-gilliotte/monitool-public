import angular from 'angular';
import uiDropdown from 'angular-ui-bootstrap/src/dropdown';
import mtAclProjectRole from '../../../directives/acl/project-role';
import mtColumnsPanel from '../../shared/misc/columns-panel';

require(__cssPath);

const module = angular.module(__moduleName, [uiDropdown, mtAclProjectRole, mtColumnsPanel]);

module.component(__componentName, {
    bindings: {
        project: '<',
    },
    template: require(__templatePath),

    controller: class {

        $onChanges() {
            this.isFavorite = 'favorites::projects::' + this.project._id
        }

        toggleFavorite() {
            const lsKey = 'favorites::projects::' + this.project._id

            if (localStorage[lsKey])
                delete localStorage[lsKey];
            else
                localStorage[lsKey] = 'yes';

            this.$onChanges();
            this.$window.scrollTo(0, 0);
        }


    }
});

export default module.name;
