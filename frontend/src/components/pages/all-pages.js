import angular from 'angular';

import mainMenu from './main-menu/main-menu';
import mainProjectList from "./main-list/project-list";
import mainInvitations from './main-invitations/main-invitations';

import menu from "./menu/project-menu";

import structMenu from "./structure-menu/project-edit-menu";
import structHome from "./structure-home/project-structure-home";
import structBasics from "./structure-basics/project-basics";
import structSites from "./structure-sites/project-sites";
import structDsList from "./structure-data-source/data-source-list";
import structDsEdit from "./structure-data-source/data-source-edition";
import structExtra from "./structure-extra-indicators/extra-indicator-list";
import structHistory from "./structure-history/history";
import structLfList from "./structure-logical-frame/logical-framework-list";
import structLfEdit from "./structure-logical-frame/logical-frame-edit";
import structUserList from "./structure-user/project-user-list";

import inputMenu from "./input-menu/project-input-menu";
import inputHome from "./input-home/project-input-home";
import inputList from "./input-list/project-input-list";
import inputEdition from "./input-edition/project-input-edition";

import reportingGeneral from "./reporting-general/general-reporting";
import reportingOlap from "./reporting-olap/olap-reporting";

import miscDownloads from './misc-downloads/downloads';

const module = angular.module(
	__moduleName,
	[
		mainMenu,
		mainProjectList,
		mainInvitations,
		menu,
		structMenu,
		structHome,
		structBasics,
		structSites,
		structDsList,
		structDsEdit,
		structExtra,
		structHistory,
		structLfList,
		structLfEdit,
		structUserList,
		inputMenu,
		inputHome,
		inputList,
		inputEdition,
		reportingGeneral,
		reportingOlap,

		miscDownloads
	]
);

export default module.name;
