'use client';

import { createContext, useContext, useState } from 'react';

const WatchSettingContext = createContext()

export function WatchSettingContextProvider({ children }) {
  const [watchSetting, setWatchSetting] = useState({
    isExpanded: false,
    light: false,
    autoPlay: false,
    autoNext: false,
    autoSkipIntro: false
  });

 return (
    <WatchSettingContext.Provider value={{ watchSetting, setWatchSetting }}>
      <div
        className="flex flex-col-reverse md:flex-row gap-3 max-h-[52rem]"
        style={{ flexDirection: watchSetting.isExpanded && "column-reverse" }}
      >
        {children}
      </div>
    </WatchSettingContext.Provider >
  )
}

export const useWatchSettingContext = () => useContext(WatchSettingContext)
