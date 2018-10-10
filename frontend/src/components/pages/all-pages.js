/*!
 * This file is part of Monitool.
 *
 * Monitool is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Monitool is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with Monitool. If not, see <http://www.gnu.org/licenses/>.
 */

import angular from 'angular';

import sessionInit from "./session-init/init";
import sessionCheckLogin from "./session-checklogin/checklogin";
import sessionLogin from "./session-login/login";
import sessionRegister from "./session-register/register";

import home from "./home/home";
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

import projectOrgMenu from "./project-organisation-menu/menu";
import projectOrgHome from "./project-organisation-home/home";
import projectOrgLink from "./project-organisation-link/link";

import projectInputMenu from "./project-input-menu/menu";
import projectInputHome from "./project-input-home/home";
import projectInputList from "./project-input-list/input-list";
import projectInputEdition from "./project-input-edition/input-edition";

import projectReportingMenu from "./project-reporting-menu/menu";
import projectReportingHome from "./project-reporting-home/home";
import projectReportingGeneral from "./project-reporting-general/general";
import projectReportingOlap from "./project-reporting-olap/olap";

import orgList from "./organisation-list/list";

import orgMenu from "./organisation-menu/menu";
import orgStructMenu from './organisation-structure-menu/menu';
import orgStructHome from "./organisation-structure-home/home";
import orgStructBasics from "./organisation-structure-basics/basics";
import orgStructThematics from "./organisation-structure-thematics/thematics";
import orgStructInvitations from "./organisation-structure-invitations/invitations";

import orgReportingMenu from './organisation-reporting-menu/menu';
import orgReportingHome from './organisation-reporting-home/home';
import orgReportingProject from "./organisation-reporting-project/project";
import orgReportingIndicators from './organisation-reporting-indicators/indicators';
import orgReportingIndicator from './organisation-reporting-indicator/indicator';


const module = angular.module(
	'monitool.components.pages.all-pages',
	[
		sessionInit,
		sessionCheckLogin,
		sessionLogin,
		sessionRegister,
		home,
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
		projectOrgMenu,
		projectOrgHome,
		projectOrgLink,
		projectInputMenu,
		projectInputHome,
		projectInputList,
		projectInputEdition,
		projectReportingMenu,
		projectReportingHome,
		projectReportingGeneral,
		projectReportingOlap,
		orgList,
		orgMenu,
		orgStructMenu,
		orgStructHome,
		orgStructBasics,
		orgStructThematics,
		orgStructInvitations,
		orgReportingMenu,
		orgReportingHome,
		orgReportingProject,
		orgReportingIndicators,
		orgReportingIndicator
	]
);

export default module.name;
