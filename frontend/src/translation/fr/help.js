module.exports = {
    pages: {
        'projects': {
            title: 'Liste de projets',
            paragraph: ``
        },
        'project.config.home': {
            title: `Accueil configuration`,
            paragraph: ``
        },
        'project.config.basics': {
            title: 'Données de base',
            paragraph: `Les données de bases permettent de classer votre projet parmi les autres de l'ONG.`
        },
        'project.config.collection_site_list': {
            title: 'Lieux de collecte',
            paragraph: `
            <p>
                Lorsqu'un projet réalise les même activités dans plusieurs lieux, celles-ci doivent pouvoir être
                suivi individuellements, par groupes, et tous ensembles.
            </p>
            <p>
                Rentrez ici:
                <ul>
                    <li>La liste des lieux sur lesquels le projet travaille (par exemple: une liste des centres de santé)</li>
                    <li>Des groupements qui seront utilisé lors du suivi (par exemple: des régions, des types de structure)</li>
                </ul>
            </p>`
        },
        'project.config.collection_form_list': {
            title: 'Liste des sources de données',
            paragraph: `
                Les sources de données sont les différents supports desquels les données nécessaires au monitoring du
                projet sont extraites (fiches de suivi, dossiers patient, fichiers Excel, ...)<br/>
                Au sein de monitool, on ne décrira pas l'intégralité des données existantes, mais uniquement la partie
                qui va être extraite pour le suivi du projet<br/>
                Afin de faciliter l'organisation de la saisie, les sources doivent correspondre à des outils réels 
                utilisés sur le terrain.
            `
        },
        'project.config.collection_form_edition': {
            title: `Édition d'une source de données`,
            paragraph: `
            `
        },
        'project.config.logical_frame_list': {
            title: 'Liste des cadres logiques',
            paragraph: `
                Un cadre logique est un document qui décrit les objectifs, les résultats attendus, et les activités misent
                en oeuvre pour y parvenir, ainsi que les indicateurs qui permette de suivre l'avancement de chaque élément.<br/>
                Tous les indicateurs présents dans les cadres logiques doivent être calculables à partir des données 
                décrites dans les sources de données
            `
        },
        'project.config.logical_frame_edition': {
            title: `Édition d'un cadre logique`,
            paragraph: ``
        },
        'project.config.extra': {
            title: `Indicateurs annexés`,
            paragraph: `
                Les indicateurs annexés sont des indicateurs complémentaires qui ne figurent dans aucun cadre logique.<br/>
                Ils permettent de suivre des éléments spécifiques du projet (données médicales, logistiques, ...)
            `
        },
        'project.config.user_list': {
            title: `Liste des utilisateurs`,
            paragraph: `
                Plusieurs types d'utilisateurs interviennent dans la mise en place et dans le suivi d'un projet:
                coordination, staff M&E, opérateurs de saisie, partenaires, ...<br/>
                Listez ici tous les utilisateurs qui doivent avoir accès au monitoring de ce projet.
            `
        },
        'project.config.history': {
            title: `Historique`,
            paragraph: `
                L'historique des modifications vous permet de consulter la liste des modifications faites sur la
                structure de votre projet.
            `
        },
        'project.usage.home': {
            title: `Accueil projet`,
            paragraph: ``
        },
        'project.usage.list': {
            title: `Liste des saisies`,
            paragraph: ``
        },
        'project.usage.edit': {
            title: `Édition d'une saisie`,
            paragraph: ``
        },
        'project.usage.general': {
            title: `Rapport général`,
            paragraph: `Cette page vous permet d'explorer vos données hierarchiquement en partant d'une vision général de votre projet.`
        },
        'project.usage.olap': {
            title: `Tableau croisé dynamique`,
            paragraph: `Cette page vous permet de construire des tableaux qui prendront la forme que vous désirez, et de les télécharger
            en format Excel, afin de les inclure dans des rapports ou de créer des visualisation en dehors de Monitool.`
        }
    },
    qas: [
        // Structure
        {
            pages: ['project.config.basics', 'project.config.collection_form_edition'],
            question: `Comment choisir des noms adaptés pour les lieux de collecte, sources de données, variables et indicateurs`,
            answer: `Utilisez des noms courts pour nommer les différents composants de votre projet.<br/>
            En évitant les acronymes vous améliorez la lisibilité de vos graphiques et tableaux et permettez une meilleur
            compréhension de votre projet par tous les acteurs concernés.`
        }, {
            pages: ['project.config.basics', 'project.config.collection_form_edition'],
            question: `Je viens de supprimer quelque chose de mon projet par erreur, mais je n'ai pas encore sauvegardé. Comment revenir en arrière?`,
            answer: `
                En cas d'erreur, cliquez sur <a class="btn btn-default btn-xs"><i class="fa fa-undo"></i> Annuler les modifications</a> pour revenir à la
                dernière version sauvegardée de votre projet`
        }, {
            pages: ['project.config.basics', 'project.config.collection_form_edition'],
            question: `J'ai supprimé quelque chose de mon projet par erreur, et j'ai sauvegardé ma modification. Comment revenir en arrière?`,
            answer: `
                Rendez-vous sur la page <a class="btn btn-default btn-xs"><i class="fa fa-history"></i> Historique</a> la structure de votre projet.<br/>
                Vous pouvez consulter toutes les modifications qui ont été réalisées depuis la création du projet, et
                revenir au moment que vous désirez`
        }, {
            pages: ['project.config.collection_form_edition'],
            question: `Mes équipes passent trop de temps à saisir des données, comment réduire?`,
            answer: `
                Réduisez la quantitée de données à collecter!<br/>
            `
        }, {
            pages: ['project.config.collection_form_edition'],
            question: `Je ne comprend pas les deux questions sur "Comment grouper les saisies"`,
            answer: `
                Monitool vous affiche des rapports selon l'échelle de temps de votre choix (semaine, mois, trimestre...) et ne vous demande
                pas de saisir vos données autant de fois qu'il y a d'échelles de temps.<br/>
                Pour cela, il est nécessaire de savoir comment aggréger les données qui sont saisies dans l'outil, et ces règles dependent
                de la nature des données que vous saisissez.<br/>
                <br/>
                Quelques exemples:
                <ul>
                    <li>Un nombre de consultations se somme dans le temps: Si 10 consultations sont réalisés par jour, cela fait 70 consulations par semaine</li>
                    <li>Un nombre de consultations se somme également entre sites: 10 consultations à Paris et 10 consultations à Lilles font 20 consultations</li>
                    <li>Pour certains scores, c'est la valeur la plus basse de la periode qu'il faudra garder</li>
                    <li>Mais la moyenne dans le temps</li>
                </ul>
            `
        }, {
            pages: ['project.config.collection_form_edition'],
            question: `Je veux changer la périodicité de collecte de ma source de données alors que j'ai déjà réalisé des saisies`,
            answer: `
                Pas de soucis!<br/>
                Vos rapports ne changeront pas: vous pourrez toujours consulter toutes vos données sans aucune perte de précision.<br/>
                <br/>
                Cependant, attention! Si vous changez pour une periodicité plus longue (par exemple, hebdomadaire vers mensuelle),
                vous devrez faire attention à corriger les données de la dernière saisie qui sera sûrement incomplète et pourtant marquée
                comme "faite"!
            `
        }, {
            pages: ['project.config.collection_form_edition'],
            question: `Je veux ajouter une variable mais j'ai déjà réalisé des saisies.`,
            answer: `
                Vous pouvez ajouter des variables à tout moment sans perte de données.<br/>
                Vous aurez alors le choix de retourner saisir les données correspondantes rétroactivement, ou bien de laisser les saisies en l'état,
                qui seront alors marquées comme "incomplètes" dans le tableau de bord du projet, sans autres conséquences.
            `
        }, {
            pages: ['project.config.collection_form_edition'],
            question: `Je veux arrêter de saisir une variable mais j'ai déjà réalisé des saisies.`,
            answer: `
                Vous pouvez désactiver des variables à tout moment sans perte de données.<br/>
                Les données rentrées précedement seront toujours accessibles dans vos rapports, mais toutes les nouvelles
                saisies seront alors marquées comme "incomplètes" dans le tableau de bord du projet, sans autres conséquences.<br/><br/>

                Lorsque vous n'aurez plus usage de cette variable, vous pourrez alors la supprimer.
            `
        }, {
            pages: ['project.config.collection_form_edition'],
            question: `Je veux supprimer une variable mais j'ai déjà réalisé des saisies.`,
            answer: `
                Elle disparaitra alors des formulaires de saisie, et rétroactivement de tous vos rapports.<br/>
                Tous les indicateurs qui en dépendent seront marqués comme "Impossible à calculer" jusqu'à que vous corrigiez leur formule<br/>

                Vos données ne seront pas perdues, mais la seule manière de les récupérer consistera  à vous rendre sur la page
                <span class="btn btn-default btn-xs"><i class="fa fa-history"></i> Historique</a> pour annuler la modification.
            `
        }, {
            pages: ['project.config.collection_form_edition'],
            question: `Je veux ajouter une désagrégation mais j'ai déjà réalisé des saisies`,
            answer: `
                Par exemple rajouter une désagrégation par sexe du patient sur un nombre de consultations médicales, alors
                que je ne les différenciait que par pathologie.<br/>
                <br/>
                Vous pouvez rajouter des désagrégations à tout moment sans perte de données.<br/>
                Lorsque vous consulterez vos rapports, les données des anciennes saisies qui ne contenaient pas cette désagrégation par
                sexe vont continuer à s'afficher et ne changeront pas.<br/>
                <br/>
                Pour vous permettre de comparer les anciennes données et les nouvelles, si vous choisissez de désagréger vos rapports par
                sexe, monitool va distribuer les anciennes données en faisant comme hypothèse qu'il y avait autant de femmes que d'hommes
                avant le changement.<br/>
                Afin de ne pas vous induire en erreur, ces données "interpolées" sont clairement indiquées dans les rapports car elles
                seront toutes précédées par le symbole ≈.
            `
        }, {
            pages: ['project.config.collection_form_edition'],
            question: `Je veux supprimer une désagrégation mais j'ai déjà réalisé des saisies`,
            answer: `
                Toutes les données qui ont étés saisies jusqu'à ce jour vont être aggrégées, et la désagrégation va disparaitre rétroactivement
                des rapports.<br/>
                Vous ne pourrez plus voir cette désagrégation dans les rapports, même sur les données saisies avant la modification.<br/>
                Une alternative consiste à désactiver cette désagrégation.
            `
        }, {
            pages: ['project.config.collection_form_edition'],
            question: ``,
            answer: ``
        }, {
            pages: ['project.config.collection_form_edition'],
            question: ``,
            answer: ``
        }, {
            pages: ['project.config.history'],
            question: `Certaines modifications à la structure du projet sont réalisées par un utilisateur qui ne devrait pas avoir y avoir accès`,
            answer: `Vous pouvez gérer les droits des differents intervenants au projet dans la section "<i class="fa fa-share-alt"> Partage"`
        }, {
            pages: ['project.config.history'],
            question: `Je veux annuler une modification que j'ai réalisé il y a plusieurs semaines, sans perdre toutes les autres modifications que j'ai réalisé depuis.`,
            answer: `
                Cette interface ne vous permet que de revenir à n'importe quel point en arrière,
                mais il ne peut revenir sur une modification en particulier.<br/>
                Les modifications que vous réalisez sur votre projet dépendent les unes des autres. Si vous avez créé
                un nouvelle variable lors d'une modification, puis ajouté un indicateur qui en dépend dans une autre, annuler la première modification
                sans annuler la seconde le rendrait incohérent.`
        },

        // Data entry
        {
            pages: ['project.usage.list'],
            question: `Pourquoi puis-je saisir les données du mois en cours, alors qu'il n'est pas terminé?`,
            answer: `
                Car sur certains projets, des prédictions ou des objectifs sont utilisées comme variables et peuvent être saisies à l'avance!
            `
        }, {
            pages: ['project.usage.edit'],
            question: `Comment passer rapidement d'une case à l'autre?`,
            answer: `
                Lors de la saisie de données, la touch Tab de votre clavier vous permet de naviguer entre les cases.<br/>
                Pour revenir à la case précédente, utilisez Shift + Tab
            `
        }, {
            pages: ['project.usage.edit'],
            question: `Je saisie à partir de fiches papier remontées par plusieurs intervenants par lieu de collecte. Comment saisir plus rapidement?`,
            answer: `
                Si vous disposez de plusieurs formulaires papier à saisir par lieu (par exemple, un par travailleur social),
                et que désirez les additioner, vous pouvez rentrer des sommes dans les cases de saisies: "1+2+3".<br/>
            `
        }, {
            pages: [],
            question: ``,
            answer: ``
        }, {
            pages: [],
            question: ``,
            answer: ``
        },

        // Reporting
        {
            pages: ['project.usage.general'],
            question: `Comment afficher un graphique?`,
            answer: `
                    À gauche de chaque ligne, le symbole <i class="fa fa-line-chart"></i> vous permet d'afficher un graphique
                    contenant les données de la ligne en cours.`
        }, {
            pages: ['project.usage.general'],
            question: `Comment vérifier les données utilisées pour calculer un indicateur?`,
            answer: `Sur chaque indicateur le symbole <i class="fa fa-plus"></i> vous permet d'accéder aux différentes composantes utilisées pour
                calculer chaque indicateur: choisissez "Calcul".<br/>
                Cette option n'est accessible que pour les indicateurs calculés à partir des sources de données`
        }, {
            pages: ['project.usage.general'],
            question: `Comment désagréger mes données par lieu de collecte?`,
            answer: `Sur chaque ligne le symbole <i class="fa fa-plus"></i> vous permet de désagréger votre résultat par lieu de collecte.`
        }, {
            pages: ['project.usage.general'],
            question: `Comment désagréger mes données par tranche d'age, sexe, pathologie, contenu de formation, ...?`,
            answer: `
                    Si vous avez utilisé des désagrégations lors de la collecte de vos données celles-ci apparaitront dans le
                    menu qui est accessible sur chaque ligne en cliquant sur le symbole <i class="fa fa-plus"></i>.<br/>
                    Pour les indicateurs calculés (cadres logiques, et indicateurs supplémentaires), il n'est possible de désagréger
                    les resultats que par lieu de collecte et par unité de temps.`
        }, {
            pages: ['project.usage.general', 'project.usage.olap'],
            question: `Que signifie le symbole <i class="fa fa-question-circle-o"></i> qui s'affiche à la place de mes données?`,
            answer: `Ce symbole signifie que la saisie des données que vous essayez de consulter n'a pas encore été réalisée.`
        }, {
            pages: ['project.usage.general', 'project.usage.olap'],
            question: `Pourquoi certaines données sont précédées par le symbole ≈?`,
            answer:
                `Vous consultez ces données à un niveau d'aggrégation qui est inférieur à celui auquel vous les avez collecté!<br/>
                Par exemple, vous avez réalisé la collecte trimestriellement, mais consultez ces données sur un tableau qui les affiche
                mensuellement.<br/><br/>
                Dans ce cas, les données sont "interpolés" afin de vous permettre d'avoir des ordres de grandeurs, et de pouvoir
                comparer des indicateurs que vous ne collectez pas avec les mêmes périodicités entre-eux.<br/>
                Ceci se produit également si vous consultez un indicateur calculé, par exemple un pourcentage, mais que le numérateur
                et le dénominateur ne sont pas collectés avec les même périodicités.<br/><br/>
                Pour prendre un exemple, si vous avez collecté un nombre de naissances attendues dans une maternité par trimestre, mais
                que vous le consultez par mois, monitool va distribuer le nombre de naissances trimestrielles dans chaque mois, en corrigeant
                en fonction du nombre de jours qu'ils comprennent.<br/>
                Le symbole ≈ est donc affiché en permanence pour vous rappeler que les données que vous consultez sont des approximations
                grossières de la réalité, et qu'elles ne peuvent servir qu'à avoir des ordres de grandeurs.
                `
        }, {
            pages: ['project.usage.general', 'project.usage.olap'],
            question: `Pourquoi certaines données sont affichées en <i>italique</i>?`,
            answer: `
                Les données affichées en <i>italique</i> n'ont été que partiellement saisies. Le plus souvent, cela signifie que
                seules certains des lieux de collectes attendus ont été saisis.
                Le cas peut également se produire si vous consultez une version aggrégée (ex: par trimestre) de données collectés
                à une periodicité plus courte (ex: par mois) et que tous les mois du trimestre considéré n'ont pas été saisis.<br/>
                En désagrégant la ligne avec le bouton <i class="fa fa-plus"></i> vous pourrez trouver facilement les saisies manquantes.`
        },

    ]
};