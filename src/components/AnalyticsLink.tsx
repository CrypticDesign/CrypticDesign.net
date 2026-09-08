"use client";

import Link from "next/link";
import type { ComponentProps, MouseEvent } from "react";
import { trackAnalyticsEvent } from "@/lib/analytics-client";
import type { AnalyticsEvent } from "@/lib/analytics";

type AnalyticsLinkProps = ComponentProps<typeof Link> & { analyticsEvent: AnalyticsEvent };

export function AnalyticsLink({ analyticsEvent, onClick, ...props }: AnalyticsLinkProps) {
  return <Link {...props} onClick={(event) => {
    onClick?.(event);
    if (!event.defaultPrevented) trackAnalyticsEvent(analyticsEvent.name, analyticsEvent.payload as never);
  }} />;
}

type AnalyticsAnchorProps = ComponentProps<"a"> & { analyticsEvent: AnalyticsEvent };

export function AnalyticsAnchor({ analyticsEvent, onClick, ...props }: AnalyticsAnchorProps) {
  return <a {...props} onClick={(event: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(event);
    if (!event.defaultPrevented) trackAnalyticsEvent(analyticsEvent.name, analyticsEvent.payload as never);
  }} />;
}

