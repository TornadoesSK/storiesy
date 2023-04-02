import { useTsController } from "@ts-react/form";
import { Fragment } from "react";

export function ChangesInput() {
	const {
		field: { value, onChange },
		error,
	} = useTsController<
		{
			changeImage: boolean;
			text: string;
		}[]
	>();

	return (
		<div className="flex flex-col">
			{value?.map((singleValue, idx) => (
				<Fragment key={`${idx}${singleValue.text}`}>
					<div>
						<span className="pr-4">Regenerate Image</span>
						<input
							type="checkbox"
							checked={singleValue?.changeImage ? singleValue?.changeImage : false}
							onChange={(e) =>
								onChange([
									...value.slice(0, idx),
									{ ...singleValue, changeImage: e.target.checked },
									...value.slice(idx + 1),
								])
							}
						/>
						{error && <span>{error.errorMessage}</span>}
					</div>
					<div className="flex pb-8">
						<span className="pr-2">Change text</span>
						<textarea
							className="input-bordered input "
							value={singleValue?.text ? singleValue?.text : ""}
							onChange={(e) =>
								onChange([
									...value.slice(0, idx),
									{ ...singleValue, text: e.target.value },
									...value.slice(idx + 1),
								])
							}
						/>
						{error && <span>{error.errorMessage}</span>}
					</div>
				</Fragment>
			))}
		</div>
	);
}
