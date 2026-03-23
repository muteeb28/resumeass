declare module '@tabler/icons-react' {
  import * as React from 'react';
  export interface IconProps extends React.SVGProps<SVGSVGElement> {
    size?: number | string;
    stroke?: number | string;
    color?: string;
    className?: string;
  }
  export type Icon = React.FC<IconProps>;
  export const IconLayoutDashboard: Icon;
  export const IconSettings: Icon;
  export const IconUsers: Icon;
  export const IconChartLine: Icon;
  export const IconBriefcase: Icon;
  export const IconHome: Icon;
  export const IconUser: Icon;
  export const IconLogout: Icon;
  export const IconMenu2: Icon;
  export const IconX: Icon;
  export const IconArrowLeft: Icon;
  export const IconArrowRight: Icon;
  export const IconUpload: Icon;
}
