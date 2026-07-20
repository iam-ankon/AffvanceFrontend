import {
  Activity,
  BarChart2,
  CreditCard,
  DollarSign,
  FileText,
  FlaskConical,
  LayoutDashboard,
  Settings,
  Users,
  Wallet
} from 'lucide-react';

export const sidebarData = {
  user: { name: 'satnaing', email: 'satnaingdev@gmail.com', avatar: '/avatars/shadcn.jpg' },

  navGroups: [
    {
      title: 'Main Menu',
      items: [
        { title: 'Dashboard', url: '/app', icon: LayoutDashboard },
        { title: 'Analytics', url: '/app/analytics', icon: BarChart2 },
        { title: 'Monetisation', url: '/app/monetisation', icon: DollarSign },
        {
          title: 'Blogs',
          icon: FileText,
          items: [
            { title: 'Create Blog', url: '/app/blogs/new' },
            { title: 'Blog List', url: '/app/blogs' },
            { title: 'Requested Blogs', url: '/app/blogs/requested' }
          ]
        },
        {
          title: 'Keyword Lab',
          icon: FlaskConical,
          items: [
            { title: 'Generate Keywords', url: '/app/keyword-lab' },
            { title: 'My Keywords', url: '/app/keyword-history' }
          ]
        },
        {
          title: 'Subscription',
          icon: Wallet,
          items: [
            { title: 'Overview', url: '/app/subscription' },
            { title: 'Plans', url: '/app/subscription/plans' }
          ]
        },
        { title: 'Team', url: '/app/team', icon: Users },
      ],
      requiredPermissions: ['manage:user']
    },
    {
      title: 'Agency',

      items: [
        { title: 'Dashboard', url: '/app/agency/dashboard', icon: Activity },
        { title: 'Members', url: '/app/agency/members', icon: Users },
        { title: 'Content', url: '/app/agency/content', icon: FileText },
        { title: 'Credits & Usage', url: '/app/agency/credits', icon: CreditCard },
        { title: 'Billing', url: '/app/agency/billing', icon: Wallet },
        { title: 'Analytics', url: '/app/agency/analytics', icon: BarChart2 }
      ],

      requiredPermissions: ['manage:agency']
    },
    {
      title: 'Settings',

      items: [
        {
          title: 'Publishing',
          icon: Settings,
          items: [{
            title: 'Publishing Accounts', url: '/app/settings/publishing-accounts',

          }]
        }
      ],

      requiredPermissions: ['manage:user']
    }
  ]
};
