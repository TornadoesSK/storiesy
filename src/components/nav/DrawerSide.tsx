import Link from "next/link";
import { useEffect, useState } from "react";
import { api } from "../../utils/api";
import { useAppState } from "../useAppState";

type DrawerSideProps = {
	sidebarId: string;
	handleSignOutClick: () => Promise<void>,
}

export default function DrawerSide({
	sidebarId,
	handleSignOutClick,
}: DrawerSideProps) {
	const closeDrawer = () => {
		document.getElementById(sidebarId)?.click();
	};
	const organization = api.organization.get.useQuery();
	const appState = useAppState();
	const [signedIn, setSignedIn] = useState(false);
	useEffect(() => {
		(async () => {
			setSignedIn((await appState.supabaseClient.auth.getUser()).data.user !== null);
		})();
	});

	return (
		<div className="drawer-side min-w-[160px]">
			<label htmlFor={sidebarId} className="drawer-overlay"></label>
			<ul className="menu items-center justify-between bg-primary p-4 text-base-content">
				<li>
					<Link className="flex-col items-center text-white w-28" href="/" onClick={closeDrawer}>
						<img className="w-full" src="/media/logo_c.svg" alt="logo small" />
					</Link>
				</li>
				{organization.data && (
					<li>
						<Link href="/" className="flex-col items-center text-white" onClick={closeDrawer}>
							<ChatIcon />
							Generate
						</Link>
					</li>
				)}
				<li>
					{signedIn && (
						<Link className="flex-col items-center text-white" href="/organization" onClick={closeDrawer}>
							<OrgIcon />
							Organization
						</Link>
					)}
					{signedIn ? (
						<span
							className="flex-col items-center text-white"
							onClick={() => {
								handleSignOutClick();
								closeDrawer();
							}}
						>
							<SignOutIcon />
							Sign out
						</span>
					) : (
						<Link className="flex-col items-center text-white" href="/auth/sign-in" onClick={closeDrawer}>
							<SignInIcon />
							Sign in
						</Link>
					)}
				</li>
			</ul>
		</div>
	);
}

const ChatIcon = () => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		className="h-12 w-12"
		fill="currentColor"
		viewBox="0 0 640 512"
	>
		<path d="M88.2 309.1c9.8-18.3 6.8-40.8-7.5-55.8C59.4 230.9 48 204 48 176c0-63.5 63.8-128 160-128s160 64.5 160 128s-63.8 128-160 128c-13.1 0-25.8-1.3-37.8-3.6c-10.4-2-21.2-.6-30.7 4.2c-4.1 2.1-8.3 4.1-12.6 6c-16 7.2-32.9 13.5-49.9 18c2.8-4.6 5.4-9.1 7.9-13.6c1.1-1.9 2.2-3.9 3.2-5.9zM0 176c0 41.8 17.2 80.1 45.9 110.3c-.9 1.7-1.9 3.5-2.8 5.1c-10.3 18.4-22.3 36.5-36.6 52.1c-6.6 7-8.3 17.2-4.6 25.9C5.8 378.3 14.4 384 24 384c43 0 86.5-13.3 122.7-29.7c4.8-2.2 9.6-4.5 14.2-6.8c15.1 3 30.9 4.5 47.1 4.5c114.9 0 208-78.8 208-176S322.9 0 208 0S0 78.8 0 176zM432 480c16.2 0 31.9-1.6 47.1-4.5c4.6 2.3 9.4 4.6 14.2 6.8C529.5 498.7 573 512 616 512c9.6 0 18.2-5.7 22-14.5c3.8-8.8 2-19-4.6-25.9c-14.2-15.6-26.2-33.7-36.6-52.1c-.9-1.7-1.9-3.4-2.8-5.1C622.8 384.1 640 345.8 640 304c0-94.4-87.9-171.5-198.2-175.8c4.1 15.2 6.2 31.2 6.2 47.8l0 .6c87.2 6.7 144 67.5 144 127.4c0 28-11.4 54.9-32.7 77.2c-14.3 15-17.3 37.6-7.5 55.8c1.1 2 2.2 4 3.2 5.9c2.5 4.5 5.2 9 7.9 13.6c-17-4.5-33.9-10.7-49.9-18c-4.3-1.9-8.5-3.9-12.6-6c-9.5-4.8-20.3-6.2-30.7-4.2c-12.1 2.4-24.7 3.6-37.8 3.6c-61.7 0-110-26.5-136.8-62.3c-16 5.4-32.8 9.4-50 11.8C279 439.8 350 480 432 480z" />
	</svg>
);

const SignOutIcon = () => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		className="h-8 w-8"
		fill="currentColor"
		viewBox="0 0 512 512"
	>
		<path d="M502.6 278.6c12.5-12.5 12.5-32.8 0-45.3l-128-128c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L402.7 224 192 224c-17.7 0-32 14.3-32 32s14.3 32 32 32l210.7 0-73.4 73.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0l128-128zM160 96c17.7 0 32-14.3 32-32s-14.3-32-32-32L96 32C43 32 0 75 0 128L0 384c0 53 43 96 96 96l64 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l-64 0c-17.7 0-32-14.3-32-32l0-256c0-17.7 14.3-32 32-32l64 0z" />
	</svg>
);

const SignInIcon = () => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		className="h-8 w-8"
		fill="currentColor"
		viewBox="0 0 512 512"
	>
		<path d="M352 96l64 0c17.7 0 32 14.3 32 32l0 256c0 17.7-14.3 32-32 32l-64 0c-17.7 0-32 14.3-32 32s14.3 32 32 32l64 0c53 0 96-43 96-96l0-256c0-53-43-96-96-96l-64 0c-17.7 0-32 14.3-32 32s14.3 32 32 32zm-9.4 182.6c12.5-12.5 12.5-32.8 0-45.3l-128-128c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L242.7 224 32 224c-17.7 0-32 14.3-32 32s14.3 32 32 32l210.7 0-73.4 73.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0l128-128z" />
	</svg>
);

const OrgIcon = () => (
	<svg
		xmlns="http://www.w3.org/2000/svg"
		viewBox="0 0 384 512"
		className="h-8 w-8"
		fill="currentColor"
	>
		<path d="M64 48c-8.8 0-16 7.2-16 16V448c0 8.8 7.2 16 16 16h80V400c0-26.5 21.5-48 48-48s48 21.5 48 48v64h80c8.8 0 16-7.2 16-16V64c0-8.8-7.2-16-16-16H64zM0 64C0 28.7 28.7 0 64 0H320c35.3 0 64 28.7 64 64V448c0 35.3-28.7 64-64 64H64c-35.3 0-64-28.7-64-64V64zm88 40c0-8.8 7.2-16 16-16h48c8.8 0 16 7.2 16 16v48c0 8.8-7.2 16-16 16H104c-8.8 0-16-7.2-16-16V104zM232 88h48c8.8 0 16 7.2 16 16v48c0 8.8-7.2 16-16 16H232c-8.8 0-16-7.2-16-16V104c0-8.8 7.2-16 16-16zM88 232c0-8.8 7.2-16 16-16h48c8.8 0 16 7.2 16 16v48c0 8.8-7.2 16-16 16H104c-8.8 0-16-7.2-16-16V232zm144-16h48c8.8 0 16 7.2 16 16v48c0 8.8-7.2 16-16 16H232c-8.8 0-16-7.2-16-16V232c0-8.8 7.2-16 16-16z" />
	</svg>
);
