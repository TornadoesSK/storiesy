import { type AppType } from "next/app";
import Head from "next/head";
import { api } from "../utils/api";
import "../styles/globals.css";
import { appStateContext, useApp } from "../components/useAppState";
import { useRouter } from "next/router";
import { useCallback } from "react";
import DrawerSide from "../components/nav/DrawerSide";
import { hexToHSL } from "../utils/hexToHsl";

const sidebarId = "sidebar-menu";

const MyApp: AppType = ({ Component, pageProps }) => {
	const appState = useApp();
	const router = useRouter();
	const handleSignOutClick = useCallback(async () => {
		await appState.supabaseClient.auth.signOut();
		router.reload();
	}, [router, appState.supabaseClient.auth]);

	const organization = api.organization.get.useQuery();
	organization?.data?.color &&
		document.documentElement.style.setProperty("--p", hexToHSL(organization?.data?.color));

	return (
		<>
			<main>
				<Head>
					<title>Storiesy</title>
					<meta name="description" content="Comics creation using AI" />
					<link rel="icon" href="/favicon.ico" />
				</Head>
				<appStateContext.Provider value={appState}>
					<div className="drawer-mobile drawer">
						<input id={sidebarId} type="checkbox" className="drawer-toggle" />
						<div className="drawer-content bg-white">
							{/* <label htmlFor={sidebarId} className="btn-primary drawer-button btn lg:hidden">
							Open drawer
						</label> */}
							<Component {...pageProps} />
						</div>
						<DrawerSide sidebarId={sidebarId} handleSignOutClick={handleSignOutClick} />
					</div>
				</appStateContext.Provider>
			</main>
		</>
	);
};

export default api.withTRPC(MyApp);
