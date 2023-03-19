import { createServerSupabaseClient } from "@supabase/auth-helpers-nextjs";
import { type CreateNextContextOptions } from "@trpc/server/dist/adapters/next.js";

export const getUser = async (ctx: CreateNextContextOptions) => {
	const supabaseServerClient = createServerSupabaseClient(ctx);
	const {
		data: { user },
	} = await supabaseServerClient.auth.getUser();
	return user;
};
