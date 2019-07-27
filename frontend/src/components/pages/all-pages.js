import angular from 'angular';

import sessionInit from "./session-init/init";
import sessionLogin from "./session-login/login";
import sessionRegister from "./session-register/register";
import sessionRecover from "./session-recover/recover";

import menu from "./menu/menu";

import projectList from "./project-list/list";

import projectMenu from "./project-menu/menu";
import projectStructMenu from "./project-structure-menu/menu";
import projectStructHome from "./project-structure-home/home";
import projectStructBasics from "./project-structure-basics/basics";
import projectStructSites from "./project-structure-sites/sites";
import projectStructDsList from "./project-structure-data-source/data-source-list";
import projectStructDsEdit from "./project-structure-data-source/data-source-edit";
import projectStructExtra from "./project-structure-extra-indicators/extra-indicators";
import projectStructHistory from "./project-structure-history/history";
import projectStructLfList from "./project-structure-logical-frame/logframe-list";
import projectStructLfEdit from "./project-structure-logical-frame/logframe-edit";
import projectStructUserList from "./project-structure-user/user-list";

import projectInputMenu from "./project-input-menu/menu";
import projectInputHome from "./project-input-home/home";
import projectInputList from "./project-input-list/input-list";
import projectInputEdition from "./project-input-edition/input-edition";

import projectReportingMenu from "./project-reporting-menu/menu";
import projectReportingHome from "./project-reporting-home/home";
import projectReportingGeneral from "./project-reporting-general/general";
import projectReportingOlap from "./project-reporting-olap/olap";


const module = angular.module(
	'monitool.components.pages.all-pages',
	[
		sessionInit,
		sessionLogin,
		sessionRegister,
		sessionRecover,
		menu,
		projectList,
		projectMenu,
		projectStructMenu,
		projectStructHome,
		projectStructBasics,
		projectStructSites,
		projectStructDsList,
		projectStructDsEdit,
		projectStructExtra,
		projectStructHistory,
		projectStructLfList,
		projectStructLfEdit,
		projectStructUserList,
		projectInputMenu,
		projectInputHome,
		projectInputList,
		projectInputEdition,
		projectReportingMenu,
		projectReportingHome,
		projectReportingGeneral,
		projectReportingOlap
	]
);

export default module.name;
