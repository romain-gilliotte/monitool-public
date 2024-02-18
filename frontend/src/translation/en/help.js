module.exports = {
    pages: {
        'main.projects': {
            title: 'Projects List',
            paragraph: /* html */ `
                The projects list is your entry point for all the tasks you can perform
                on the tool.
            `,
        },
        'main.invitations': {
            title: 'Invitations',
            paragraph: /* html */ `
                On this page, find the list of projects you have been invited to participate in
                by other users.
            `,
        },
        'project.config.home': {
            title: `Configuration Home`,
            paragraph: /* html */ `View your progress in configuring your project.`,
        },
        'project.config.basics': {
            title: 'Basic Data',
            paragraph: /* html */ `Basic data helps classify your project among others in the NGO.`,
        },
        'project.config.collection_site_list': {
            title: 'Collection Sites',
            paragraph: /* html */ `
            <p>
                When a project performs the same activities in several locations, they must be
                tracked individually, in groups, and all together.
            </p>
            <p>
                Enter here:
                <ul>
                    <li>The list of sites where the project works (e.g., a list of health centers)</li>
                    <li>Groupings to be used during monitoring (e.g., regions, types of structures)</li>
                </ul>
            </p>`,
        },
        'project.config.collection_form_list': {
            title: 'Data Sources List',
            paragraph: /* html */ `
                Data sources are the various mediums from which data necessary for the monitoring of
                the project are extracted (tracking sheets, patient files, Excel files, ...)<br/>
                Within Monitool, we will not describe all existing data, but only the part
                that will be extracted for project monitoring.<br/>
                To facilitate data entry organization, sources must correspond to real tools
                used in the field.
            `,
        },
        'project.config.collection_form_edition': {
            title: `Data Source Editing`,
            paragraph: /* html */ `
            `,
        },
        'project.config.logical_frame_list': {
            title: 'Logical Frameworks List',
            paragraph: /* html */ `
                A logical framework is a document that describes the objectives, expected results, and activities undertaken
                to achieve them, as well as the indicators that allow the progress of each element to be tracked.<br/>
                All indicators present in the logical frameworks must be calculable from the data
                described in the data sources.
            `,
        },
        'project.config.logical_frame_edition': {
            title: `Logical Framework Editing`,
            paragraph: /* html */ ``,
        },
        'project.config.extra': {
            title: `Annexed Indicators`,
            paragraph: /* html */ `
                Annexed indicators are additional indicators that do not appear in any logical framework.<br/>
                They allow specific elements of the project to be tracked (medical data, logistical data, ...)
            `,
        },
        'project.config.invitation_list': {
            title: `Users List`,
            paragraph: /* html */ `
                Several types of users are involved in the setup and monitoring of a project:
                coordination, M&E staff, data entry operators, partners, ...<br/>
                List here all users who need access to monitoring this project.
            `,
        },
        'project.config.history': {
            title: `History`,
            paragraph: /* html */ `
                The history of modifications allows you to consult the list of modifications made to the
                structure of your project.
            `,
        },
        'project.usage.home': {
            title: `Project Home`,
            paragraph: /* html */ `
                The project homepage presents the contacts of the different participants.<br/>
                If you are involved in data entry for the project, you can also access your progress tracking.
            `,
        },
        'project.usage.downloads': {
            title: `Downloads`,
            paragraph: /* html */ `You can access various files for download here.`,
        },
        'project.usage.log': {
            title: `Modification History`,
            paragraph: /* html */ `This page presents the history of all entries that have been made on your project.`,
        },
        'project.usage.preview': {
            title: `Modification History`,
            paragraph: /* html */ `This page allows you to preview the modifications made during a particular entry.`,
        },
        'project.usage.uploads': {
            title: `File Uploads`,
            paragraph: /* html */ `This page allows you to upload forms that have been filled out on paper or in Excel by your teams.`,
        },
        'project.usage.list': {
            title: `Entry Calendar`,
            paragraph: /* html */ `The entry calendar allows you to access project entry forms.`,
        },
        'project.usage.edit': {
            title: `Entry Editing`,
            paragraph: /* html */ `Make sure to check the collection site and covered period of the entry form before entering your data.`,
        },
        'project.usage.data_entry': {
            title: `Entry Editing`,
            paragraph: /* html */ `Allows you to enter paper forms.`,
        },
        'project.usage.general': {
            title: `General Report`,
            paragraph: /* html */ `This page allows you to explore your data hierarchically starting from a general view of your project.`,
        },
        'project.usage.olap': {
            title: `Pivot Table`,
            paragraph: /* html */ `This page allows you to build tables that will take the form you want, and to download them
            in Excel format, in order to include them in reports or create visualizations outside of Monitool.`,
        },
    },
    qas: [
        {
            prefixes: ['main.projects', 'project.config.home', 'project.config.basics'],
            question: `What is a project in Monitool?`,
            answer: /* html */ `
                On Monitool, we don't talk about databases, queries, dimensions, joins...<br/>
                A project is a project in the sense understood in a humanitarian organization, the same as the one for which
                you write a proposal to your funder.
            `,
        },
        {
            prefixes: ['main.projects'],
            question: `Why can multiple projects be created per account, when one is enough?`,
            answer: /* html */ `
                It has no usefulness from a field point of view, but some users need to access
                many projects that they did not create themselves.<br/>
                Particularly headquarters, regional staff, or consultants.
            `,
        },
        {
            prefixes: ['main.projects'],
            question: `How do I return to the configuration pages of a project I have already created?`,
            answer: /* html */ `
                On your project, to the right of the open button, click on
                <span class="btn btn-default btn-xs"><span class="caret"></span></span>
                to see all possible actions.
            `,
        },
        {
            prefixes: ['main.projects'],
            question: `What is the purpose of being able to "Clone project structure" ?`,
            answer: /* html */ `
                The "Clone structure only" feature is designed for NGOs that carry out
                emergency programs. Indeed, in this case, rather than taking the necessary time for
                reflection required to build a project, it is common to create in advance different
                project skeletons with all data sources and the logical framework ready to use.
                <br/>
                When a new crisis starts, the monitoring system can thus be operational in a few
                minutes. It is then sufficient to clone the structure of the skeleton adapted to the
                situation, and to rename the project; adaptation of the project to the context will come in a later phase of the project.
            `,
        },
        {
            prefixes: ['main.projects'],
            question: `What is the purpose of being able to "Clone structure and data" of a project?`,
            answer: /* html */ `
                The "Clone structure and data" feature generally comes into play when changing
                funders or a major change in the monitoring apparatus of a long-term project.<br/>
                It allows taking a snapshot of a project, with its structure and all its entries at a given
                time, and keeping it in the long term.
            `,
        },
        {
            prefixes: ['main.projects'],
            question: `I accidentally archived my project, how can I recover it?`,
            answer: /* html */ `
                Click on <span class="btn btn-default btn-xs">Show archived projects</span>,
                then on <span class="btn btn-default btn-xs">Restore</span>
            `,
        },
        {
            prefixes: ['main.projects'],
            question: `What are the <i class="fa fa-user"></i> and <i class="fa fa-share-alt"></i> symbols for at the top left of each project?`,
            answer: /* html */ `
                To differentiate the projects you created from those created by other users, and which are
                shared with you.
            `,
        },
        {
            prefixes: ['main.projects'],
            question: `What is the <i class="fa fa-star"></i> symbol for at the top right of each project?`,
            answer: /* html */ `
                For users who access many projects, it allows them to choose those
                that will always appear first in their list.<br/>
                For those who only have one project, it has a ... decorative role. Create a second one!
            `,
        },
        {
            prefixes: ['main.projects'],
            question: `My project has disappeared! Where is it?`,
            answer: /* html */ `
                Don't panic!<br/><br/>
                Several explanations are possible:
                <ul>
                    <li>Your project does not match the filter you entered. Clear the text input bar at the top of the page.</li>
                    <li>Your project has just ended. Click on <span class="btn btn-default btn-xs">Show
                    completed projects</span>. You can edit its end date to extend it.</li>
                    <li>You archived your project. Click on <span class="btn btn-default btn-xs">Show
                    archived projects</span> then on
                    <span class="btn btn-default btn-xs">Restore</span></li>
                </ul>
                <br/>
                If your project is still missing, it is possible that you are not logged in with
                the same account that you used to create your project.<br/>
                Click on <span class="btn btn-default btn-xs"><i class="fa fa-power-off"></i> Logout</span>
                then log in with the account you used to create your project.<br/>
                If you wish, you can transfer the project to your new account.
            `,
        },
        {
            prefixes: ['main.projects'],
            question: `How long will my project remain stored on Monitool?`,
            answer: /* html */ `
                Throughout the lifetime of the tool: the storage costs of the projects are low compared to
                the development and hosting costs of the platform.<br/>
                It is therefore not necessary for us to delete old projects to "make room".<br/>
                <br/>
                If your NGO has rules regarding electronic archiving for completed projects, you can
                download all data entered per project from the "General Report" page.
            `,
        },
        {
            prefixes: ['main.invitations'],
            question: `I haven't received the invitation I was expecting.`,
            answer: /* html */ `
                To invite you to participate in a project, its owner uses your email address.<br/>
                Make sure you are logged in with the same email address that was used
                to invite you.
            `,
        },
        {
            prefixes: ['main.invitations'],
            question: `I accidentally declined an invitation, what should I do?`,
            answer: /* html */ `
                Declined invitations cannot be modified anymore.<br/>
                Ask the owner of the project you want to access to invite you again.
            `,
        },

        // Structure
        {
            prefixes: ['project.config'],
            question: `How to choose suitable names for collection sites, data sources, variables, and indicators?`,
            answer: /* html */ `Use short names to designate the different components of your project.<br/>
                By avoiding acronyms, you improve the readability of your graphs and tables and enable better understanding of your project by all stakeholders.`,
        },
        {
            prefixes: ['project.config'],
            question: `I just deleted something from my project by mistake, but I haven't saved it yet. How can I undo?`,
            answer: /* html */ `
                    In case of error, click on <a class="btn btn-default btn-xs"><i class="fa fa-undo"></i> Undo changes</a> to return to the
                    last saved version of your project`,
        },
        {
            prefixes: ['project.config'],
            question: `I deleted something from my project by mistake, and I saved my changes. How can I undo?`,
            answer: /* html */ `
                    Go to the page <a class="btn btn-default btn-xs"><i class="fa fa-history"></i> History</a> 
                    the structure of your project.<br/>
                    You can consult all the modifications that have been made since the creation of the project, and
                    go back to the moment you want`,
        },
        {
            prefixes: ['project.config.basics'],
            question: `I don't know the end date of my project`,
            answer: /* html */ `
                    You can modify it at any time, leave the default value (in one year).
                `,
        },
        {
            prefixes: ['project.config.collection_form_list'],
            question: `How is the data entry time estimated?`,
            answer: /* html */ `
                    This indication is there to give an order of magnitude.<br/>
                    The formula used considers that it takes 10 seconds per filled cell.
                `,
        },
        {
            prefixes: ['project.config.collection_form_list'],
            question: `
                    What happens when I move variables between data sources that 
                    do not have the same periodicities or collection sites?
                `,
            answer: /* html */ `
                    The data already entered will be moved and aggregated or interpolated to fit the new periodicity.<br/>
                    If the collection sites are not the same between the two data sources:
                    <ul>
                        <li>The data entered on the additional sites will become inaccessible.</li>
                        <li>The data entry staff will be asked to retroactively enter the missing data.</li>
                    </ul>
                `,
        },
        {
            prefixes: ['project.config.collection_form_edition'],
            question: `My teams spend too much time entering data, how to reduce it?`,
            answer: /* html */ `
                    Reduce the amount of data to collect!<br/>
                    For example, you can disable variables or breakdowns that you do not analyze,
                    or reduce the frequency of data entry.
                `,
        },
        {
            prefixes: ['project.config.collection_form_edition'],
            question: `I don't understand the two questions about "How to group data entries"`,
            answer: /* html */ `
                    Monitool displays reports according to the time scale of your choice (week, month, quarter...) and does not ask you
                    to enter your data as many times as there are time scales.<br/>
                    Therefore, it is necessary to know how to aggregate the data entered into the tool, and these rules depend
                    on the nature of the data you are entering.<br/>
                    <br/>
                    <table class="table table-bordered">
                        <tr>
                            <th>Variable</th>
                            <th>How to group over time</th>
                            <th>How to group between sites</th>
                        </tr>
                        <tr>
                            <td>Number of medical consultations</td>
                            <td>If 10 consultations are conducted per day, this makes 70 consultations per week, therefore "Sum"</td>
                            <td>10 consultations in Paris and 10 consultations in Lille make 20 consultations, therefore "Sum" as well</td>
                        </tr>
                        <tr>
                            <td>Number of supported structures</td>
                            <td>10 structures were supported in January, and 15 in February and 20 in March, the value to keep
                            for the quarter is 15, therefore "Average"</td>
                            <td>10 structures were supported in Paris, and 10 in Lille, this makes 20 structures, therefore "Sum"</td>
                        </tr>                    
                    </table>
                `,
        },
        {
            prefixes: ['project.config.collection_form_edition'],
            question: `I want to change the collection frequency of my data source while I have already entered data`,
            answer: /* html */ `
                    No worries!<br/>
                    Your reports will not change: you will still be able to consult all your data without any loss of precision.<br/>
                    <br/>
                    However, be careful! If you change to a longer frequency (for example, weekly to monthly),
                    you should be careful to correct the data from the last entry which will surely be incomplete and yet marked
                    as "done"!
                `,
        },
        {
            prefixes: ['project.config.collection_form_edition'],
            question: `I want to add a variable but I have already entered data.`,
            answer: /* html */ `
                    You can add variables at any time without losing data.<br/>
                    You will then have the choice to return to enter the corresponding data retroactively, or to leave the entries as they are,
                    which will then be marked as "incomplete" in the project dashboard, without further consequences.
                `,
        },
        {
            prefixes: ['project.config.collection_form_edition'],
            question: `I want to stop entering a variable but I have already entered data.`,
            answer: /* html */ `
                    You can disable variables at any time without losing data.<br/>
                    The previously entered data will still be accessible in your reports, but all new
                    entries will then be marked as "incomplete" in the project dashboard, without further consequences.<br/><br/>
        
                    When you no longer need this variable, you can then delete it.
                `,
        },
        {
            prefixes: ['project.config.collection_form_edition'],
            question: `I want to delete a variable but I have already entered data.`,
            answer: /* html */ `
                    <p>It will then disappear from the data entry forms, and retroactively from all your reports.</p>
                    <p>All indicators depending on it will be marked as "Impossible to calculate" until you correct their formula</p>
                    <p>
                        Your data will not be lost, but the only way to recover it will be to go to the page
                        <span class="btn btn-default btn-xs"><i class="fa fa-history"></i> History</span> to undo the modification.
                    </p>
                `,
        },
        {
            prefixes: ['project.config.collection_form_edition'],
            question: `I want to add a breakdown but I have already entered data`,
            answer: /* html */ `
                    For example, adding a breakdown by patient gender to a number of medical consultations, while
                    I only differentiated them by pathology.<br/>
                    <br/>
                    You can add breakdowns at any time without losing data.<br/>
                    When you consult your reports, the data from the old entries that did not contain this breakdown by
                    gender will continue to be displayed and will not change.<br/>
                    <br/>
                    To allow you to compare old and new data, if you choose to disaggregate your reports by
                    gender, monitool will distribute the old data assuming there were as many women as men
                    before the change.<br/>
                    To avoid misleading you, these "interpolated" data are clearly indicated in the reports as they
                    will all be preceded by the symbol ≈.
                `,
        },
        {
            prefixes: ['project.config.collection_form_edition'],
            question: `I want to delete a breakdown but I have already entered data`,
            answer: /* html */ `
                    All data entered up to that date will be aggregated, and the breakdown will disappear retroactively
                    from the reports.<br/>
                    You will no longer be able to see this breakdown in the reports, even on the data entered before the modification.<br/>
                    An alternative is to disable this breakdown.
                `,
        },
        {
            prefixes: ['project.config.history'],
            question: `Some modifications to the project structure are made by a user who should not have access to it`,
            answer: /* html */ `You can manage the rights of the different project participants in the "<i class="fa fa-share-alt"> Share"</i> section`,
        },
        {
            prefixes: ['project.config.history'],
            question: `I want to undo a modification I made several weeks ago, without losing all the other modifications I made since.`,
            answer: /* html */ `
                    This interface only allows you to go back to any point in time,
                    but it cannot go back to a particular modification.<br/>
                    The modifications you make to your project depend on each other. If you created
                    a new variable during one modification, then added an indicator that depends on it in another, undoing the first modification
                    without undoing the second would make it inconsistent.`,
        },

        // Usage
        {
            prefixes: ['project.usage.home'],
            question: `How do I change my photo in the list of participants?`,
            answer: /* html */ `
                    The photo comes from the account you used to log in!<br/>
                    Go to your Google or Microsoft profile to change it.
                    The new photo will be automatically updated in Monitool
                `,
        },
        {
            prefixes: ['project.usage.home'],
            question: `How to display the roles of different participants in my project`,
            answer: /* html */ `
                    Except for the project owner (the first participant in the list), everyone else's roles are not public!<br/>
                    If you are the owner, you can go to the "Invitations" page in your project configuration
                    to access them.
                `,
        },
        {
            prefixes: ['project.usage.home'],
            question: `
                    All the entries I made were "completed" (green) but are now "incomplete" (yellow). What happened?
                `,
            answer: /* html */ `
                    The project owner probably added variables to forms that
                    you had already filled out, making all your past entries incomplete.<br/>
                    Check with them to see if it is necessary to retroactively enter the missing data.
                `,
        },
        {
            prefixes: ['project.usage.downloads'],
            question: `What is the purpose of logic frameworks in PDF format?`,
            answer: /* html */ `
                    When communicating about your project, it is often more convenient to send your
                    logic framework by email, rather than asking a donor or partner to log in
                    to an online platform to access it.<br/>
        
                    Being able to download them will save you double work: design your logic framework directly
                    on the tool, and have an always up-to-date version ready to be transmitted.
                `,
        },
        {
            prefixes: ['project.usage.downloads'],
            question: `What is the purpose of data entry forms in PDF and Excel format?`,
            answer: /* html */ `
                    In many contexts, setting up electronic data collection tools
                    requires time and training resources.
                    <ul>
                        <li>
                            The PDF version of data entry forms is easily printable, requires no training
                            to use, and can be operational from the first day of your project.
                        </li>
                        <li>
                            The Excel version is an alternative for collection sites where computer access is
                            possible but without internet.<br/>
                            Once filled out, they are designed to be copy-pasted into Monitool's data entry forms
                            in a few seconds.
                        </li>
                    </ul>
                `,
        },
        {
            prefixes: ['project.usage.downloads'],
            question: `The tables on my data entry forms are too wide and exceed the page`,
            answer: /* html */ `
                    You have two options:
                    <ul>
                        <li>
                            A "landscape" version of the same data entry form is available by clicking on
                            <span class="btn btn-default btn-xs"><span class="caret"></span></span>
                            then on
                            <span class="btn btn-default btn-xs">
                                <i class="fa fa-file-pdf-o"></i>
                                Download PDF (landscape)                    
                            </span>.
                        </li>
                        <li>
                            You can ask the project owner to modify the table layout
                            to make it narrower but taller.
                        </li>
                    </ul>
                `,
        },
        {
            prefixes: ['project.usage.downloads'],
            question: `I would like to download my reports`,
            answer: /* html */ `
                    Download links are available on the pages associated with the reports.
                `,
        },
        {
            prefixes: ['project.usage.log', 'project.usage.preview'],
            question: `What does an entry represent?`,
            answer: /* html */ `
                    A new entry is recorded when a user saves data on
                    a form, whether directly or from a paper or Excel form.<br/>
                    To avoid duplicate entries, if during an entry a user saves
                    the same form several times without leaving the page, these multiple saves will
                    be grouped into a single action in the history.
                `,
        },
        {
            prefixes: ['project.usage.preview'],
            question: `What does the symbol ∅ mean?`,
            answer: /* html */ `
                    This symbol means "empty", it denotes the absence of entry on a value.
                `,
        },
        {
            prefixes: ['project.usage.preview'],
            question: `What is the meaning of the color code used?`,
            answer: /* html */ `
                    Boxes containing text in gray have not been modified by the entry being currently viewed<br/>
                    Boxes with text in green, blue, and red have been modified, respectively to add, modify, or delete
                    a value. 
                `,
        },
        {
            prefixes: ['project.usage.uploads'],
            question: `What types of forms can I upload?`,
            answer: /* html */ `
                    Only forms that are available for download
                    in the corresponding section can be uploaded.<br/>
                    Two types of forms are possible: Paper or Excel.<br/>
                    For paper forms, the accepted formats are images (png, jpg), faxes (tiff), and PDFs.<br/>
                    Excel forms must be uploaded in "xlsx" format. They will not work if they are
                    converted to another format (e.g., iWork Numbers, LibreOffice, OpenOffice, ...).
                `,
        },
        {
            prefixes: ['project.usage.uploads'],
            question: `What is the maximum file size for uploads?`,
            answer: /* html */ `
                    It is 16 megabytes per file.<br/>
                    However, there is no need to upload photos larger than 2 megabytes:
                    images with too high resolution slow down processing and do not improve quality. 
                `,
        },
        {
            prefixes: ['project.usage.uploads'],
            question: `How can I ensure the proper automatic recognition of paper forms taken in photos?`,
            answer: /* html */ `
                    When uploading paper forms, you can choose to scan them or take a photo.<br/>
                    A photo of a form taken with a phone and sent by email or messaging is generally
                    sufficient for Monitool to crop it and identify the entry boxes.<br/>
        
                    However, if you have recognition problems, here are some tips to follow for better results:
                    <ul>
                        <li>
                            The form must be fully visible, including the marker that is
                            positioned at the top right of the page, and the three smaller markers that are
                            at the bottom of the page.
                         </li>
                         <li>The form must be laid flat, not held by hand</li>
                         <li>
                            If possible, have a contrasting photo. For example, do not place the form on a
                            white table
                        </li>
                    </ul>
                    
                    However, it is not necessary to:
                    <ul>
                        <li>Be vertically above the form to take the photo.</li>
                        <li>Have the form edges match the photo edges</li>
                    </ul>
                `,
        },
        {
            prefixes: ['project.usage.uploads'],
            question: `How can I ensure the proper automatic recognition of scanned or faxed paper forms?`,
            answer: /* html */ `
                    Scanned or faxed forms should not pose recognition problems.<br/>
                    Make sure they are fully visible (including the three bottom markers).
                `,
        },
        {
            prefixes: ['project.usage.edit', 'project.usage.data_entry'],
            question: `How to quickly move from one box to another?`,
            answer: /* html */ `
                    When entering data, the Tab key on your keyboard allows you to navigate between boxes.<br/>
                    To return to the previous box, use Shift + Tab
                `,
        },
        {
            prefixes: ['project.usage.edit', 'project.usage.data_entry'],
            question: `I enter data from paper forms submitted by several participants per collection site. How to enter data more quickly?`,
            answer: /* html */ `
                    If you have several paper forms to enter per site (for example, one per social worker),
                    and you want to add them up, you can enter sums in the entry boxes: "1+2+3".<br/>
                `,
        },
        {
            prefixes: ['project.usage.list'],
            question: `What do the percentages indicated on each form represent?`,
            answer: /* html */ `
                    It is the percentage of variables that have been at least partially entered.
                `,
        },
        {
            prefixes: ['project.usage.edit', 'project.usage.data_entry'],
            question: `What is the purpose of the "Fill with previous period's data" button?`,
            answer: /* html */ `
                    To save time in certain specific cases!<br/>
                    If your project follows indicators that require indicators that vary little over time (number of supported structures,
                    population of the targeted area, ...), it is often easier to copy the data from the previous entry and correct
                    the differences, than to enter the data from scratch.
                `,
        },
        {
            prefixes: ['project.usage.edit', 'project.usage.data_entry'],
            question: `What is the purpose of the "Replace missing values with zero" button?`,
            answer: /* html */ `
                    To save time in certain specific cases!<br/>
                    For some variables, it may happen that most of the values that need to be entered are zeros.
                    This frequently occurs if multiple disaggregations are used on the same variable.  
                `,
        },
        {
            prefixes: ['project.usage.edit', 'project.usage.data_entry'],
            question: `What happens if I leave some boxes blank?`,
            answer: /* html */ `
                    Attention!<br/>
                    A blank box is not equivalent to a box containing a zero. Unentered data will appear as such
                    in the reports.
                `,
        },

        // Reporting
        {
            prefixes: ['project.usage.general'],
            question: `How to display a graph?`,
            answer: /* html */ `
                    On the left of each row, the symbol <i class="fa fa-line-chart"></i> allows you to display a graph
                    containing the data of the current row.`,
        },
        {
            prefixes: ['project.usage.general'],
            question: `How to verify the data used to calculate an indicator?`,
            answer: /* html */ `On each indicator, the symbol <i class="fa fa-plus"></i> allows you to access the different components used to
                calculate each indicator: choose "Calculation".<br/>
                This option is only available for indicators calculated from data sources.`,
        },
        {
            prefixes: ['project.usage.general'],
            question: `How to disaggregate my data by collection site?`,
            answer: /* html */ `On each row, the symbol <i class="fa fa-plus"></i> allows you to disaggregate your result by collection site.`,
        },
        {
            prefixes: ['project.usage.general'],
            question: `How to disaggregate my data by age group, gender, pathology, training content, ...?`,
            answer: /* html */ `
                    If you used disaggregations during data collection, they will appear in the
                    menu accessible on each row by clicking on the <i class="fa fa-plus"></i> symbol.<br/>
                    For calculated indicators (logic frameworks, and additional indicators), it is only possible to disaggregate
                    the results by collection site and time unit.`,
        },
        {
            prefixes: ['project.usage.general', 'project.usage.olap'],
            question: `What does the symbol <i class="fa fa-question-circle-o"></i> mean that appears instead of my data?`,
            answer: /* html */ `This symbol means that the data entry you are trying to view has not yet been completed.`,
        },
        {
            prefixes: ['project.usage.general', 'project.usage.olap'],
            question: `What does the symbol <i class="fa fa fa-exclamation"></i> mean that appears instead of my data?`,
            answer: /* html */ `
                This symbol means that a division by zero has occurred!
            `,
        },
        {
            prefixes: ['project.usage.general', 'project.usage.olap'],
            question: `Why are some data preceded by the symbol ≈?`,
            answer: /* html */ `You are viewing this data at a level of aggregation that is lower than the one at which you collected them!<br/>
                For example, you collected data quarterly, but are viewing them on a table that displays them
                monthly.<br/><br/>
                In this case, the data are "interpolated" to allow you to have orders of magnitude, and to be able to
                compare indicators that you do not collect with the same periodicities with each other.<br/>
                This also occurs if you are viewing a calculated indicator, for example a percentage, but the numerator
                and denominator are not collected with the same periodicities.<br/><br/>
                For example, if you collected an expected number of births in a maternity ward per quarter, but
                you are viewing it per month, monitool will distribute the quarterly number of births into each month, adjusting it
                according to the number of days they contain.<br/>
                The ≈ symbol is therefore displayed permanently to remind you that the data you are viewing are rough approximations
                of reality, and that they can only be used to have orders of magnitude.
                `,
        },
        {
            prefixes: ['project.usage.general', 'project.usage.olap'],
            question: `Why are some data displayed in <i>italics</i>?`,
            answer: /* html */ `
                Data displayed in <i>italics</i> have only been partially entered. Most often, this means that
                only some of the expected collection sites have been entered.
                The case can also occur if you are viewing an aggregated version (e.g., by quarter) of data collected
                at a shorter periodicity (e.g., by month) and not all months of the considered quarter have been entered.<br/>
                By disaggregating the row with the <i class="fa fa-plus"></i> button, you can easily find the missing entries.`,
        },
    ],
};
