import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { TrendingUp, ArrowUpRight, BarChart3, Target, Zap } from "lucide-react";
import { useEffect, useState } from "react";

const HeroDashboard = () => {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const [canHover, setCanHover] = useState(true);

  // Detect if device supports hover (non-touch devices)
  useEffect(() => {
    const mediaQuery = window.matchMedia('(hover: hover) and (pointer: fine)');
    setCanHover(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => setCanHover(e.matches);
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const rotateX = useSpring(useTransform(mouseY, [-300, 300], [8, -8]), { stiffness: 300, damping: 30 });
  const rotateY = useSpring(useTransform(mouseX, [-300, 300], [-8, 8]), { stiffness: 300, damping: 30 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!canHover) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    mouseX.set(e.clientX - centerX);
    mouseY.set(e.clientY - centerY);
  };

  const handleMouseLeave = () => {
    if (!canHover) return;
    mouseX.set(0);
    mouseY.set(0);
  };

  // Traffic data for the graph
  const trafficData = [
    { month: "Jan", value: 25 },
    { month: "Feb", value: 32 },
    { month: "Mar", value: 45 },
    { month: "Apr", value: 52 },
    { month: "May", value: 78 },
    { month: "Jun", value: 95 },
  ];

  const maxValue = Math.max(...trafficData.map(d => d.value));

  return (
    <motion.div
      initial={{ opacity: 0, y: 60, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.8, delay: 1.6, ease: [0.2, 0.65, 0.3, 0.9] }}
      className="w-full max-w-4xl mx-auto px-3 sm:px-4 mt-4 sm:mt-6 md:mt-10 overflow-visible"
      style={{ perspective: canHover ? 1000 : undefined }}
    >
      <motion.div
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={canHover ? { rotateX, rotateY, transformStyle: "preserve-3d" } : undefined}
        className="relative group will-change-transform"
      >
        {/* Animated gradient border */}
        <div className="absolute -inset-[1px] bg-gradient-to-r from-primary via-accent to-primary rounded-xl sm:rounded-2xl opacity-60 blur-sm group-hover:opacity-100 group-hover:blur-none transition-all duration-500 animate-gradient bg-[length:200%_100%]" />
        
        {/* Glow effect on hover */}
        <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 via-accent/20 to-primary/20 rounded-2xl sm:rounded-3xl opacity-0 group-hover:opacity-100 blur-2xl transition-all duration-500 hidden sm:block" />
        
        {/* Main dashboard container */}
        <div className="relative bg-card/80 backdrop-blur-xl rounded-xl sm:rounded-2xl border border-border/50 overflow-hidden shadow-elevated">
          {/* Dashboard header */}
          <div className="flex items-center justify-between px-3 sm:px-4 md:px-6 py-2.5 sm:py-3 md:py-4 border-b border-border/50 bg-muted/30">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="flex gap-1 sm:gap-1.5">
                <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 md:w-3 md:h-3 rounded-full bg-destructive/80" />
                <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 md:w-3 md:h-3 rounded-full bg-yellow-500/80" />
                <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 md:w-3 md:h-3 rounded-full bg-green-500/80" />
              </div>
              <span className="text-[10px] sm:text-xs md:text-sm text-muted-foreground font-medium hidden xs:inline">SEO Dashboard</span>
              <span className="text-[10px] sm:text-xs md:text-sm text-muted-foreground font-medium hidden sm:inline xs:hidden">SEO Performance Dashboard</span>
            </div>
            <div className="flex items-center gap-1 sm:gap-1.5 md:gap-2 text-[9px] sm:text-[10px] md:text-xs text-muted-foreground">
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-green-500"
              />
              <span className="hidden xs:inline">Live</span>
              <span className="hidden sm:inline xs:hidden">Live Data</span>
            </div>
          </div>

          {/* Dashboard content */}
          <div className="p-3 sm:p-4 md:p-6 grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
            {/* Traffic Graph */}
            <div className="sm:col-span-2 bg-background/50 rounded-lg sm:rounded-xl p-2.5 sm:p-3 md:p-4 border border-border/30">
              <div className="flex items-center justify-between mb-2 sm:mb-3 md:mb-4">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <div className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 rounded-md sm:rounded-lg bg-primary/10 flex items-center justify-center">
                    <TrendingUp className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 text-primary" />
                  </div>
                  <div>
                    <h4 className="text-[10px] sm:text-xs md:text-sm font-semibold text-foreground">Organic Traffic</h4>
                    <p className="text-[8px] sm:text-[10px] md:text-xs text-muted-foreground">Last 6 months</p>
                  </div>
                </div>
                <div className="flex items-center gap-0.5 sm:gap-1 text-green-500 text-[10px] sm:text-xs md:text-sm font-medium">
                  <ArrowUpRight className="w-2.5 h-2.5 sm:w-3 sm:h-3 md:w-4 md:h-4" />
                  +287%
                </div>
              </div>

              {/* Graph visualization */}
              <div className="h-20 sm:h-24 md:h-32 flex items-end justify-between gap-1 sm:gap-1.5 md:gap-2">
                {trafficData.map((data, index) => (
                  <motion.div
                    key={data.month}
                    initial={{ height: 0 }}
                    animate={{ height: `${(data.value / maxValue) * 100}%` }}
                    transition={{ duration: 0.8, delay: 1.8 + index * 0.1, ease: "easeOut" }}
                    className="flex-1 flex flex-col items-center gap-0.5 sm:gap-1 min-w-0"
                  >
                    <div 
                      className="w-full rounded-t-sm sm:rounded-t-md bg-gradient-to-t from-primary to-primary/60 relative overflow-hidden"
                      style={{ height: "100%" }}
                    >
                      {/* Shimmer effect - only on non-touch devices */}
                      {canHover && (
                        <motion.div
                          animate={{ x: ["-100%", "200%"] }}
                          transition={{ duration: 2, delay: 2 + index * 0.2, repeat: Infinity, repeatDelay: 3 }}
                          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                        />
                      )}
                    </div>
                    <span className="text-[7px] sm:text-[8px] md:text-[10px] text-muted-foreground truncate">{data.month}</span>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Stats cards */}
            <div className="flex flex-row sm:flex-col gap-2 sm:gap-3 md:gap-4">
              {/* Rankings card */}
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 2.2 }}
                className="flex-1 bg-background/50 rounded-lg sm:rounded-xl p-2.5 sm:p-3 md:p-4 border border-border/30 min-w-0"
              >
                <div className="flex items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
                  <div className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 rounded-md sm:rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
                    <Target className="w-2.5 h-2.5 sm:w-3 sm:h-3 md:w-3.5 md:h-3.5 text-accent" />
                  </div>
                  <span className="text-[9px] sm:text-[10px] md:text-xs text-muted-foreground truncate">Page 1 Keywords</span>
                </div>
                <div className="flex items-end gap-1 sm:gap-1.5 md:gap-2">
                  <motion.span 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 2.4 }}
                    className="text-lg sm:text-xl md:text-2xl font-bold text-foreground"
                  >
                    43
                  </motion.span>
                  <span className="text-[8px] sm:text-[10px] md:text-xs text-green-500 mb-0.5 truncate">+12 this month</span>
                </div>
              </motion.div>

              {/* Domain Authority card */}
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 2.4 }}
                className="flex-1 bg-background/50 rounded-lg sm:rounded-xl p-2.5 sm:p-3 md:p-4 border border-border/30 min-w-0"
              >
                <div className="flex items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
                  <div className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 rounded-md sm:rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <BarChart3 className="w-2.5 h-2.5 sm:w-3 sm:h-3 md:w-3.5 md:h-3.5 text-primary" />
                  </div>
                  <span className="text-[9px] sm:text-[10px] md:text-xs text-muted-foreground truncate">Domain Authority</span>
                </div>
                <div className="flex items-end gap-1 sm:gap-1.5 md:gap-2">
                  <motion.span 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 2.6 }}
                    className="text-lg sm:text-xl md:text-2xl font-bold text-foreground"
                  >
                    58
                  </motion.span>
                  <span className="text-[8px] sm:text-[10px] md:text-xs text-green-500 mb-0.5 truncate">+8 points</span>
                </div>
              </motion.div>
            </div>
          </div>

          {/* Bottom status bar */}
          <div className="px-3 sm:px-4 md:px-6 py-2 sm:py-2.5 md:py-3 border-t border-border/50 bg-muted/20 flex items-center justify-between">
            <div className="flex items-center gap-1.5 sm:gap-2 text-[9px] sm:text-[10px] md:text-xs text-muted-foreground">
              <Zap className="w-2.5 h-2.5 sm:w-3 sm:h-3 md:w-3.5 md:h-3.5 text-primary flex-shrink-0" />
              <span className="hidden sm:inline">AI optimization running...</span>
              <span className="sm:hidden">AI active</span>
            </div>
            <motion.div
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="flex items-center gap-1 sm:gap-1.5 md:gap-2"
            >
              <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-primary" />
              <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-primary/70" />
              <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-primary/40" />
            </motion.div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default HeroDashboard;
