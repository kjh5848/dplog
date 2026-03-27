import * as React from "react"

interface TabsProps extends React.HTMLAttributes<HTMLDivElement> {
  defaultValue?: string;
}

const Tabs = React.forwardRef<HTMLDivElement, TabsProps>(
  ({ className, defaultValue, ...props }, ref) => {
    const [value, setValue] = React.useState<string | undefined>(defaultValue);
    
    return (
      <TabsContext.Provider value={{ defaultValue: value, onValueChange: setValue }}>
        <div
          ref={ref}
          className={`w-full ${className || ""}`}
          {...props}
        />
      </TabsContext.Provider>
    )
  }
)
Tabs.displayName = "Tabs"

interface TabsListProps extends React.HTMLAttributes<HTMLDivElement> {}

const TabsList = React.forwardRef<HTMLDivElement, TabsListProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={`inline-flex items-center justify-center rounded-md bg-gray-100 p-1 ${className || ""}`}
      {...props}
    />
  )
)
TabsList.displayName = "TabsList"

interface TabsTriggerProps extends React.HTMLAttributes<HTMLButtonElement> {
  value: string
}

const TabsTrigger = React.forwardRef<HTMLButtonElement, TabsTriggerProps>(
  ({ className, value, ...props }, ref) => {
    const [activeTab, setActiveTab] = React.useState<string | null>(null)
    const parent = React.useContext(TabsContext)

    React.useEffect(() => {
      if (parent?.defaultValue === value) {
        setActiveTab(value)
      }
    }, [parent?.defaultValue, value])

    const isActive = activeTab === value

    const handleClick = () => {
      setActiveTab(value)
      if (parent?.onValueChange) {
        parent.onValueChange(value)
      }
    }

    return (
      <button
        ref={ref}
        className={`px-3 py-1.5 text-sm font-medium transition-all ${
          isActive
            ? "bg-white text-gray-900 shadow-sm"
            : "text-gray-600 hover:text-gray-900"
        } ${className || ""}`}
        onClick={handleClick}
        type="button"
        {...props}
      />
    )
  }
)
TabsTrigger.displayName = "TabsTrigger"

interface TabsContentProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string
}

const TabsContent = React.forwardRef<HTMLDivElement, TabsContentProps>(
  ({ className, value, ...props }, ref) => {
    const [activeTab, setActiveTab] = React.useState<string | null>(null)
    const parent = React.useContext(TabsContext)

    React.useEffect(() => {
      if (parent?.defaultValue) {
        setActiveTab(parent.defaultValue)
      }
    }, [parent?.defaultValue])

    const isActive = activeTab === value

    if (!isActive) return null

    return (
      <div
        ref={ref}
        className={`mt-2 ${className || ""}`}
        {...props}
      />
    )
  }
)
TabsContent.displayName = "TabsContent"

interface TabsContextValue {
  defaultValue?: string
  onValueChange?: (value: string) => void
}

const TabsContext = React.createContext<TabsContextValue | null>(null)

export { Tabs, TabsList, TabsTrigger, TabsContent } 