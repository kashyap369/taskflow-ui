export type LegalDocumentKey = 'privacy' | 'terms' | 'cookies';

export interface LegalTableRow {
  name: string;
  purpose: string;
  duration: string;
}

export interface LegalSection {
  id: string;
  title: string;
  paragraphs: readonly string[];
  items?: readonly string[];
  table?: readonly LegalTableRow[];
  note?: string;
}

export interface LegalDocument {
  key: LegalDocumentKey;
  title: string;
  shortTitle: string;
  description: string;
  updated: string;
  icon: 'FileLock2' | 'Scale' | 'Cookie';
  sections: readonly LegalSection[];
}

export const LEGAL_DOCUMENTS: Record<LegalDocumentKey, LegalDocument> = {
  privacy: {
    key: 'privacy',
    title: 'Privacy Policy',
    shortTitle: 'Privacy',
    description:
      'How TaskFlow collects, uses, protects, and gives you control over your information.',
    updated: 'August 13, 2026',
    icon: 'FileLock2',
    sections: [
      {
        id: 'scope',
        title: 'Scope of this policy',
        paragraphs: [
          'This Privacy Policy applies when you use TaskFlow websites, applications, and related services. It explains the information we process, why we process it, and the choices available to you.',
          'If you use TaskFlow through an organization, that organization may control the workspace and the information submitted to it. In that situation, your organization may be the data controller and its own privacy policies may also apply.',
        ],
      },
      {
        id: 'information-we-collect',
        title: 'Information we collect',
        paragraphs: [
          'We collect information you provide directly, information created through your use of TaskFlow, and limited technical information needed to operate and secure the service.',
        ],
        items: [
          'Account and profile information, such as your name, email address, phone number, account type, and authentication details.',
          'Workspace content, such as organizations, teams, projects, tasks, comments, assignments, due dates, and files where file features are enabled.',
          'Usage and device information, including browser type, device information, IP address, timestamps, diagnostics, and interactions with the service.',
          'Communications you send to TaskFlow, including support requests and feedback.',
        ],
      },
      {
        id: 'how-we-use-information',
        title: 'How we use information',
        paragraphs: ['We use information only for legitimate product and business purposes, including to:'],
        items: [
          'Provide, maintain, personalize, and improve TaskFlow.',
          'Create and secure accounts, authenticate sessions, and prevent abuse or unauthorized access.',
          'Enable collaboration and show workspace activity to the appropriate members.',
          'Respond to support requests and communicate important service information.',
          'Understand reliability and performance, troubleshoot problems, and develop new functionality.',
          'Meet legal obligations and enforce our Terms of Service.',
        ],
      },
      {
        id: 'legal-bases',
        title: 'Legal bases for processing',
        paragraphs: [
          'Where data-protection law requires a legal basis, we rely on performing our contract with you, our legitimate interests in operating and improving TaskFlow, compliance with legal obligations, and consent where we specifically request it. You may withdraw consent at any time without affecting earlier processing.',
        ],
      },
      {
        id: 'sharing',
        title: 'How information is shared',
        paragraphs: [
          'We do not sell your personal information. We may share information with service providers that help us host, secure, support, and operate TaskFlow; with other members of a workspace as directed by its administrators; and when required to comply with law or protect rights and safety.',
          'If TaskFlow is involved in a merger, acquisition, financing, or sale of assets, information may be transferred as part of that transaction subject to appropriate confidentiality protections.',
        ],
      },
      {
        id: 'retention',
        title: 'Retention and deletion',
        paragraphs: [
          'We retain information for as long as needed to provide the service, maintain legitimate business records, resolve disputes, enforce agreements, and meet legal requirements. Retention periods vary by data type and workspace settings.',
          'When information is no longer required, we delete or de-identify it. Backup copies may remain for a limited period before being overwritten through normal backup cycles.',
        ],
      },
      {
        id: 'security',
        title: 'Security',
        paragraphs: [
          'We use administrative, technical, and organizational safeguards designed to protect information against loss, misuse, and unauthorized access. No method of transmission or storage is completely secure, so we cannot guarantee absolute security.',
          'You are responsible for keeping your credentials confidential and for promptly reporting suspected unauthorized account activity.',
        ],
      },
      {
        id: 'your-rights',
        title: 'Your choices and rights',
        paragraphs: [
          'Depending on where you live, you may have rights to access, correct, delete, restrict, or export personal information, or to object to certain processing. You may also have the right to complain to your local data-protection authority.',
          'Workspace members should first contact their workspace administrator for requests concerning organization-controlled content. We may need to verify your identity before completing a request.',
        ],
      },
      {
        id: 'international-transfers',
        title: 'International transfers',
        paragraphs: [
          'TaskFlow and its service providers may process information in countries other than your own. Where required, we use recognized safeguards for international transfers and apply protections consistent with this policy.',
        ],
      },
      {
        id: 'children',
        title: 'Children’s privacy',
        paragraphs: [
          'TaskFlow is not directed to children under 13, or a higher minimum age where required by local law. We do not knowingly collect personal information from children who cannot legally consent to use the service.',
        ],
      },
      {
        id: 'changes-and-contact',
        title: 'Changes and contact',
        paragraphs: [
          'We may update this policy as TaskFlow evolves or legal requirements change. We will revise the date above and provide additional notice when a change materially affects your rights.',
          'For privacy questions or requests, contact TaskFlow through the support channel available in the service or on our website.',
        ],
      },
    ],
  },
  terms: {
    key: 'terms',
    title: 'Terms of Service',
    shortTitle: 'Terms',
    description:
      'The rules and responsibilities that apply when you create an account or use TaskFlow.',
    updated: 'August 13, 2026',
    icon: 'Scale',
    sections: [
      {
        id: 'agreement',
        title: 'Agreement to these terms',
        paragraphs: [
          'These Terms of Service govern your access to and use of TaskFlow. By creating an account, accessing a workspace, or otherwise using the service, you agree to these terms and to our Privacy Policy.',
          'If you use TaskFlow for an organization, you represent that you are authorized to accept these terms on its behalf. If a separate written agreement applies, that agreement controls to the extent of a conflict.',
        ],
      },
      {
        id: 'accounts',
        title: 'Accounts and eligibility',
        paragraphs: [
          'You must provide accurate information, keep it current, and safeguard your account credentials. You are responsible for activity performed through your account unless you promptly notify us of unauthorized use.',
          'You must be legally capable of entering into this agreement and meet the minimum age required in your location. You may not use TaskFlow if applicable law prohibits you from receiving the service.',
        ],
      },
      {
        id: 'workspaces',
        title: 'Organizations and workspaces',
        paragraphs: [
          'Workspace owners and administrators may invite or remove members, assign roles, manage content, and control workspace settings. If you join an organization-managed workspace, your use is subject to that organization’s policies and administrator decisions.',
          'You are responsible for obtaining any permissions needed before submitting personal information or confidential material to a workspace.',
        ],
      },
      {
        id: 'acceptable-use',
        title: 'Acceptable use',
        paragraphs: ['You may not use TaskFlow to:'],
        items: [
          'Break the law, infringe intellectual-property or privacy rights, or facilitate harmful conduct.',
          'Upload malware, probe for vulnerabilities, bypass access controls, or interfere with the service.',
          'Access another person’s account or data without authorization.',
          'Send spam, deceptive content, or material that is abusive, discriminatory, or exploitative.',
          'Reverse engineer or copy the service except where applicable law expressly allows it.',
          'Use automated methods that place an unreasonable load on TaskFlow or evade published limits.',
        ],
      },
      {
        id: 'your-content',
        title: 'Your content',
        paragraphs: [
          'You retain ownership of content you submit to TaskFlow. You grant us a limited, worldwide license to host, process, transmit, display, and back up that content only as needed to provide, secure, and improve the service and follow your instructions.',
          'You are responsible for your content and for ensuring that you have the rights needed to submit it. We may remove content that violates these terms or creates a legal or security risk.',
        ],
      },
      {
        id: 'our-service',
        title: 'TaskFlow and service changes',
        paragraphs: [
          'TaskFlow and its underlying software, design, trademarks, and documentation belong to TaskFlow and its licensors. These terms give you a limited, non-exclusive, non-transferable right to use the service; they do not transfer ownership.',
          'We may improve, modify, suspend, or discontinue parts of the service. When practical, we will provide notice of changes that materially reduce core functionality.',
        ],
      },
      {
        id: 'paid-services',
        title: 'Paid services',
        paragraphs: [
          'If you purchase a paid plan, the price, billing cycle, taxes, renewal terms, and cancellation options shown at checkout or in an order form become part of these terms. Except where law requires otherwise, fees already paid are non-refundable.',
          'We will provide advance notice before a price change applies to a future renewal. Failure to pay may result in downgrade, suspension, or termination of paid functionality.',
        ],
      },
      {
        id: 'termination',
        title: 'Suspension and termination',
        paragraphs: [
          'You may stop using TaskFlow at any time. We may restrict or suspend access when reasonably necessary to protect the service, comply with law, prevent harm, or address a material breach of these terms.',
          'Provisions that by their nature should survive termination—including ownership, payment obligations, disclaimers, and limitations of liability—will remain in effect.',
        ],
      },
      {
        id: 'disclaimers',
        title: 'Disclaimers',
        paragraphs: [
          'TaskFlow is provided “as is” and “as available.” To the fullest extent permitted by law, we disclaim implied warranties, including merchantability, fitness for a particular purpose, non-infringement, and uninterrupted or error-free operation. Some jurisdictions do not allow certain disclaimers, so they may not apply to you.',
        ],
      },
      {
        id: 'liability',
        title: 'Limitation of liability',
        paragraphs: [
          'To the fullest extent permitted by law, TaskFlow will not be liable for indirect, incidental, special, consequential, exemplary, or punitive damages, or for lost profits, revenues, data, or business opportunities arising from the service.',
          'Where liability cannot be excluded, TaskFlow’s aggregate liability will not exceed the amount you paid for the service during the twelve months before the event giving rise to the claim. These limits do not apply where prohibited by law.',
        ],
      },
      {
        id: 'general',
        title: 'General terms',
        paragraphs: [
          'If part of these terms is unenforceable, the remaining terms remain effective. A delay in enforcing a provision is not a waiver. You may not transfer these terms without our consent; we may transfer them as part of a reorganization or business transaction.',
          'The governing law and venue are those stated in an applicable order form or separate agreement. If none applies, they will be determined by the jurisdiction of TaskFlow’s operating entity, subject to mandatory consumer protections.',
        ],
      },
      {
        id: 'changes-and-contact',
        title: 'Changes and contact',
        paragraphs: [
          'We may update these terms to reflect service, legal, or operational changes. We will post the revised terms, update the date above, and provide additional notice when required. Continued use after the effective date means you accept the revised terms.',
          'Questions about these terms can be sent through the support channel available in TaskFlow or on our website.',
        ],
      },
    ],
  },
  cookies: {
    key: 'cookies',
    title: 'Cookie Policy',
    shortTitle: 'Cookies',
    description:
      'A clear explanation of the cookies and browser storage TaskFlow uses—and how you control them.',
    updated: 'August 13, 2026',
    icon: 'Cookie',
    sections: [
      {
        id: 'about-cookies',
        title: 'About cookies and browser storage',
        paragraphs: [
          'Cookies are small text files stored by a website. TaskFlow may also use similar browser technologies, including local storage and session storage. This policy refers to all of these technologies together as “cookies.”',
          'Some storage is required for the service to function. Other technologies, such as optional analytics, would be used only where permitted and with consent when consent is required.',
        ],
      },
      {
        id: 'what-we-use',
        title: 'What TaskFlow uses',
        paragraphs: [
          'The current TaskFlow web application uses browser storage primarily for secure sign-in, session continuity, workspace preferences, and your light or dark theme choice.',
        ],
        table: [
          {
            name: 'Authentication',
            purpose: 'Keeps you signed in and helps protect authenticated requests.',
            duration: 'Session or until sign-out, depending on “remember me”',
          },
          {
            name: 'Account session',
            purpose: 'Retains the signed-in user context needed to operate the application.',
            duration: 'Session or until sign-out',
          },
          {
            name: 'Workspace selection',
            purpose: 'Remembers the organization you most recently selected.',
            duration: 'Until changed or browser data is cleared',
          },
          {
            name: 'Theme preference',
            purpose: 'Remembers whether you selected light or dark appearance.',
            duration: 'Until changed or browser data is cleared',
          },
        ],
        note:
          'TaskFlow does not use browser storage in the current web application to build advertising profiles or sell information to advertisers.',
      },
      {
        id: 'cookie-categories',
        title: 'Cookie categories',
        paragraphs: ['Cookies and similar technologies may fall into these categories:'],
        items: [
          'Strictly necessary: required for authentication, security, navigation, and core service operation.',
          'Preferences: remember choices such as theme, language, and workspace context.',
          'Analytics: help understand performance and feature usage. These are used only if enabled and subject to any consent requirements.',
        ],
      },
      {
        id: 'third-parties',
        title: 'Third-party services',
        paragraphs: [
          'TaskFlow may rely on service providers for infrastructure, security, support, or analytics. A provider may set or read a cookie only as needed to deliver its contracted service and subject to its data-protection obligations.',
          'Links to third-party websites are governed by those websites’ own cookie and privacy policies.',
        ],
      },
      {
        id: 'your-controls',
        title: 'Your controls',
        paragraphs: [
          'Most browsers let you view, block, or delete cookies and site data. Blocking strictly necessary storage can prevent sign-in, saved preferences, and other TaskFlow features from working correctly.',
          'You can clear TaskFlow site data through your browser settings. Signing out removes active authentication information managed by the application, while browser-level preferences may remain until you clear them.',
        ],
      },
      {
        id: 'changes-and-contact',
        title: 'Changes and contact',
        paragraphs: [
          'We may update this policy when our use of cookies changes. The date above shows the latest revision.',
          'For questions about cookies or privacy, contact TaskFlow through the support channel available in the service or on our website.',
        ],
      },
    ],
  },
};
