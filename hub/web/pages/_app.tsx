import { AppType } from "next/dist/shared/lib/utils";

import "./styles.css";

const App: AppType = ({ Component, pageProps }) => {
  return <Component {...pageProps} />;
};

export default App;
