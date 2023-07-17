import { AppType } from "next/dist/shared/lib/utils";
import localFont from "next/font/local";
const isofont = localFont({ src: "./isocpeur.ttf" });
import "./styles.css";

const App: AppType = ({ Component, pageProps }) => {
  return <Component {...pageProps} />;
};

export default App;
