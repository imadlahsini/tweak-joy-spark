import { Download, Loader2, RefreshCcw, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

interface QuickActionsProps {
  onRefresh: () => void;
  isRefreshing: boolean;
  onCommandOpen: () => void;
}

const QuickActions = ({ onRefresh, isRefreshing, onCommandOpen }: QuickActionsProps) => (
  <div className="flex flex-col gap-3 h-full">
    <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
      Actions
    </p>

    <div className="flex flex-1 flex-col gap-2">
      <Button
        variant="outline"
        onClick={onRefresh}
        disabled={isRefreshing}
        className="admin-control h-10 w-full justify-start gap-2.5 rounded-xl text-foreground hover:bg-background/70"
      >
        {isRefreshing ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <RefreshCcw className="h-4 w-4" />
        )}
        <span className="text-sm">Refresh</span>
      </Button>

      <Button
        variant="outline"
        onClick={onCommandOpen}
        className="admin-control h-10 w-full justify-start gap-2.5 rounded-xl text-foreground hover:bg-background/70"
      >
        <Search className="h-4 w-4" />
        <span className="text-sm">Search</span>
        <kbd className="ml-auto inline-flex items-center rounded border border-border/60 bg-background/55 px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground">
          ⌘K
        </kbd>
      </Button>

      <Button
        variant="outline"
        disabled
        className="admin-control h-10 w-full justify-start gap-2.5 rounded-xl text-foreground opacity-50"
        title="Coming soon"
      >
        <Download className="h-4 w-4" />
        <span className="text-sm">Export</span>
      </Button>
    </div>
  </div>
);

export default QuickActions;
