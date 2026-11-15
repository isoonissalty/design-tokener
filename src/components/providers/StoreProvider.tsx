"use client";

import { useEffect, useState } from "react";
import { makeStore } from "@/store/store";
import { hydrateSavedTemplates } from "@/store/features/templatesSlice";
import { Provider } from "react-redux";

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [store] = useState(makeStore);
  useEffect(() => {
    store.dispatch(hydrateSavedTemplates());
  }, [store]);
  return <Provider store={store}>{children}</Provider>;
}
