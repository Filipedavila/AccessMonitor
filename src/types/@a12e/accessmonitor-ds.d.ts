declare module '@a12e/accessmonitor-ds' {
  import type { ChangeEvent, MouseEvent, ReactNode } from 'react';

  export interface IconProps {
    name: string;
    'aria-hidden'?: boolean | 'true' | 'false';
  }
  export function Icon(props: IconProps): ReactNode;

  export interface StatTitleObject {
    readonly subtitle: string;
    readonly subtitle2?: string;
  }

  export interface StatisticsData {
    readonly score: number;
    readonly oldestPage: string;
    readonly recentPage: string;
    readonly statsTable: readonly number[];
  }

  export interface StatisticsHeaderProps {
    readonly darkTheme?: string;
    readonly stats: any;
    readonly statsTitles: readonly (string | StatTitleObject)[];
    readonly doubleRow?: boolean;
    readonly title: string;
    readonly subtitle: string;
    readonly oldestPage?: string;
    readonly newestPage?: string;
    readonly gaugeTitle?: string[];
    readonly gaugeDescription?: string;
    readonly gaugeType?: string;
    readonly buttons?: ReactNode;
    readonly showGauge?: boolean;
    readonly tag?: keyof JSX.IntrinsicElements;
  }
  export function StatisticsHeader(props: StatisticsHeaderProps): ReactNode;

  export interface LoadingComponentProps {
    darkTheme?: string;
    loadingText: string;
  }
  export function LoadingComponent(props: LoadingComponentProps): ReactNode;

  export interface TableHeader {
    type: string;
    id?: string;
    name?: string;
    property?: string;
    bigWidth?: string;
    nRow?: number;
    nCol?: number;
    multiCol?: boolean;
    description?: string;
    justifyCenter?: boolean;
    ariaLabel?: boolean;
    headers?: string;
  }

  export interface ColumnOption<TRow = Record<string, unknown>> {
    type: string;
    center: boolean;
    bold: boolean;
    decimalPlace: boolean;
    children?: (row: TRow, data: unknown) => ReactNode;
    headers?: string;
  }

  export interface SortingTableProps<TRow = Record<string, unknown>> {
    project?: string;
    darkTheme?: string;
    hasSort?: boolean;
    headers: TableHeader[] | TableHeader[][];
    setDataList?: (data: TRow[]) => void;
    dataList: TRow[] | undefined;
    caption: string;
    columnsOptions: Record<string, ColumnOption<TRow>>;
    pagination?: boolean;
    links?: boolean;
    ariaLabels?: Record<string, string>;
    iconsAltTexts?: string[];
    itemsPaginationTexts?: string[];
    nItemsPerPageTexts?: string[];
    paginationButtonsTexts?: string[];
  }
  export function SortingTable<TRow = Record<string, unknown>>(
    props: SortingTableProps<TRow>,
  ): ReactNode;

  export type BreadcrumbItem =
    | { children: ReactNode; title?: undefined }
    | {
        title: string;
        children?: undefined;
        href?: string;
        onClick?: () => void;
      };
  export interface BreadcrumbProps {
    data: BreadcrumbItem[];
    darkTheme?: string;
    tagHere?: string;
    onClick?: (
      item: BreadcrumbItem,
      event: MouseEvent<HTMLAnchorElement>,
    ) => void;
  }
  export function Breadcrumb(props: BreadcrumbProps): ReactNode;

  export interface InputProps {
    darkTheme?: string;
    id: string;
    label: string;
    placeholder?: string;
    type?: string;
    error?: string;
    onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
    onKeyDown?: (e: KeyboardEvent<HTMLInputElement>) => void;
  }
  export function Input(props: InputProps): ReactNode;

  export interface TextAreaProps {
    darkTheme?: string;
    id: string;
    label: string;
    placeholder?: string;
    rows?: number;
    value?: string;
    onChange?: (e: ChangeEvent<HTMLTextAreaElement>) => void;
  }
  export function TextArea(props: TextAreaProps): ReactNode;

  export interface TabItem {
    eventKey: string;
    title: string;
    component: ReactNode;
  }
  export interface TabsProps {
    tabs: TabItem[];
    title?: string;
    defaultActiveKey?: string;
    vertical?: boolean;
    onSelect?: (key: string) => void;
    className?: string;
  }
  export function Tabs(props: TabsProps): ReactNode;

  export interface ButtonProps {
    darkTheme?: string;
    text: string;
    size?: string;
    id?: string;
    disabled?: boolean;
    variant?: string;
    type?: string;
    onClick?: () => void;
    iconRight?: ReactNode;
    iconLeft?: ReactNode;
    download?: string;
  }
  export function Button(props: ButtonProps): ReactNode;

  export interface HeaderProps {
    description: ReactNode;
    title?: string;
    title2?: string;
    logo?: ReactNode;
    darkTheme?: string;
    homePage?: boolean;
    language: string;
    changeLanguage: () => void;
    changeTheme: () => void;
    linkTo: string;
    ariaLabel: string;
    obsSpecial?: boolean;
    altLogo?: string;
  }
  export function Header(props: HeaderProps): ReactNode;

  export interface FooterProps {
    darkTheme?: string;
  }
  export function Footer(props: FooterProps): ReactNode;

  export interface GaugeProps {
    darkTheme?: string;
    percentage: number | string;
    title?: string | ReactNode;
    screenReaderTitle?: string;
    type?: string;
  }
  export function Gauge(props: GaugeProps): ReactNode;

  export interface StatsTableProps {
    darkTheme?: string;
    data?: {
      data?: {
        metadata?: {
          count_results?: number;
        };
        infoak?: {
          A?: AccessibilityLevel;
          AA?: AccessibilityLevel;
          AAA?: AccessibilityLevel;
        };
      };
    };
    ok: string;
    warning: string;
    error: string;
    title?: string;
    caption?: string;
    type?: string;
  }

  export interface AccessibilityLevel {
    ok?: number;
    war?: number;
    err?: number;
  }
  export function StatsTable(props: StatsTableProps): ReactNode;

  export interface TableOption {
    id: string;
    iconName: string;
    tdClassName?: string;
    lvl?: string | number;
    ele?: unknown;
  }

  export interface TableComponentProps {
    darkTheme?: string;
    data?: TableOption[] | AccordionOption[];
    onClick: (element: any) => void;
    caption?: string;
    col1?: string;
    col2?: string;
    col3?: string;
    lvlTitle?: string;
    ariaLabel?: string;
    headingLevel?: string;
    imageTitlesCallback: (iconName: string) => string;
    ariaLabels: Record<string, string>;
  }
  export function TableComponent(props: TableComponentProps): ReactNode;
  export interface AccordionOption {
    id: string;
    lvl: Level;
    cs: string[] | null;
    iconName: string;
    tdClassName: string;
    ele?: string;
    title: ReactNode;
    ref_website: string;
    component: ReactNode;
  }

  export interface AccordionProps {
    options: AccordionOption[];
    table?: boolean;
    flush?: boolean;
  }
  export function Accordion(props: AccordionProps): ReactNode;
}
