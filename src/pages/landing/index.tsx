import { useRouter } from "next/router";
import { useEffect } from "react";
import { useAppState } from "../../components/useAppState";
import Link from "next/link";

export default function Landing() {
	const { supabaseClient } = useAppState();
	const router = useRouter();
	useEffect(() => {
		(async () => {
			if ((await supabaseClient.auth.getUser()).data.user !== null) router.push("/");
		})();
	}, [router, supabaseClient.auth]);

	return (
		<div className="flex h-full w-full items-center justify-center px-20 py-10 text-neutral">
			<div className="mr-[6%] w-[50%] text-xl">
				<img className="mb-16 w-[55%]" src="/media/logo.svg" alt="logo large" />
				<p className="mb-8 text-justify">
					Our platform is designed to cater to the needs of clients who are looking for a unique and
					engaging way to tell their stories. With Comicraft, you can easily input your story in
					natural language and watch as advanced AI algorithms generate a custom comic that
					perfectly captures your message.
				</p>
				<p className="mb-8 text-justify">
					Our process is simple and efficient, allowing you to quickly and easily create
					professional comics that can be used both internally and externally. Whether you&apos;re
					looking to promote your brand or communicate complex ideas to your team, Comicraft has you
					covered.
				</p>
				<p className="mb-10 text-justify">
					So why wait? Sign up today and experience the power of AI-generated comics for yourself!
				</p>
				<Link href="/auth/sign-in" className="btn bg-white text-primary border-primary border-[3px] text-lg px-6 py-3 h-auto hover:border-primary hover:bg-primary hover:text-white">Sign in now</Link>
			</div>
			<img
				className="w-[50%]"
				src="/media/illustration.svg"
				alt="illustration of man with pencils"
			/>
		</div>
	);
}
