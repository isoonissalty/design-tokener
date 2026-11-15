"use client";

import { useState } from "react";
import { makeStore } from "@/store/store";
import { Provider } from "react-redux";

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [store] = useState(makeStore);
  return <Provider store={store}>{children}</Provider>;
}
