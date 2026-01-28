import * as React from "react";
import {
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";


import { cn } from "../utils";

/* -------------------- THEMES -------------------- */

const THEMES = { light: "", dark: ".dark" } as const;

export type ChartConfig = {
  [key: string]: {
    label?: React.ReactNode;
    icon?: React.ComponentType;
  } & (
    | { color?: string; theme?: never }
    | { color?: never; theme: Record<keyof typeof THEMES, string> }
  );
};

/* -------------------- CONTEXT -------------------- */

type ChartContextProps = {
  config: ChartConfig;
};

const ChartContext = React.createContext<ChartContextProps | null>(null);

function useChart() {
  const context = React.useContext(ChartContext);
  if (!context) {
    throw new Error("useChart must be used within a <ChartContainer />");
  }
  return context;
}

/* -------------------- CONTAINER -------------------- */

interface ChartContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  config: ChartConfig;
  children: React.ReactNode;
}

const ChartContainer = React.forwardRef<HTMLDivElement, ChartContainerProps>(
  ({ id, className, children, config, ...props }, ref) => {
    const uniqueId = React.useId();
    const chartId = `chart-${id || uniqueId.replace(/:/g, "")}`;

    return (
      <ChartContext.Provider value={{ config }}>
        <div
          ref={ref}
          data-chart={chartId}
          className={cn(
            "flex aspect-video justify-center text-xs",
            className
          )}
          {...props}
        >
          <ChartStyle id={chartId} config={config} />
          <ResponsiveContainer>{children}</ResponsiveContainer>
        </div>
      </ChartContext.Provider>
    );
  }
);
ChartContainer.displayName = "Chart";

/* -------------------- STYLE -------------------- */

const ChartStyle = ({ id, config }: { id: string; config: ChartConfig }) => {
  const colorConfig = Object.entries(config).filter(
    ([_, v]) => v.color || v.theme
  );

  if (!colorConfig.length) return null;

  return (
    <style
      dangerouslySetInnerHTML={{
        __html: Object.entries(THEMES)
          .map(
            ([theme, prefix]) => `
${prefix} [data-chart="${id}"] {
${colorConfig
                .map(([key, cfg]) => {
                  const color = cfg.theme?.[theme as keyof typeof THEMES] || cfg.color;
                  return color ? `--color-${key}: ${color};` : "";
                })
                .join("\n")}
}
`
          )
          .join("\n"),
      }}
    />
  );
};

/* -------------------- TOOLTIP -------------------- */

const ChartTooltip = Tooltip;

const ChartTooltipContent = React.forwardRef<
  HTMLDivElement,
  any
>(({ active, payload, className }: any, ref) => {
  const { config } = useChart();

  if (!active || !payload?.length) return null;

  return (
    <div
      ref={ref}
      className={cn(
        "rounded-lg border bg-background px-3 py-2 text-xs shadow",
        className
      )}
    >
      {payload.map((item: any) => {
        const key = String(item.dataKey);
        const cfg = config[key];

        return (
          <div key={key} className="flex justify-between gap-4">
            <span>{cfg?.label || item.name}</span>
            <span className="font-mono">
              {item.value?.toLocaleString()}
            </span>
          </div>
        );
      })}
    </div>
  );
});
ChartTooltipContent.displayName = "ChartTooltip";

/* -------------------- LEGEND -------------------- */

const ChartLegend = Legend;

const ChartLegendContent = React.forwardRef<
  HTMLDivElement,
  any
>(({ payload, className }: any, ref) => {
  const { config } = useChart();

  if (!payload?.length) return null;

  return (
    <div
      ref={ref}
      className={cn("flex flex-wrap justify-center gap-4", className)}
    >
      {payload.map((item: any) => {
        const key = String(item.dataKey);
        const cfg = config[key];

        return (
          <div key={key} className="flex items-center gap-2">
            <span
              className="h-2 w-2 rounded"
              style={{ backgroundColor: item.color }}
            />
            {cfg?.label}
          </div>
        );
      })}
    </div>
  );
});
ChartLegendContent.displayName = "ChartLegend";

/* -------------------- EXPORTS -------------------- */

export {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  ChartStyle,
};
