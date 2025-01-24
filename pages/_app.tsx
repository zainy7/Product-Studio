import "@fontsource/inter/index.css";
import "../styles/globals.css";
import { AuthProvider } from "@/contexts/AuthContext"
import { ProjectProvider } from "@/contexts/ProjectContext"
import type { AppProps } from 'next/app'

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <AuthProvider>
      <ProjectProvider>
        <Component {...pageProps} />
      </ProjectProvider>
    </AuthProvider>
  );
}

export default MyApp;
