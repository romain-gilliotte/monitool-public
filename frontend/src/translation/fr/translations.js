export default {
    shared: {
        yes: 'Oui',
        no: 'Non',
        archive: 'Archiver',
        enable: 'Réactiver la saisie',
        disable: 'Désactiver la saisie',
        accept_invitation: 'Accepter',
        refuse_invitation: 'Refuser',
        uninvite: 'Retirer de mes projets',
        no_invitations: "Vous n'avez aucune invitation en attente!",
        no_invitations_back: 'Retournez à la liste de vos projet',

        configure: 'Configuration',
        back: 'Retour',
        project_list: 'Liste des projets',
        none: 'Aucune',
        percentage_done: '{{value}}% réalisé',
        percentage_incomplete: '{{value}}% en cours',
        percentage_missing: '{{value}}% manquant',

        task: 'Tâche',
        state: 'État',
        open: 'Ouvrir',
        loading: 'Chargement en cours...',
        restore: 'Restaurer',
        description: 'Description',

        country: 'Pays',
        apply: 'Appliquer les modifications',
        clone: 'Cloner',
        clone_structure: 'Cloner structure',
        clone_all: 'Cloner structure et données',
        home: 'Accueil',

        date: 'Date',

        project: 'Projet',
        indicator: 'Indicateur',
        indicators: 'Indicateurs',
        help: 'Questions fréquentes',
        name: 'Nom',
        start: 'Début',
        end: 'Fin',

        add: 'Ajouter',
        save: 'Sauvegarder',
        remove: 'Retirer',
        remove_changes: 'Annuler les modifications',
        edit: 'Modifier',
        delete: 'Supprimer',

        members: 'Membres',

        logical_frames: 'Cadres logiques',
        reporting: 'Rapport',
        reporting_general: 'Rapport général',
        colorize: 'Colorer',

        logout: 'Déconnecter',

        sure_to_leave:
            'Vous avez realisé des changements. Êtes-vous sûr de vouloir quitter sans sauvegarder?',
    },
    menu: {
        language: 'Langue',
        french: 'Français',
        spanish: 'Espagnol',
        english: 'Anglais',
    },
    welcome: {
        i_got_it: "J'ai compris",
        text: /* html */ `
            <legend>Bienvenu!</legend>
            <p>C'est votre première visite sur Monitool.</p>
            <p>
                Afin de vous aider à appréhender l'outil nous avons créé un premier projet dans votre
                espace!<br />
                Il utilise la majorité des fonctionalitées de l'outil, et pourra vous servir de référence.
            </p>
            <ul>
                <li>
                    Pour consulter ses rapports et saisir des nouvelles données, cliquez sur
                    <span class="btn btn-default btn-xxs">
                        <i class="fa fa-fw fa-play"></i>
                        <span translate="shared.open"></span>
                    </span>
                </li>
                <li>
                    Pour accéder à sa configuration, cliquez sur
                    <span class="btn btn-default btn-xxs"><span class="caret"></span></span>
                    puis sur
                    <span class="btn btn-default btn-xxs">
                        <i class="fa fa-fw fa-cogs"></i>
                        <span translate="shared.configure"></span>
                    </span>
                </li>
            </ul>
            <p>
                Sur toutes les pages, un panneau dépliant d'aide est disponible.<br />
                Son contenu s'adapte à la page sur laquelle vous êtes, n'hésitez-pas à le consulter!<br />
                Pour y accéder:
            </p>
            <ul style="margin-bottom: 20px">
                <li>Déplacez le pointeur de votre souris sur la barre latéral à droite de votre écran.</li>
                <li>Attendez un court instant.</li>
            </ul>
        `,
    },
    invitation: {
        no_invitations_yet:
            "Vous n'avez pas encore invité d'autres personnes à participer à votre projet",
        add_invitation: 'Inviter une personne',
        email: 'Email',
        help_email: "Quel est l'email de la personne que vous désirez inviter?",
        help_sites: "Sur quels lieux de collecte cette personne pourra-t'elle saisir?",
        help_datasources: " Sur quels sources de données cette personne pourra-t'il saisir?",
        accepted: 'Acceptée',
        contact: 'Contact',
        data_entry_perms: 'Permissions saisie',
        create_invitation: "Envoyer l'invitation",
        update_invitation: "Mettre à jour l'invitation",
    },
    project: {
        no_logframe_yet: "Vous n'avez pas encore créé de cadre logique sur ce projet",
        show_all_projects: 'Afficher tous les projets ({{count}})',
        no_projects: "Vous n'avez aucun projet",
        download_portrait: 'Télécharger PDF (Portrait)',
        download_landscape: 'Télécharger PDF (Landscape)',
        download_excel: 'Télécharger Excel',

        time_to_fill: 'Durée estimée saisie',
        confirm_delete_site: `Si vous supprimez ce site, vous ne pourrez plus accéder à ses données dans les rapports. Confirmez pour supprimer.`,
        confirm_delete_datasource: `Si vous supprimez cette source de données, vous ne pourrez plus accéder à ses données dans les rapports, ni en indicateurs qui en dépendent. Confirmez pour supprimer.`,
        total: 'Total',
        variables: 'Variables',
        owner: 'Propriétaire',
        invitations: 'Invitations',
        downloads: 'Téléchargements',
        last_entry: 'Dernière saisie',
        show_totals: 'Afficher les totaux',
        add_datasource: 'Créer une nouvelle source de données',
        no_matches: 'Aucun projet ne correspond à vos critères de recherche',
        is_finished: 'Ce projet est terminé',
        was_archived: 'Ce projet a été archivé',
        show_ongoing_projects: 'Afficher les projets en cours ({{count}})',
        show_finished_projects: 'Afficher les projets terminés ({{count}})',
        show_archived_projects: 'Afficher les projets archivés ({{count}})',
        filter_placeholder: 'Rentrez du texte pour filtrer les projets',

        revisions: 'Historique',
        revision_datetime: 'Date & Utilisateur',
        revision_changes: 'Modifications apportées au projet',
        revision_restore: 'Revenir à ce point',
        revision_save_to_confirm: 'Sauvegardez pour confirmer de revenir à ce point',
        revision_is_equivalent: "Ce point est équivalent à l'état actuel du projet",
        revision_none: "Pas d'historique disponible sur ce projet",
        revision_show_more: 'Voir plus de modifications',

        history: {
            active_replace: "{{after ? 'Restaure' : 'Supprime'}} le projet",
            name_replace:
                'Renomme le projet de <code>{{before}}</code> vers <code>{{after}}</code>',
            start_replace:
                'Modifie la date de début du projet de <code>{{before|date}}</code> vers <code>{{after|date}}</code>',
            end_replace:
                'Modifie la date de fin du projet de <code>{{before|date}}</code> vers <code>{{after|date}}</code>',
            country_replace:
                'Modifie le pays du projet de <code>{{before}}</code> vers <code>{{after}}</code>',

            entities_add: 'Ajoute le lieu <code>{{item.name}}</code>',
            entities_move: 'Reordonne les lieux du projet',
            entities_remove: 'Supprime le lieu <code>{{item.name}}</code>',
            entities_name_replace:
                'Renomme le lieu <code>{{before}}</code> en <code>{{after}}</code>',
            entities_active_replace:
                "{{after ? 'Active' : 'Désactive'}} la saisie sur le site <code>{{entity.name}}</code>",

            groups_add: 'Ajoute le groupe <code>{{item.name}}</code>',
            groups_move: 'Reordonne les groupes du projet',
            groups_remove: 'Supprime le groupe <code>{{item.name}}</code>',
            groups_name_replace:
                'Renomme le groupe <code>{{before}}</code> en <code>{{after}}</code>',
            groups_members_add:
                'Ajoute le lieu <code>{{item.name}}</code> au groupe <code>{{group.name}}</code>',
            groups_members_move: 'Reordonne les lieux du groupe <code>{{group.name}}</code>',
            groups_members_remove:
                'Retire le lieu <code>{{item.name}}</code> du groupe <code>{{group.name}}</code>',

            forms_add: 'Ajoute la source de données <code>{{item.name}}</code>',
            forms_move: 'Reordonne les sources de données du projet',
            forms_replace:
                'Remplace la source de données <code>{{before.name}}</code> par <code>{{after.name}}</code>',
            forms_remove: 'Supprime la source de données <code>{{item.name}}</code>',
            forms_name_replace:
                'Renomme la source de données <code>{{before}}</code> en <code>{{after}}</code>',
            forms_periodicity_replace:
                'Change la périodicité de <code>{{form.name}}</code> de <code>{{before}}</code> vers <code>{{after}}</code>',
            forms_active_replace:
                "{{after ? 'Active' : 'Désactive'}} la saisie de la source de données <code>{{form.name}}</code>",

            forms_entities_add:
                'Ajoute le lieu <code>{{item.name}}</code> à la source de données <code>{{form.name}}</code>',
            forms_entities_move:
                'Reordonne les lieux de la source de données <code>{{form.name}}</code>',
            forms_entities_remove:
                'Retire le lieu <code>{{item.name}}</code> de la source de données <code>{{form.name}}</code>',
            forms_entities_replace:
                'Remplace le lieu <code>{{beforeItem.name}}</code> par <code>{{afterItem.name}}</code> dans la source de données <code>{{form.name}}</code>',

            forms_elements_add:
                'Ajoute la variable <code>{{item.name}}</code> dans <code>{{form.name}}</code>',
            forms_elements_move:
                'Reordonne les variables de la source de données <code>{{form.name}}</code>',
            forms_elements_remove:
                'Supprime la variable <code>{{item.name}}</code> dans <code>{{form.name}}</code>',
            forms_elements_replace:
                'Remplace la variable <code>{{before.name}}</code> par <code>{{after.name}}</code> dans <code>{{form.name}}</code>',

            forms_elements_name_replace:
                'Renomme la variable <code>{{before}}</code> en <code>{{after}}</code>',
            forms_elements_active_replace:
                "{{after ? 'Active' : 'Désactive'}} la saisie de la variable <code>{{variable.name}}</code>",
            forms_elements_geoAgg_replace:
                "Change la règle d'aggrégation (lieux) de <code>{{variable.name}}</code> de <code>{{before}}</code> vers <code>{{after}}</code>",
            forms_elements_timeAgg_replace:
                "Change la règle d'aggrégation (temps) de <code>{{variable.name}}</code> de <code>{{before}}</code> vers <code>{{after}}</code>",
            forms_elements_distribution_replace:
                'Change la présentation de la saisie de la variable <code>{{variable.name}}</code>',

            forms_elements_partitions_add:
                'Ajoute la désagrégation <code>{{item.name}}</code> dans <code>{{variable.name}}</code>',
            forms_elements_partitions_move:
                'Reordonne les désagrégations de <code>{{variable.name}}</code>',
            forms_elements_partitions_remove:
                'Supprime la désagrégation <code>{{item.name}}</code> de <code>{{variable.name}}</code>',
            forms_elements_partitions_name_replace:
                'Renomme la désagrégation <code>{{before}}</code> en <code>{{after}}</code> dans la variable <code>{{variable.name}}</code>',
            forms_elements_partitions_active_replace:
                "{{after ? 'Active' : 'Désactive'}} la saisie de la désagrégation <code>{{partition.name}}</code> de la variable <code>{{variable.name}}</code>",
            forms_elements_partitions_aggregation_replace:
                "Change la règle d'aggrégation de <code>{{before}}</code> vers <code>{{after}}</code> pour la variable <code>{{variable.name}}</code>",

            forms_elements_partitions_elements_add:
                "Ajoute l'élément <code>{{item.name}}</code> dans la désagrégation <code>{{partition.name}}</code> de la variable <code>{{variable.name}}</code>",
            forms_elements_partitions_elements_move:
                'Reordonne les éléments de la désagrégation <code>{{partition.name}}</code> de la variable <code>{{variable.name}}</code>',
            forms_elements_partitions_elements_remove:
                "Supprime l'élément <code>{{item.name}}</code> dans la désagrégation <code>{{partition.name}}</code> de la variable <code>{{variable.name}}</code>",
            forms_elements_partitions_elements_name_replace:
                'Renomme <code>{{before}}</code> en <code>{{after}}</code> dans la désagrégation <code>{{partition.name}}</code> de la variable <code>{{variable.name}}</code>',
            forms_elements_partitions_elements_active_replace:
                "{{after ? 'Active' : 'Désactive'}} la saisie de l'élément <code>{{element.name}}</code> de la désagrégation <code>{{partition.name}}</code> de la variable <code>{{variable.name}}</code>",

            forms_elements_partitions_groups_add:
                'Ajoute le groupe <code>{{item.name}}</code> dans la désagrégation <code>{{partition.name}}</code> de la variable <code>{{variable.name}}</code>',
            forms_elements_partitions_groups_move:
                'Reordonne les groupes de la désagrégation <code>{{partition.name}}</code> de la variable <code>{{variable.name}}</code>',
            forms_elements_partitions_groups_remove:
                'Supprime le groupe <code>{{item.name}}</code> dans la désagrégation <code>{{partition.name}}</code> de la variable <code>{{variable.name}}</code>',
            forms_elements_partitions_groups_name_replace:
                'Renomme le groupe <code>{{before}}</code> en <code>{{after}}</code> dans la désagrégation <code>{{partition.name}}</code> de la variable <code>{{variable.name}}</code>',
            forms_elements_partitions_groups_members_add:
                'Ajoute <code>{{item.name}}</code> au groupe <code>{{group.name}}</code> dans la désagrégation <code>{{partition.name}}</code> de la variable <code>{{variable.name}}</code>',
            forms_elements_partitions_groups_members_move:
                'Reordonne les membres du groupe <code>{{group.name}}</code> dans la désagrégation <code>{{partition.name}}</code> de la variable <code>{{variable.name}}</code>',
            forms_elements_partitions_groups_members_remove:
                'Retire <code>{{item.name}}</code> du groupe <code>{{group.name}}</code> dans la désagrégation <code>{{partition.name}}</code> de la variable <code>{{variable.name}}</code>',

            logicalFrames_add: 'Ajoute le cadre logique <code>{{item.name}}</code>',
            logicalFrames_move: 'Reordonne les cadres logiques',
            logicalFrames_remove: 'Supprime le cadre logique <code>{{item.name}}</code>',

            logicalFrames_entities_add:
                'Ajoute le lieu <code>{{item.name}}</code> au cadre logique <code>{{logicalFrame.name}}</code>',
            logicalFrames_entities_move:
                'Reordonne les lieux du cadre logique <code>{{logicalFrame.name}}</code>',
            logicalFrames_entities_remove:
                'Retire le lieu <code>{{item.name}}</code> du cadre logique <code>{{logicalFrame.name}}</code>',

            logicalFrames_name_replace:
                'Renomme le cadre logique <code>{{before}}</code> en <code>{{after}}</code>',
            logicalFrames_goal_replace:
                "Change l'objectif général <code>{{before}}</code> en <code>{{after}}</code> dans le cadre logique <code>{{logicalFrame.name}}</code>",
            logicalFrames_start_replace:
                'Change la date de début <code>{{before}}</code> en <code>{{after}}</code> dans le cadre logique <code>{{logicalFrame.name}}</code>',
            logicalFrames_end_replace:
                'Change la date de fin <code>{{before}}</code> en <code>{{after}}</code> dans le cadre logique <code>{{logicalFrame.name}}</code>',

            logicalFrames_purposes_add:
                "Ajoute l'objectif spécifique <code>{{item.description}}</code> au cadre logique <code>{{logicalFrame.name}}</code>",
            logicalFrames_purposes_move:
                'Reordonne les objectifs spécifiques du cadre logique <code>{{logicalFrame.name}}</code>',
            logicalFrames_purposes_remove:
                "Supprime l'objectif spécifique <code>{{item.description}}</code> du cadre logique <code>{{logicalFrame.name}}</code>",
            logicalFrames_purposes_description_replace:
                "Change la description de l'objectif spécifique <code>{{before}}</code> en <code>{{after}}</code> dans le cadre logique <code>{{logicalFrame.name}}</code>",
            logicalFrames_purposes_assumptions_replace:
                "Change les hypothèses de l'objectif spécifique <code>{{purpose.description}}</code> de <code>{{before}}</code> en <code>{{after}}</code> dans le cadre logique <code>{{logicalFrame.name}}</code>",

            logicalFrames_purposes_outputs_add:
                'Ajoute le résultat <code>{{item.description}}</code> au cadre logique <code>{{logicalFrame.name}}</code>',
            logicalFrames_purposes_outputs_move:
                'Reordonne des résultats dans le cadre logique <code>{{logicalFrame.name}}</code>',
            logicalFrames_purposes_outputs_remove:
                'Supprime le résultat <code>{{item.description}}</code> du cadre logique <code>{{logicalFrame.name}}</code>',
            logicalFrames_purposes_outputs_description_replace:
                'Change la description du résultat <code>{{before}}</code> en <code>{{after}}</code> dans le cadre logique <code>{{logicalFrame.name}}</code>',
            logicalFrames_purposes_outputs_assumptions_replace:
                'Change les hypothèses du résultat <code>{{output.description}}</code> de <code>{{before}}</code> vers <code>{{after}}</code> dans le cadre logique <code>{{logicalFrame.name}}</code>',

            logicalFrames_purposes_outputs_activities_add:
                "Ajoute l'activité <code>{{item.description}}</code> au cadre logique <code>{{logicalFrame.name}}</code>",
            logicalFrames_purposes_outputs_activities_move:
                'Reordonne des activités dans le cadre logique <code>{{logicalFrame.name}}</code>',
            logicalFrames_purposes_outputs_activities_remove:
                "Supprime l'activité <code>{{item.description}}</code> du cadre logique <code>{{logicalFrame.name}}</code>",
            logicalFrames_purposes_outputs_activities_description_replace:
                "Change la description de l'activité <code>{{before}}</code> en <code>{{after}}</code> dans le cadre logique <code>{{logicalFrame.name}}</code>",

            logicalFrames_indicators_add:
                "Ajoute l'indicateur <code>{{item.display}}</code> dans le cadre logique <code>{{logicalFrame.name}}</code>",
            logicalFrames_indicators_move:
                "Déplace l'indicateur <code>{{item.display}}</code> du cadre logique <code>{{logicalFrame.name}}</code>",
            logicalFrames_indicators_remove:
                "Supprime l'indicateur <code>{{item.display}}</code> du cadre logique <code>{{logicalFrame.name}}</code>",
            logicalFrames_indicators_baseline_replace:
                "Change la valeur initiale de l'indicateur <code>{{indicator.display}}</code> de <code>{{before}}</code> vers <code>{{after}}</code> dans le cadre logique <code>{{logicalFrame.name}}</code>",
            logicalFrames_indicators_target_replace:
                "Change la cible de l'indicateur <code>{{indicator.display}}</code> de <code>{{before}}</code> vers <code>{{after}}</code> dans le cadre logique <code>{{logicalFrame.name}}</code>",
            logicalFrames_indicators_display_replace:
                "Renomme l'indicateur <code>{{before}}</code> en <code>{{after}}</code> dans le cadre logique <code>{{logicalFrame.name}}</code>",
            logicalFrames_indicators_colorize_replace:
                "Change la colorisation de l'indicateur <code>{{indicator.display}}</code> de <code>{{before}}</code> vers <code>{{after}}</code> dans le cadre logique <code>{{logicalFrame.name}}</code>",
            logicalFrames_indicators_computation_replace:
                "Change le calcul de l'indicateur <code>{{indicator.display}}</code> dans le cadre logique <code>{{logicalFrame.name}}</code>",

            extraIndicators_add: "Ajoute l'indicateur annexé <code>{{item.display}}</code>",
            extraIndicators_move: 'Reordonne les indicateurs annexés',
            extraIndicators_remove: "Supprime l'indicateur annexé <code>{{item.display}}</code>",
            extraIndicators_baseline_replace:
                "Change la valeur initiale de l'indicateur annexé <code>{{extraIndicator.display}}</code> de <code>{{before}}</code> vers <code>{{after}}</code>",
            extraIndicators_target_replace:
                "Change la cible de l'indicateur annexé <code>{{extraIndicator.display}}</code> de <code>{{before}}</code> vers <code>{{after}}</code>",
            extraIndicators_display_replace:
                "Renomme l'indicateur annexé <code>{{before}}</code> en <code>{{after}}</code>",
            extraIndicators_colorize_replace:
                "Change la colorisation de l'indicateur annexé <code>{{extraIndicator.display}}</code> de <code>{{before}}</code> vers <code>{{after}}</code>",
            extraIndicators_computation_replace:
                "Change le calcul de l'indicateur annexé <code>{{extraIndicator.display}}</code>",
        },

        form_error_short: 'Un ou plusieurs champs du formulaire sont en erreur.',
        form_persisted_short: "vous n'avez pas réalisé de changements.",
        form_changed_short: 'Vous avez réalisé des changements.',

        form_error:
            'Un ou plusieurs champs du formulaire sont en erreur, corrigez-les afin de pouvoir sauvegarder.',
        form_persisted: 'Vos données sont sauvegardées.',
        form_changed:
            "Vous avez réalisé des changements. N'oubliez pas de cliquer sur sauvegarder.",

        show_more_inputs: 'Voir les dates précedentes',
        all_elements: 'Tout',
        no_extra_indicators: "Aucun indicateur annexé n'a été créé.",
        no_data_source_yet: "Aucune source de données n'a été créée.",
        no_data_source:
            '<span style="font-style: italic">Aucune source de données n\'est prête à la saisie</span>',
        general_info: 'Information génerales',
        indicator_computation_missing: 'Calcul absent',
        which_variable: 'De quelle variable provient cette information?',
        which_partitions: 'Quelles désagrégations sont concernées?',
        value_unknown: 'Valeur inconnue',

        computations: {
            unavailable: "Il n'est pas possible de calculer cet indicateur",
            copy: 'Copier une valeur (depuis une sources de données)',
            percentage: 'Pourcentage (depuis les sources de données)',
            permille: 'Pour mille (depuis les sources de données)',
            formula: 'Formule personalisée (depuis les sources de données)',
        },

        formula: {
            copied_value: 'Valeur à copier',
            denominator: 'Dénominateur',
            numerator: 'Numérateur',
        },

        specific_start: 'Date de début spécifique',
        specific_end: 'Date de fin spécifique',

        partition_edit: 'Édition désagrégation',
        partition_help_name:
            'Ce nom apparaîtra dans divers rapports. Il nomme la désagrégation que vous voulez créer sur votre donnée',
        partition_help_elements:
            'Les éléments de la désagrégation doivent être mutuellement exclusifs, et il doit être possible de trouver la valeur totale en les aggrégant.',
        partition_help_aggregation:
            'Comment trouver la valeur totale en agrégeant les éléments décrits?',
        partition_help_groups: 'Les groupes permettent de faire des aggrégations intermédiaires',
        logical_frame: 'Cadre logique',

        no_data: 'Les données ne sont pas disponibles',

        saving_failed:
            "Impossible de sauvegarder vos modifications, probablement car vous n'êtes plus connecté à internet. Gardez cette fenêtre ouverte, et retentez de sauvegarder quand vous serez connecté à internet.",

        partition_general: 'Général',
        partition_general_placeholder:
            "ex: Tranches d'âge, sexe, motif de consultation, pathologie, référencement effectué, ...",
        partition_elements: 'Éléments',
        aggregation_lab: 'Comment grouper les éléments entre eux?',
        partition_name: 'Nom',
        partition_name_placeholder:
            'ex: Moins de 12 ans, Homme, Consultation sociale, Grippe ou Réferencement communautaire, ...',
        no_partition_elements: 'Appuyez sur "Ajouter" pour ajouter un élément à la désagrégation',

        partition_group_name: 'Nom',
        partition_group_name_placeholder: 'ex: Mineurs, Pathologies chroniques, ...',
        no_partition_groups: 'Appuyez sur "Ajouter" pour ajouter un groupe à la désagrégation',
        use_groups: 'Utiliser des groupes',

        no_inputs: 'Aucune saisie en attente',
        no_variable:
            'Aucune variable n\'est définie sur cette source de données. Cliquez sur "Ajouter une variable" pour en créer une!',
        no_partitions: "Aucune désagrégation n'est définie sur cette variable",

        dimensions: {
            day: 'Jours',
            month_week_sat: 'Semaines (samedi à vendredi / coupées par mois)',
            month_week_sun: 'Semaines (dimanche à samedi / coupées par mois)',
            month_week_mon: 'Semaines (lundi à dimanche / coupées par mois)',
            week_sat: 'Semaines (samedi à vendredi)',
            week_sun: 'Semaines (dimanche à samedi)',
            week_mon: 'Semaines (lundi à dimanche)',
            month: 'Mois',
            quarter: 'Trimestres',
            semester: 'Semestres',
            year: 'Années',
            entity: 'Lieux de collecte',
            group: 'Lieux de collecte: {{name}}',
            partition: 'Désagrégation: {{name}}',
            partition_group: 'Désagrégation: {{name}} / {{groupName}} ',
        },

        parameter: 'Paramètre',
        unnamed_logframe: 'Cadre logique sans nom',

        edit_indicator: 'Édition indicateur',
        display: 'Nom',
        display_ph: 'ex: Taux de CPN1 au sein des structures de santé',
        computation: 'Calcul',

        show_finished: 'Voir les saisies réalisées',
        are_you_sure_to_uninvite:
            'Êtes-vous sûr de vouloir retirer ce projet? Le propriétaire devra vous inviter à nouveau pour y avoir accès. Confirmez pour retirer.',
        data_selection: 'Selection des données',
        filters: 'Filtres',
        input_status: {
            done: 'Modifier ({{100*value|number:0}}%)',
            expected: 'Saisir',
        },
        cols: 'Colonnes',
        rows: 'Lignes',
        entity: 'Lieu de collecte',
        select_cols: 'Sélectionnez les colonnes',
        select_rows: 'Sélectionnez les lignes',
        pivot_table: 'Tableau croisé dynamique',

        groups: 'Groupes',
        basics: 'Données de base',
        general: 'Général',

        partitions: 'Désagrégations',

        add_variable: 'Ajouter une variable',
        remove_variable: 'Supprimer la variable',
        add_partition: 'Ajouter une désagrégation',

        aggregation: {
            sum: 'Faire une somme',
            average: 'Faire une moyenne',
            highest: 'Prendre la plus grande valeure',
            lowest: 'Prendre la plus petite valeure',
            last: 'Prendre la dernière valeur',
            none: "Il n'est pas possible de faire ce calcul",
        },

        covered_period: 'Période couverte',

        collection_site_list: 'Lieux de collecte',
        collection_form_list: 'Sources de données',

        collection_site: 'Lieu de collecte',
        collection_form: 'Source de données',
        collection_form2: 'Fiche de saisie',

        collection_form_planning: 'Calendrier',
        collection_form_structure: 'Structure',

        variable: 'Variable',

        no_purposes: "Aucun objectif spécifique n'a été défini",

        form_name_ph:
            'ex: Données SNIS, Fiche consultations prénatales, Fiche consultations générales, ...',

        entity_name: 'Nom de la structure ou lieu d’intervention',
        group_name: 'Nom du groupe',
        entity_name_placeholder: 'ex: Centre de santé X, Hôpital X, ...',
        group_name_placeholder: 'ex: Hôpitaux régionaux, parti Nord du pays, ...',

        create: 'Créer un nouveau projet',
        periodicity: 'Périodicité',
        start: 'Début du projet',
        end: 'Fin du projet',

        periodicities: {
            day: 'Tous les jours',
            month_week_sat: 'Toutes les semaines (samedi à vendredi / coupées par mois)',
            month_week_sun: 'Toutes les semaines (dimanche à lundi / coupées par mois)',
            month_week_mon: 'Toutes les semaines (lundi à dimanche / coupées par mois)',
            week_sat: 'Toutes les semaines (samedi à vendredi)',
            week_sun: 'Toutes les semaines (dimanche à lundi)',
            week_mon: 'Toutes les semaines (lundi à dimanche)',
            month: 'Tous les mois',
            quarter: 'Tous les trimestres',
            semester: 'Tous les semestres',
            year: 'Tous les ans',
        },

        no_input_entities: "Aucun lieu d'activité n'a encore été créé!",
        no_input_groups: "Aucun groupe d'activité n'a encore été créé!",

        input: 'Saisir',

        baseline: 'Valeur initiale',
        target: 'Valeur cible',

        goal: 'Objectif général',
        intervention_logic: "Logique d'intervention",

        start_date: 'Date de lancement',
        end_date: 'Date de fin',
        country_ph: 'ex: Gondawa',
        name_ph:
            'ex: Accès a des soins de santé de qualité pour les populations touchées par la crise',
        add_indicator: 'Ajouter un indicateur',

        purpose: 'Objectif Spécifique',
        purposes: 'Objectifs Spécifiques',
        assumptions: 'Hypothèses',
        output: 'Résultat',

        indicator_is_computed: 'Valide',
        indicator_is_not_computed: 'Invalide',

        intervention_logic_goal_ph:
            'ex: Réduire la mortalité et la morbidité des populations affectées par la crise',
        intervention_logic_purpose_ph:
            "ex: Améliorer l'accès aux soins des populations affectées par la crise dans les districts de Bimbo et Begoua",
        output_desc_ph:
            'ex: Améliorer la qualité des soins de première ligne des centres de santé de Bimbo et Begoua',
        assumptions_purpose_ph: '',
        output_assumptions_ph: '',
        logframe_ph_name: 'ex: ECHO',

        specific_dates: 'Durée de validité',
        specific_dates_yes: 'Utiliser des dates spécifiques à ce cadre logique',
        specific_dates_use_project: 'Utiliser les mêmes dates que le projet',
        logframe_edit_help_specificdates: `Si ce cadre logique n'est valable que pendant une partie de la durée de projet, vous pouvez l'indiquer ici`,
        logframe_edit_help_start:
            'Date à partir de laquelle vous voulez calculer les indicateurs de ce cadre logique',
        logframe_edit_help_end:
            "Date jusqu'à laquelle vous voulez calculer les indicateurs de ce cadre logique seront calculés",

        logframe_help_sites:
            'Parmi les structures identifiées dans "Lieux de collecte", lesquelles considérer pour ce cadre logique?',
        logframe_help_name:
            "Nommez ce cadre logique de façon à l'identifier facilement. Par exemple avec le nom du bailleur auquel il est destiné",
        logframe_help_goal:
            "Description de la contribution du projet aux objectifs (impact) d'une politique ou d'un programme",
        logframe_help_goal_indicators:
            "Rentrez ici les indicateurs permettant de mesurer l'objectif géneral",
        logframe_help_purpose_desc:
            'Description des avantages directs destinés au(x) groupe(s) cible(s)',
        logframe_help_purpose_assumptions:
            'Facteurs externes susceptibles de compromettre l’atteinte de l’objectif',
        logframe_help_purpose_indicators:
            "Rentrez ici les indicateurs permettant de mesurer l'objectif spécifique",
        logframe_help_output_desc: 'Produit ou service tangibles apportés par le projet.',
        logframe_help_output_assumptions:
            'Facteurs externes susceptibles de compromettre l’atteinte du résultat',
        logframe_help_output_indicators:
            'Rentrez ici les indicateurs permettant de mesurer le résultat',

        add_output: 'Ajouter un résultat',
        add_purpose: 'Ajouter un objectif spécifique',

        basics_help_country:
            "Dans quel pays le projet se déroule-t'il? S'il s'agit d'un projet régional, entrez le nom de la région.",
        basics_help_name:
            "Le nom permet de retrouver le projet dans Monitool. Choisissez un nom suffisament informatif, ou copiez l'objectif général du projet.",
        basics_help_begin:
            'La date de début représente le moment où le projet commence à collecter des données (généralement, le début des activités)',
        basics_help_end:
            "La date de fin représente le moment où le projet finale sa collecte de données. Si cette date n'est pas connu à l'avance, rentrer une date lointaine dans le futur.",

        collection_edit_help_name:
            'Comment s\'apelle la source de laquelle vous voulez extraire des données? Par exemple: "Dossier patient informatisé", "Registre des centre de santé", "Rapport du système national d\'information sanitaire", ...',
        collection_edit_help_sites:
            'Parmi les structures identifiées dans "Lieux de collecte", lesquelles font remonter cette source de donnée?',
        collection_edit_help_periodicity:
            'À quelle fréquence ces données remontent-elles? Attention, cette fréquence est complétement decorrelée de la fréquence à laquelle le projet doit fournir du reporting.',

        collection_edit_help_varname:
            'Nommez la variable que vous voulez extraire de/du <code>{{name}}</code>. Par exemple "Nombre de diagnostics effectués".',
        collection_edit_help_geoagg:
            "Dans un projet avec deux sites, si <code>{{name}}</code> vaut 10 pour un site, et 20 pour l'autre, que vaut-il pour le projet dans son ensemble?",
        collection_edit_help_timeagg:
            'Dans un projet qui collecte mensuellement, si <code>{{name}}</code> vaut 10 en janvier, et 20 en février et 30 en mars que vaut-il pour le premier trimestre?',
        collection_edit_help_partition:
            "Veut-t'on être capable de différencier <code>{{name}}</code> par age, sexe, prise en charge, motif de consultation, pathologie, tranche horaire, reférencement effectif, ...?<br/>Ne désagrégez pas ici par zone géographique ou site d'intervention: vos lieux de collecte ont déjà été renseignés dans la page prévu à cet effet.",
        collection_edit_help_distribution:
            'Si vous desirez imprimer des formulaires en A4, préférez placer les intitulés sur la gauche des tableaux, afin de limiter leur largeur.',
        collection_edit_help_order:
            'Dans quel ordre voulez vous placer vos désagrégations dans les différentes lignes et colonnes?',

        download_portrait: 'Télécharger PDF (portrait)',
        download_landscape: 'Télécharger PDF (paysage)',

        titles: 'Intitulés',
        data: 'Données',
        general_informations: 'Informations génerales',
        fill_with_last_input: 'Remplir avec les données de la période précédente',
        fill_with_zeros: 'Remplacer les valeurs manquantes par zéro',

        variable_name_label: 'Que mesurez-vous?',
        variable_name_ph: 'ex: Nombre de diagnostics effectués',
        site_agg_label: 'Comment grouper les saisies entre sites?',
        time_agg_label: 'Comment grouper les valeurs de plusieurs périodes',
        partitions_label: 'Quelles sont les désagrégations à utiliser sur cette variable?',
        distribution_label: 'Où placer les intitulés des désagrégations dans les formulaires?',
        order_label:
            'Dans quel ordre placer les intitulés des désagrégations dans les formulaires?',
        delete_purpose: "Supprimer l'objectif spécifique",
        delete_result: 'Supprimer le résultat',

        no_element_selected: 'Aucun élément selectionné',

        indicator_ph_fixed: "Entrez ici la valeur fixe de l'indicateur",
        indicator_help_description:
            'Contexte de collecte, détails sur la méthode de calcul choisie...',
        indicator_help_display:
            "Nommez votre indicateur. Le nom doit provenir d'un catalogue d'indicateur, afin d'être cohérent avec les autres projets.",
        indicator_help_baseline:
            'Combien valait cet indicateur avant le début du projet? Cochez la case pour spécifier cette valeur.',
        indicator_help_target:
            "Quel est l'objectif à atteindre sur cet indicateur?  Cochez la case pour spécifier cette valeur.",
        indicator_help_colorize:
            'Voulez-vous ajouter des couleurs (rouge, orange, vert) sur les rapports pour cet indicateur?',
        indicator_help_computation:
            'Comment calculer cet indicateur à partir des données que vous avez collecté dans les sources de données?',

        activity: 'Activité',
        add_activity: 'Ajouter une activité',
        delete_activity: "Supprimer l'activité",
        activity_desc_ph:
            'ex: Réalisation de sessions de sensibilisation sur la transmission du VIH',
        logframe_help_activity_desc: "Activité réalisée par l'ONG",
        logframe_help_activity_indicators:
            "Rentrez ici les indicateurs permettant de mesurer l'avancement de l'activité",

        form_is_not_associated_with_site:
            "Cette source de données n'est associé à aucun lieu de collecte.",
    },

    form: {
        create_blank: 'Créer un cadre logique vierge',
    },

    indicator: {
        missing_description: "<i>La description de cet indicateur n'a pas été renseignée</i>",
        extra: 'Indicateurs annexés',
    },
};
