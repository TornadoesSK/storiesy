import { type AppType } from "next/app";
import Head from "next/head";
import { api } from "../utils/api";
import "../styles/globals.css";
import Link from "next/link";
import { appStateContext, useApp } from "../components/useAppState";

const MyApp: AppType = ({ Component, pageProps }) => {
	const appState = useApp();

	return (
		<>
			<main>
				<div className="navbar bg-base-100">
					<div className="navbar-start">
						<div className="dropdown">
							<label tabIndex={0} className="btn-ghost btn-circle btn">
								<MenuIcon />
							</label>
							<ul
								tabIndex={0}
								className="dropdown-content menu rounded-box menu-compact mt-3 w-52 bg-base-100 p-2 shadow"
							>
								<li>
									<Link href="/">Expenses</Link>
								</li>
								<li>
									<Link href="/categories">Categories</Link>
								</li>
							</ul>
						</div>
					</div>
					<div className="navbar-center">
						<div className="text-xl font-medium normal-case">Moneyger</div>
					</div>
					<div className="navbar-end">
						<button className="btn-ghost btn-circle btn">
							<SearchIcon />
						</button>
					</div>
				</div>
				<Head>
					<title>Moneyger</title>
					<meta name="description" content="Expense tracker" />
					<link rel="icon" href="/favicon.ico" />
				</Head>
				<appStateContext.Provider value={appState}>
					<Component {...pageProps} />
				</appStateContext.Provider>
			</main>
		</>
	);
};

const MenuIcon = () => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		className="h-5 w-5"
		fill="none"
		viewBox="0 0 24 24"
		stroke="currentColor"
	>
		<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h7" />
	</svg>
);

const SearchIcon = () => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		className="h-5 w-5"
		fill="none"
		viewBox="0 0 24 24"
		stroke="currentColor"
	>
		<path
			strokeLinecap="round"
			strokeLinejoin="round"
			strokeWidth="2"
			d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
		/>
	</svg>
);

export default api.withTRPC(MyApp);
