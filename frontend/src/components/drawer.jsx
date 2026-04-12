"use client";

import * as React from "react";
import { Drawer as DrawerPrimitive } from "vaul";

function Drawer(props) {
  return <DrawerPrimitive.Root {...props} />;
}

function DrawerContent({ children, ...props }) {
  return (
   <DrawerPrimitive.Portal>
      <DrawerPrimitive.Overlay className="fixed inset-0 bg-black/50" />
      <DrawerPrimitive.Content 
        {...props} 
        className="fixed bottom-0 bg-white w-full p-4"
      >
        {children}
      </DrawerPrimitive.Content>
    </DrawerPrimitive.Portal>
  );
}

export { Drawer, DrawerContent };