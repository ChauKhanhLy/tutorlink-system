"use client";

import * as CollapsiblePrimitive from "@radix-ui/react-collapsible";

function Collapsible(props) {
  return <CollapsiblePrimitive.Root {...props} />;
}

function CollapsibleTrigger(props) {
  return <CollapsiblePrimitive.Trigger {...props} />;
}

function CollapsibleContent(props) {
  return <CollapsiblePrimitive.Content {...props} />;
}

export { Collapsible, CollapsibleTrigger, CollapsibleContent };