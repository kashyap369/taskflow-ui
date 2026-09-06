import { HelpTopic } from './guidance.models';

/**
 * The guidance catalogue: one entry per page the user can be standing
 * on. The help launcher, the documentation index and the "related
 * pages" links all read from here, so adding help for a new page means
 * adding one entry — not editing three components.
 *
 * **Anchors.** Tour steps point at `[data-tour="…"]` attributes rather
 * than class names, because class names belong to the design and change
 * with it. A page that has not been annotated yet still gives a useful
 * tour: TourService turns an anchor it cannot find into a centred card,
 * keeping the explanation and losing only the highlight. That is why
 * this registry can be complete before every template is annotated.
 *
 * **Copy.** Each step says what the thing *is for*, not what it is
 * called — the label is already on screen. The sequence of a tour
 * follows the order someone actually works in, which is why, for
 * instance, the Projects tour ends by pointing at Tasks.
 */
export const HELP_TOPICS: readonly HelpTopic[] = [
  // ---------------------------------------------------------------
  // Organization portal
  // ---------------------------------------------------------------
  {
    key: 'org.dashboard',
    route: '/organization/dashboard',
    label: 'Dashboard',
    icon: 'LayoutDashboard',
    summary: 'The health of your whole workspace at a glance.',
    docSlug: 'dashboard',
    related: ['org.projects', 'org.tasks', 'org.reports'],
    portal: 'organization',
    tour: [
      {
        title: 'This is your workspace',
        description:
          'Everything in TaskFlow belongs to an organization. This page summarises yours: what is being worked on, what is finished, and what has slipped.',
      },
      {
        element: '[data-tour="org.workspace-switcher"]',
        title: 'Which workspace you are in',
        description:
          'All the numbers below belong to the organization named here. If you belong to more than one, switch between them from this card.',
        side: 'right',
      },
      {
        element: '[data-tour="org.dashboard.stats"]',
        title: 'The four numbers that matter',
        description:
          'Projects running, work in progress, work completed, and anything now overdue. Overdue is the one to act on — it means a due date passed with the task still open.',
        side: 'bottom',
      },
      {
        element: '[data-tour="org.nav"]',
        title: 'Where everything lives',
        description:
          'Roles decide what people may do, Members and Teams decide who is involved, and Projects hold the actual work. If you are setting up for the first time, work down that list in order.',
        side: 'right',
      },
      {
        title: 'A suggested first hour',
        description:
          'Create your roles, invite your members, group them into teams, then create a project and start adding tasks. Each of those pages has its own tour when you get there.',
      },
    ],
  },

  {
    key: 'org.projects',
    route: '/organization/projects',
    label: 'Projects',
    icon: 'FolderKanban',
    summary: 'Containers for related work, each with its own tasks and dates.',
    docSlug: 'projects',
    related: ['org.project-detail', 'org.tasks', 'org.teams', 'org.calendar'],
    portal: 'organization',
    tour: [
      {
        title: 'Projects hold the work',
        description:
          'A project is a container for related tasks — a product launch, a client engagement, a quarter of maintenance. Tasks always belong to one.',
      },
      {
        element: '[data-tour="org.projects.create"]',
        title: 'Start a project',
        description:
          'A name and a date range is enough to begin. You can add tasks the moment it exists and adjust the dates later.',
        side: 'left',
      },
      {
        element: '[data-tour="org.projects.list"]',
        title: 'Your projects',
        description:
          'Open any project to see its tasks, its progress and the people on it. This is where most day-to-day work starts.',
        side: 'top',
      },
      {
        element: '[data-tour="org.projects.import"]',
        title: 'Bringing in an existing plan',
        description:
          'If the plan already exists elsewhere, import it here rather than retyping it — tasks and dates come across together.',
        side: 'left',
      },
      {
        title: 'What connects to a project',
        description:
          'Tasks live inside projects. Teams decide who can be assigned to them. Dated tasks appear on the Calendar, and Reports measure the result.',
      },
    ],
  },

  {
    key: 'org.project-detail',
    route: '/organization/projects/:id',
    label: 'Project detail',
    icon: 'FolderOpen',
    summary: 'One project: its tasks, progress and settings.',
    docSlug: 'projects',
    related: ['org.tasks', 'org.projects', 'org.reports'],
    portal: 'organization',
    tour: [
      {
        title: 'Inside a project',
        description:
          'Everything on this page belongs to this one project — its tasks, its dates and its progress.',
      },
      {
        element: '[data-tour="org.project-detail.tasks"]',
        title: 'The project’s tasks',
        description:
          'Add tasks here and they are automatically filed under this project. Each one can be assigned, dated and broken into subtasks.',
        side: 'top',
      },
      {
        element: '[data-tour="org.project-detail.edit"]',
        title: 'Changing the project',
        description:
          'Rename it, move its dates, or change its status. Existing tasks keep their own dates — moving a project does not move them.',
        side: 'left',
      },
    ],
  },

  {
    key: 'org.tasks',
    route: '/organization/tasks',
    label: 'Tasks',
    icon: 'CheckSquare',
    summary: 'Every piece of work, with subtasks and time tracking.',
    docSlug: 'tasks',
    related: ['org.project-detail', 'org.members', 'org.reports', 'org.calendar'],
    portal: 'organization',
    tour: [
      {
        title: 'Tasks are the unit of work',
        description:
          'A task belongs to a project, is assigned to one person, and carries a status and a due date. Almost everything else in TaskFlow is a view over these.',
      },
      {
        element: '[data-tour="org.tasks.create"]',
        title: 'Creating a task',
        description:
          'Pick the project, the assignee and a due date. The assignee list comes from your members — someone must be a member before they can be given work.',
        side: 'left',
      },
      {
        element: '[data-tour="org.tasks.list"]',
        title: 'Filtering down',
        description:
          'Narrow by project, status or assignee to answer questions like "what is this team doing this week" without leaving the page.',
        side: 'top',
      },
      {
        element: '[data-tour="org.tasks.subtasks"]',
        title: 'Subtasks',
        description:
          'Break a large task into checkable steps. Subtasks are not assigned or dated separately — they exist to show progress inside one task.',
        side: 'left',
      },
      {
        element: '[data-tour="org.tasks.worklog"]',
        title: 'Time tracking',
        description:
          'Log hours against a task as the work happens. These entries are what the time reports are built from — no logs means empty reports.',
        side: 'left',
      },
    ],
  },

  {
    key: 'org.members',
    route: '/organization/members',
    label: 'Members',
    icon: 'Users',
    summary: 'Who is in the organization, and how to invite more.',
    docSlug: 'members',
    related: ['org.roles', 'org.teams', 'org.invitations'],
    portal: 'organization',
    tour: [
      {
        title: 'Members are people in your organization',
        description:
          'Someone becomes a member by accepting an email invitation. Only members can be assigned tasks or added to teams.',
      },
      {
        element: '[data-tour="org.members.invite"]',
        title: 'Inviting someone',
        description:
          'Enter their email and choose the role they should have. They receive a link and join with whatever permissions that role carries.',
        side: 'left',
      },
      {
        element: '[data-tour="org.members.pending"]',
        title: 'Invitations not yet accepted',
        description:
          'Invitations sit here until accepted. Someone who has not accepted is not a member yet and cannot be assigned work.',
        side: 'top',
      },
      {
        element: '[data-tour="org.members.list"]',
        title: 'Changing what someone can do',
        description:
          'Change a member’s role here. Permissions come from the role, never from the person — to give one member more access, either move them to another role or change that role.',
        side: 'top',
      },
    ],
  },

  {
    key: 'org.teams',
    route: '/organization/teams',
    label: 'Teams',
    icon: 'Users',
    summary: 'Groups of members, used to organise work and reporting.',
    docSlug: 'teams',
    related: ['org.team-detail', 'org.members', 'org.roles', 'org.reports'],
    portal: 'organization',
    tour: [
      {
        title: 'Teams group your members',
        description:
          'A team is a named group of people — Engineering, Design, a client pod. Teams organise and report on work; they do not grant permissions. That is what roles do.',
      },
      {
        element: '[data-tour="org.teams.create"]',
        title: 'Creating a team',
        description:
          'Name it and add members. A person can be in several teams, and being in none does not stop them working.',
        side: 'left',
      },
      {
        element: '[data-tour="org.teams.list"]',
        title: 'Opening a team',
        description:
          'Open a team to manage who is in it and see what the group is working on.',
        side: 'top',
      },
    ],
  },

  {
    key: 'org.team-detail',
    route: '/organization/teams/:id',
    label: 'Team detail',
    icon: 'Users',
    summary: 'One team: its members and its work.',
    docSlug: 'teams',
    related: ['org.teams', 'org.members', 'org.reports'],
    portal: 'organization',
    tour: [
      {
        title: 'Inside a team',
        description:
          'The people in this team and what they are working on. Adding someone here does not change their permissions — those come from their role.',
      },
      {
        element: '[data-tour="org.team-detail.members"]',
        title: 'Team membership',
        description:
          'Add or remove people. They must already be members of the organization; invite them first if they are not.',
        side: 'top',
      },
    ],
  },

  {
    key: 'org.roles',
    route: '/organization/roles',
    label: 'Roles & permissions',
    icon: 'Settings',
    summary: 'What each kind of member is allowed to do.',
    docSlug: 'roles',
    related: ['org.members', 'org.teams', 'org.settings'],
    portal: 'organization',
    tour: [
      {
        title: 'Roles decide what people may do',
        description:
          'This is the page most worth understanding. Every permission in TaskFlow is granted through a role — never to a person directly.',
      },
      {
        element: '[data-tour="org.roles.create"]',
        title: 'Creating a role',
        description:
          'Name the role for the job, not the person — "Project manager", not "Sam". You will reuse it every time you hire into that job.',
        side: 'left',
      },
      {
        element: '[data-tour="org.roles.list"]',
        title: 'Permissions inside a role',
        description:
          'Tick exactly what that role may do: create projects, assign tasks, invite members, run meetings. Members holding the role get those abilities immediately.',
        side: 'top',
      },
      {
        title: 'The owner is different',
        description:
          'Whoever created the organization is its owner and always has full access — the owner cannot be locked out by a role change, which is what stops a workspace becoming unmanageable.',
      },
      {
        title: 'The order that works',
        description:
          'Roles first, then invite members into those roles, then group them into teams. Doing it the other way round means going back to fix access.',
      },
    ],
  },

  {
    key: 'org.calendar',
    route: '/organization/calendar',
    label: 'Calendar',
    icon: 'CalendarDays',
    summary: 'Dated work and meetings on one timeline.',
    docSlug: 'calendar',
    related: ['org.tasks', 'org.meetings', 'org.projects'],
    portal: 'organization',
    tour: [
      {
        title: 'Your schedule in one place',
        description:
          'The calendar is a view, not a separate store. Tasks with due dates and scheduled meetings appear here automatically.',
      },
      {
        element: '[data-tour="org.calendar.grid"]',
        title: 'Reading the calendar',
        description:
          'Open any item to jump to the task or meeting it represents. A task with no due date will never appear here — that is the usual reason something seems missing.',
        side: 'top',
      },
      {
        element: '[data-tour="org.calendar.workload"]',
        title: 'Workload',
        description:
          'Who is over-committed in the period you are looking at. Useful before assigning more work, and it only counts dated tasks.',
        side: 'left',
      },
    ],
  },

  {
    key: 'org.meetings',
    route: '/organization/meetings',
    label: 'Meetings',
    icon: 'Video',
    summary: 'Scheduled video meetings, with guests and recordings.',
    docSlug: 'meetings',
    related: ['org.meeting-detail', 'org.calendar', 'org.members'],
    portal: 'organization',
    tour: [
      {
        title: 'Meetings live in your workspace',
        description:
          'Video meetings scheduled here appear on your calendar, invite your members, and can admit people from outside your organization as guests.',
      },
      {
        element: '[data-tour="org.meetings.create"]',
        title: 'Scheduling one',
        description:
          'Give it a title, a time and participants. Members are invited by name; anyone outside the organization joins through a guest link you create afterwards.',
        side: 'left',
      },
      {
        element: '[data-tour="org.meetings.list"]',
        title: 'Upcoming and past',
        description:
          'Switch between what is coming and what has happened. Open a meeting to manage guests, badges and recordings before it starts.',
        side: 'top',
      },
      {
        title: 'Joining',
        description:
          'The join button appears close to the start time. If it is missing, the meeting has not opened yet or you are not on the participant list.',
      },
    ],
  },

  {
    key: 'org.meeting-detail',
    route: '/organization/meetings/:id',
    label: 'Meeting detail',
    icon: 'Video',
    summary: 'One meeting: participants, guest access, badges, recordings.',
    docSlug: 'meetings',
    related: ['org.meetings', 'org.members'],
    portal: 'organization',
    tour: [
      {
        title: 'Everything about one meeting',
        description:
          'Set up here before the meeting starts: who is coming, how outsiders get in, and whether it is recorded.',
      },
      {
        element: '[data-tour="org.meeting-detail.participants"]',
        title: 'Participants',
        description:
          'Members you invite by name. They see the meeting in their own calendar and can join without a link.',
        side: 'top',
      },
      {
        element: '[data-tour="org.meeting-detail.guests"]',
        title: 'Guest access',
        description:
          'For people outside your organization. Create a link, share it, and revoke it when it is no longer needed — a revoked link stops working immediately.',
        side: 'top',
      },
      {
        element: '[data-tour="org.meeting-detail.badges"]',
        title: 'Display badges',
        description:
          'Labels shown next to names in the call — "Host", "Client", "Observer" — so people know who they are talking to.',
        side: 'top',
      },
      {
        element: '[data-tour="org.meeting-detail.recordings"]',
        title: 'Recordings',
        description:
          'Recordings appear here after the meeting ends. Everyone in the call is told when recording is on; consent is asked for, not assumed.',
        side: 'top',
      },
    ],
  },

  {
    key: 'org.reports',
    route: '/organization/reports',
    label: 'Reports',
    icon: 'BarChart3',
    summary: 'Output by member, team and project, plus logged time.',
    docSlug: 'reports',
    related: ['org.tasks', 'org.teams', 'org.projects'],
    portal: 'organization',
    tour: [
      {
        title: 'Reports read your existing data',
        description:
          'Nothing is entered here. Reports are built from tasks, their statuses and the time logged against them — which is why unlogged work shows as no work.',
      },
      {
        element: '[data-tour="org.reports.filters"]',
        title: 'Choosing what to measure',
        description:
          'Pick a period and a view — by member, by team, or by project — to answer a specific question rather than reading everything.',
        side: 'bottom',
      },
      {
        element: '[data-tour="org.reports.timeline"]',
        title: 'Trend over time',
        description:
          'Completion across the period. A flat line usually means tasks are not being moved to done, rather than that nothing happened.',
        side: 'top',
      },
    ],
  },

  {
    key: 'org.settings',
    route: '/organization/settings',
    label: 'Settings',
    icon: 'SlidersHorizontal',
    summary: 'Organization name, details and deletion.',
    docSlug: 'settings',
    related: ['org.roles', 'org.members'],
    portal: 'organization',
    tour: [
      {
        title: 'Organization settings',
        description:
          'Details about the organization itself. Permissions are not here — those live on the Roles page.',
      },
      {
        element: '[data-tour="org.settings.general"]',
        title: 'Name and details',
        description:
          'What your members and guests see. Changing the name does not affect any existing work.',
        side: 'top',
      },
      {
        element: '[data-tour="org.settings.danger"]',
        title: 'Deleting the organization',
        description:
          'This removes the workspace and everything filed under it — projects, tasks, teams and meetings. Read the confirmation carefully; it is not a per-item delete.',
        side: 'top',
      },
    ],
  },

  {
    key: 'org.invitations',
    route: '/organization/invitations',
    label: 'Invitations',
    icon: 'Mail',
    summary: 'Invitations addressed to you from other organizations.',
    docSlug: 'invitations',
    related: ['org.members', 'member.dashboard'],
    portal: 'both',
    tour: [
      {
        title: 'Invitations sent to you',
        description:
          'These are invitations you have received, not ones you sent. An organization account can be invited into someone else’s workspace too.',
      },
      {
        element: '[data-tour="invitations.list"]',
        title: 'Accepting or declining',
        description:
          'Accepting makes you a member of that organization with the role they chose, and it appears in your workspace switcher.',
        side: 'top',
      },
    ],
  },

  // ---------------------------------------------------------------
  // Member portal
  // ---------------------------------------------------------------
  {
    key: 'member.dashboard',
    route: '/member/dashboard',
    label: 'Personal dashboard',
    icon: 'UserRound',
    summary: 'Your own work across every organization you belong to.',
    docSlug: 'member-dashboard',
    related: ['member.my-tasks', 'member.projects', 'org.invitations'],
    portal: 'member',
    tour: [
      {
        title: 'Your personal workspace',
        description:
          'This side of TaskFlow is yours. It shows the work assigned to you, gathered from every organization you are a member of.',
      },
      {
        element: '[data-tour="member.dashboard.stats"]',
        title: 'Where you stand',
        description:
          'What is assigned to you, what is in progress and what is overdue — across all your organizations, not one at a time.',
        side: 'bottom',
      },
      {
        element: '[data-tour="org.nav"]',
        title: 'Getting around',
        description:
          'My Tasks is the day-to-day page. Projects shows what you are part of, and Invitations is where new organizations reach you.',
        side: 'right',
      },
    ],
  },

  {
    key: 'member.my-tasks',
    route: '/member/my-tasks',
    label: 'My tasks',
    icon: 'CheckSquare',
    summary: 'Everything assigned to you, and where you log time.',
    docSlug: 'member-tasks',
    related: ['member.projects', 'member.dashboard'],
    portal: 'member',
    tour: [
      {
        title: 'The work assigned to you',
        description:
          'Every task anyone has assigned to you, from every organization, in one list. This is the page to live in.',
      },
      {
        element: '[data-tour="member.my-tasks.list"]',
        title: 'Moving work along',
        description:
          'Change a task’s status as you go. What you set here is what your organization sees on their dashboards and reports.',
        side: 'top',
      },
      {
        element: '[data-tour="member.my-tasks.worklog"]',
        title: 'Logging your time',
        description:
          'Record hours against a task while you remember them. Time reports are built entirely from these entries.',
        side: 'left',
      },
    ],
  },

  {
    key: 'member.projects',
    route: '/member/projects',
    label: 'My projects',
    icon: 'FolderKanban',
    summary: 'The projects you are involved in.',
    docSlug: 'member-projects',
    related: ['member.my-tasks', 'member.dashboard'],
    portal: 'member',
    tour: [
      {
        title: 'Projects you are part of',
        description:
          'The projects containing work assigned to you. You see the project and its tasks; managing it stays with the organization.',
      },
      {
        element: '[data-tour="member.projects.list"]',
        title: 'Opening a project',
        description:
          'Open one for the context around your task — what else is in it, and when it is due.',
        side: 'top',
      },
    ],
  },

  {
    key: 'member.invitations',
    route: '/member/invitations',
    label: 'Invitations',
    icon: 'Mail',
    summary: 'Organizations asking you to join.',
    docSlug: 'invitations',
    related: ['member.dashboard', 'member.my-tasks'],
    portal: 'member',
    tour: [
      {
        title: 'Invitations to join',
        description:
          'When an organization invites you, it arrives here as well as by email.',
      },
      {
        element: '[data-tour="invitations.list"]',
        title: 'Accepting',
        description:
          'Accepting makes you a member with the role they chose, and their work starts appearing in My Tasks.',
        side: 'top',
      },
    ],
  },
];

/**
 * The first-run welcome, shown once per account. It is not tied to a
 * route — it explains the shape of the product before the user has
 * anywhere meaningful to stand.
 */
export const WELCOME_TOPIC_KEY = 'welcome';

export const WELCOME_TOURS: Readonly<Record<'organization' | 'member', HelpTopic>> = {
  organization: {
    key: 'welcome.organization',
    route: '/organization/dashboard',
    label: 'Welcome to TaskFlow',
    icon: 'Sparkles',
    summary: 'How the pieces fit together, in one minute.',
    docSlug: 'getting-started',
    related: ['org.roles', 'org.members', 'org.projects'],
    portal: 'organization',
    tour: [
      {
        title: 'Welcome to TaskFlow',
        description:
          'One minute on how this fits together, then you can explore. You can replay this any time from the help button.',
      },
      {
        title: 'The shape of it',
        description:
          'Your organization contains members. Roles decide what members may do. Teams group them. Projects hold tasks, tasks hold subtasks, and time is logged against tasks.',
      },
      {
        element: '[data-tour="org.nav"]',
        title: 'That order is the setup order',
        description:
          'Roles, then Members, then Teams, then Projects and Tasks. Setting up in that order avoids going back to fix who can do what.',
        side: 'right',
      },
      {
        element: '[data-tour="help.launcher"]',
        title: 'Help is always here',
        description:
          'On any page, this button explains that page and offers a tour of it. "How to use" in the sidebar has the full documentation.',
        side: 'left',
      },
    ],
  },
  member: {
    key: 'welcome.member',
    route: '/member/dashboard',
    label: 'Welcome to TaskFlow',
    icon: 'Sparkles',
    summary: 'How your personal workspace works.',
    docSlug: 'getting-started',
    related: ['member.my-tasks', 'member.projects'],
    portal: 'member',
    tour: [
      {
        title: 'Welcome to TaskFlow',
        description:
          'A quick orientation, replayable any time from the help button.',
      },
      {
        title: 'How your side works',
        description:
          'You do work that organizations assign to you. Join one by accepting an invitation; your tasks from every organization then collect in My Tasks.',
      },
      {
        element: '[data-tour="help.launcher"]',
        title: 'Help is always here',
        description:
          'This button explains whichever page you are on, and "How to use" in the sidebar has the full documentation.',
        side: 'left',
      },
    ],
  },
};
