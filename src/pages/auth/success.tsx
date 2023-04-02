import Link from "next/link";
import { useRouter } from "next/router";
import { z } from "zod";

const parseFragmentParams = (path: string) => {
	const fragment = path.split("#")[1];
	const params = Object.fromEntries(new URLSearchParams(fragment));
	const result = z
		.object({ error: z.string(), error_code: z.coerce.number(), error_description: z.string() })
		.safeParse(params);
	return result.success ? result.data : null;
};

export default function Verify() {
	const router = useRouter();
	const fragmentParams = parseFragmentParams(router.asPath);
	return (
		<>
			{fragmentParams?.error ? (
				<>{fragmentParams.error_description}</>
			) : (
				// <>
				// 	Successfully logged in. <Link href={"/"}>Go to Dashboard</Link>
				// </>
				<div className="flex h-full w-full flex-col items-center justify-center">
					<div className="mb-4 text-2xl text-neutral">Successfully logged in. <Link href={"/"}>Go to Dashboard</Link></div>
				</div>
			)}
		</>
	);
}
