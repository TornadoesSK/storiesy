import { type AppType } from "next/app";
import Head from "next/head";
import { api } from "../utils/api";
import "../styles/globals.css";
import { appStateContext, useApp } from "../components/useAppState";
import { useRouter } from "next/router";
import { useCallback } from "react";
import DrawerSide from "../components/nav/DrawerSide";

const sidebarId = "sidebar-menu";

const MyApp: AppType = ({ Component, pageProps }) => {
	const appState = useApp();
	const router = useRouter();
	const handleSignOutClick = useCallback(async () => {
		await appState.supabaseClient.auth.signOut();
		router.reload();
	}, [router, appState.supabaseClient.auth]);

	return (
		<>
			<main>
				<Head>
					<title>Storiesy</title>
					<meta name="description" content="Comics creation using AI" />
					<link rel="icon" href="/favicon.ico" />
				</Head>
				<div className="drawer-mobile drawer">
					<input id={sidebarId} type="checkbox" className="drawer-toggle" />
					<div className="drawer-content bg-white">
						{/* <label htmlFor={sidebarId} className="btn-primary drawer-button btn lg:hidden">
							Open drawer
						</label> */}
						<appStateContext.Provider value={appState}>
							<Component {...pageProps} />
						</appStateContext.Provider>
					</div>
					<DrawerSide sidebarId={sidebarId} handleSignOutClick={handleSignOutClick} />
				</div>
			</main>
		</>
	);
};

const MenuIcon = () => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		className="h-16 w-16"
		fill="none"
		viewBox="0 0 24 24"
		stroke="currentColor"
	>
		<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h7" />
	</svg>
);

export default api.withTRPC(MyApp);
