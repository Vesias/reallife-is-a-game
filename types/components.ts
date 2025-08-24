import type { ReactNode, ComponentProps, HTMLAttributes } from 'react'
import type { LucideIcon } from 'lucide-react'

// Base component types
export interface BaseComponentProps {
  className?: string
  children?: ReactNode
  id?: string
}

// Button component types
export interface ButtonProps extends BaseComponentProps {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  disabled?: boolean
  loading?: boolean
  onClick?: () => void
  type?: 'button' | 'submit' | 'reset'
}

// Input component types
export interface InputProps extends BaseComponentProps {
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search'
  placeholder?: string
  value?: string
  defaultValue?: string
  disabled?: boolean
  required?: boolean
  readOnly?: boolean
  onChange?: (value: string) => void
  onBlur?: () => void
  onFocus?: () => void
  error?: string
  label?: string
  helperText?: string
}

// Card component types
export interface CardProps extends BaseComponentProps {
  variant?: 'default' | 'outline' | 'ghost'
  padding?: 'none' | 'sm' | 'md' | 'lg'
  shadow?: 'none' | 'sm' | 'md' | 'lg'
}

export interface CardHeaderProps extends BaseComponentProps {
  title?: string
  subtitle?: string
  action?: ReactNode
}

export interface CardContentProps extends BaseComponentProps {}

export interface CardFooterProps extends BaseComponentProps {
  justify?: 'start' | 'center' | 'end' | 'between'
}

// Dialog/Modal component types
export interface DialogProps extends BaseComponentProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  title?: string
  description?: string
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
}

export interface DialogHeaderProps extends BaseComponentProps {
  title: string
  description?: string
  closable?: boolean
  onClose?: () => void
}

export interface DialogContentProps extends BaseComponentProps {
  padding?: 'none' | 'sm' | 'md' | 'lg'
}

export interface DialogFooterProps extends BaseComponentProps {
  justify?: 'start' | 'center' | 'end' | 'between'
}

// Avatar component types
export interface AvatarProps extends BaseComponentProps {
  src?: string
  alt?: string
  fallback?: string
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  shape?: 'circle' | 'square'
}

// Badge component types
export interface BadgeProps extends BaseComponentProps {
  variant?: 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning'
  size?: 'sm' | 'md' | 'lg'
}

// Progress component types
export interface ProgressProps extends BaseComponentProps {
  value: number
  max?: number
  size?: 'sm' | 'md' | 'lg'
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error'
  showLabel?: boolean
  label?: string
}

// Tabs component types
export interface TabsProps extends BaseComponentProps {
  defaultValue?: string
  value?: string
  onValueChange?: (value: string) => void
  orientation?: 'horizontal' | 'vertical'
}

export interface TabsListProps extends BaseComponentProps {
  variant?: 'default' | 'pills' | 'underline'
}

export interface TabsTriggerProps extends BaseComponentProps {
  value: string
  disabled?: boolean
  icon?: LucideIcon
}

export interface TabsContentProps extends BaseComponentProps {
  value: string
  forceMount?: boolean
}

// Select component types
export interface SelectOption {
  value: string
  label: string
  disabled?: boolean
  icon?: LucideIcon
}

export interface SelectProps extends BaseComponentProps {
  options: SelectOption[]
  value?: string
  defaultValue?: string
  placeholder?: string
  disabled?: boolean
  required?: boolean
  searchable?: boolean
  clearable?: boolean
  multiple?: boolean
  onValueChange?: (value: string | string[]) => void
  error?: string
  label?: string
  helperText?: string
}

// Checkbox component types
export interface CheckboxProps extends BaseComponentProps {
  checked?: boolean
  defaultChecked?: boolean
  disabled?: boolean
  required?: boolean
  onCheckedChange?: (checked: boolean) => void
  label?: string
  error?: string
}

// Switch component types
export interface SwitchProps extends BaseComponentProps {
  checked?: boolean
  defaultChecked?: boolean
  disabled?: boolean
  required?: boolean
  onCheckedChange?: (checked: boolean) => void
  label?: string
  description?: string
}

// Toast component types
export type ToastVariant = 'default' | 'destructive' | 'success' | 'warning'

export interface ToastProps {
  title?: string
  description?: string
  variant?: ToastVariant
  duration?: number
  action?: {
    label: string
    onClick: () => void
  }
}

export interface ToastOptions extends ToastProps {
  id?: string
}

// Table component types
export interface TableColumn<T = any> {
  key: string
  header: string
  accessorKey?: keyof T
  cell?: (row: T) => ReactNode
  sortable?: boolean
  width?: string | number
  align?: 'left' | 'center' | 'right'
}

export interface TableProps<T = any> extends BaseComponentProps {
  data: T[]
  columns: TableColumn<T>[]
  loading?: boolean
  emptyMessage?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  onSort?: (key: string, order: 'asc' | 'desc') => void
  onRowClick?: (row: T, index: number) => void
  pagination?: {
    page: number
    pageSize: number
    total: number
    onPageChange: (page: number) => void
    onPageSizeChange: (pageSize: number) => void
  }
}

// Dropdown Menu component types
export interface DropdownMenuItem {
  id: string
  label: string
  icon?: LucideIcon
  disabled?: boolean
  destructive?: boolean
  onClick?: () => void
  href?: string
  separator?: boolean
}

export interface DropdownMenuProps extends BaseComponentProps {
  trigger: ReactNode
  items: DropdownMenuItem[]
  align?: 'start' | 'center' | 'end'
  side?: 'top' | 'right' | 'bottom' | 'left'
  sideOffset?: number
}

// Popover component types
export interface PopoverProps extends BaseComponentProps {
  trigger: ReactNode
  content: ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
  align?: 'start' | 'center' | 'end'
  side?: 'top' | 'right' | 'bottom' | 'left'
  sideOffset?: number
}

// Tooltip component types
export interface TooltipProps extends BaseComponentProps {
  content: ReactNode
  delay?: number
  side?: 'top' | 'right' | 'bottom' | 'left'
  align?: 'start' | 'center' | 'end'
}

// Form component types
export interface FormFieldProps extends BaseComponentProps {
  name: string
  label?: string
  description?: string
  required?: boolean
  error?: string
}

export interface FormProps extends BaseComponentProps {
  onSubmit?: (data: any) => void | Promise<void>
  loading?: boolean
  disabled?: boolean
}

// Layout component types
export interface LayoutProps extends BaseComponentProps {
  header?: ReactNode
  sidebar?: ReactNode
  footer?: ReactNode
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full'
}

export interface SidebarProps extends BaseComponentProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  variant?: 'default' | 'floating' | 'overlay'
  side?: 'left' | 'right'
  width?: string | number
}

export interface HeaderProps extends BaseComponentProps {
  title?: string
  subtitle?: string
  breadcrumbs?: BreadcrumbItem[]
  actions?: ReactNode
}

export interface BreadcrumbItem {
  label: string
  href?: string
  active?: boolean
}

// Navigation component types
export interface NavItem {
  id: string
  label: string
  href?: string
  icon?: LucideIcon
  active?: boolean
  disabled?: boolean
  badge?: string | number
  children?: NavItem[]
}

export interface NavigationProps extends BaseComponentProps {
  items: NavItem[]
  orientation?: 'horizontal' | 'vertical'
  variant?: 'default' | 'pills' | 'underline'
  onItemClick?: (item: NavItem) => void
}

// Data Display component types
export interface StatsCardProps extends BaseComponentProps {
  title: string
  value: string | number
  subtitle?: string
  icon?: LucideIcon
  trend?: {
    value: number
    isPositive: boolean
    period?: string
  }
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error'
}

export interface ChartProps extends BaseComponentProps {
  data: any[]
  type?: 'line' | 'bar' | 'area' | 'pie' | 'donut'
  xAxisKey?: string
  yAxisKey?: string
  height?: number
  loading?: boolean
  colors?: string[]
}

// Error Boundary types
export interface ErrorBoundaryProps extends BaseComponentProps {
  fallback?: ReactNode | ((error: Error) => ReactNode)
  onError?: (error: Error, errorInfo: any) => void
}

export interface ErrorFallbackProps {
  error: Error
  resetError: () => void
}

// Loading component types
export interface LoadingProps extends BaseComponentProps {
  size?: 'sm' | 'md' | 'lg'
  variant?: 'spinner' | 'dots' | 'pulse'
  text?: string
}

export interface SkeletonProps extends BaseComponentProps {
  variant?: 'text' | 'circular' | 'rectangular'
  width?: string | number
  height?: string | number
  animation?: 'pulse' | 'wave' | 'none'
}

// Theme types
export type ThemeMode = 'light' | 'dark' | 'system'

export interface ThemeContextValue {
  mode: ThemeMode
  setMode: (mode: ThemeMode) => void
  resolvedTheme: 'light' | 'dark'
}

// Responsive types
export type Breakpoint = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'

export interface ResponsiveValue<T> {
  xs?: T
  sm?: T
  md?: T
  lg?: T
  xl?: T
  '2xl'?: T
}

// Animation types
export type AnimationPreset = 'fade' | 'slide' | 'scale' | 'bounce' | 'spin'

export interface AnimationProps {
  animation?: AnimationPreset
  duration?: number
  delay?: number
  repeat?: boolean | number
}

// Event handler types
export type EventHandler<T = Event> = (event: T) => void
export type AsyncEventHandler<T = Event> = (event: T) => Promise<void>

// Utility types for component variants
export type Size = 'xs' | 'sm' | 'md' | 'lg' | 'xl'
export type Variant = 'default' | 'primary' | 'secondary' | 'destructive' | 'outline' | 'ghost'
export type Color = 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info'
export type Alignment = 'start' | 'center' | 'end'
export type Orientation = 'horizontal' | 'vertical'
export type Position = 'top' | 'right' | 'bottom' | 'left'

// Component state types
export interface ComponentState {
  loading?: boolean
  error?: string | Error | null
  data?: any
  initialized?: boolean
}

export interface AsyncComponentState<T = any> extends ComponentState {
  data?: T
  isValidating?: boolean
  lastUpdated?: Date
}

// Hook return types
export interface UseAsyncResult<T> extends AsyncComponentState<T> {
  execute: (...args: any[]) => Promise<T>
  reset: () => void
}

export interface UseFormResult<T = any> {
  values: T
  errors: Record<string, string>
  touched: Record<string, boolean>
  isValid: boolean
  isSubmitting: boolean
  setValue: (field: string, value: any) => void
  setError: (field: string, error: string) => void
  clearError: (field: string) => void
  reset: () => void
  submit: () => Promise<void>
}

// Component composition types
export interface ComponentWithSlots extends BaseComponentProps {
  slots?: Record<string, ReactNode>
}

export interface RenderPropComponent<T> {
  className?: string
  id?: string
  children: (props: T) => ReactNode
}

// Type guards for component props
export function hasChildren(props: any): props is { children: ReactNode } {
  return 'children' in props && props.children !== undefined
}

export function hasClassName(props: any): props is { className: string } {
  return 'className' in props && typeof props.className === 'string'
}

export function isClickable(props: any): props is { onClick: () => void } {
  return 'onClick' in props && typeof props.onClick === 'function'
}