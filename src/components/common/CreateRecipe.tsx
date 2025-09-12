"use client";

import { createRecipe, updateRecipe } from "@/lib/actions";
import Form from "next/form";
import {
	useState,
	useRef,
	SetStateAction,
	useEffect,
	useCallback,
	useActionState,
	ReactNode,
	startTransition,
	Ref,
} from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
	FaAngleUp,
	FaCircleCheck,
	FaMinus,
	FaPlus,
	FaRegTrashCan,
	FaTriangleExclamation,
	FaXmark,
} from "react-icons/fa6";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import {useRouter } from "next/navigation";
import { FullRecipe } from "@/lib/types";
import {
	cn,
	RecipeIngredientsToInputIngredients,
	TimeInMinutesToHoursAndMinutes,
} from "@/lib/utils";
import Link from "next/link";
import LoadingView from "./LoadingView";

export interface InputIngredient {
	id: string;
	ingredient: string;
	quantity: string;
	unit: string;
	group: string | undefined;
}

function useIdGenerator() {
	const counterRef = useRef(0);

	function getNextIngId(prefix = "id") {
		counterRef.current += 1;
		return `${prefix}-${counterRef.current}`;
	}

	return getNextIngId;
}

//If only editing a recipe, then set form data to existing recipe data
function setFormDataToRecipe(
	setForm: React.Dispatch<SetStateAction<FormData>>,
	recipe: FullRecipe
) {
	//seperate time into hours and minutes for seperate inputs
	const cookTimeHoursAndMinutes = TimeInMinutesToHoursAndMinutes(
		recipe.cookTimeInMins ?? 0
	);
	const prepTimeHoursAndMinutes = TimeInMinutesToHoursAndMinutes(
		recipe.prepTimeInMins ?? 0
	);

	setForm((f) => ({
		...f,
		title: recipe.title,
		description: recipe.description ?? "",
		servings: `${recipe.servings ?? 1}`,
		cookTimeHours: `${cookTimeHoursAndMinutes.hours}`,
		cookTimeMins: `${cookTimeHoursAndMinutes.minutes}`,
		prepTimeHours: `${prepTimeHoursAndMinutes.hours}`,
		prepTimeMins: `${prepTimeHoursAndMinutes.minutes}`,
	}));
}

const schema = z.object({
	servings: z
		.string()
		.optional()
		.refine(
			(val) =>
				val === undefined ||
				val === "" ||
				(!isNaN(Number(val)) && Number(val) >= 1),
			"Servings must be a number >= 1"
		)
		.transform((val) =>
			val === undefined || val === "" ? undefined : Number(val)
		),

	title: z.string().min(1, "Title is required"),
	description: z.string().optional(),
	note: z.string().optional(),
	tag: z.string().optional(),
	step: z.string().optional(),

	quantity: z
		.string()
		.optional()
		.refine(
			(val) =>
				val === undefined ||
				val === "" ||
				(!isNaN(Number(val)) && Number(val) > 0),
			"Quantity must be a number greater than 0"
		)
		.transform((val) =>
			val === undefined || val === "" ? undefined : Number(val)
		),
	unit: z.string().optional(),
	ingredient: z.string().optional(),
	groupIngredient: z.string().optional(),
	group: z.string().optional(),
	groupQuantity: z
		.string()
		.optional()
		.refine(
			(val) =>
				val === undefined ||
				val === "" ||
				(!isNaN(Number(val)) && Number(val) > 0),
			"Quantity must be a number greater than 0"
		)
		.transform((val) =>
			val === undefined || val === "" ? undefined : Number(val)
		),
	groupUnit: z.string().optional(),
	cookTimeMins: z
		.string()
		.optional()
		.refine(
			(val) => val === undefined || val === "" || !isNaN(Number(val)),
			"Cook time must be a number"
		)
		.transform((val) =>
			val === undefined || val === "" ? undefined : Number(val)
		),
	cookTimeHours: z
		.string()
		.optional()
		.refine(
			(val) => val === undefined || val === "" || !isNaN(Number(val)),
			"Cook time must be a number"
		)
		.transform((val) =>
			val === undefined || val === "" ? undefined : Number(val)
		),
	prepTimeMins: z
		.string()
		.optional()
		.refine(
			(val) => val === undefined || val === "" || !isNaN(Number(val)),
			"Prep time must be a number"
		)
		.transform((val) =>
			val === undefined || val === "" ? undefined : Number(val)
		),
	prepTimeHours: z
		.string()
		.optional()
		.refine(
			(val) => val === undefined || val === "" || !isNaN(Number(val)),
			"Prep time must be a number"
		)
		.transform((val) =>
			val === undefined || val === "" ? undefined : Number(val)
		),
});

type FormData = {
	servings: string;
	title: string;
	description: string;
	note: string;
	tag: string;
	step: string;
	quantity: string;
	unit: string;
	ingredient: string;
	groupIngredient: string;
	group: string;
	groupQuantity: string;
	groupUnit: string;
	cookTimeMins: string;
	cookTimeHours: string;
	prepTimeMins: string;
	prepTimeHours: string;
};

interface CreateRecipeProps {
	userId: string;
	editRecipe?: FullRecipe;
}

interface stateType {
	success: boolean;
	message: string;
	status: number;
	formData: globalThis.FormData | null;
}

const initialState: stateType = {
	success: false,
	message: "",
	status: 0,
	formData: null,
};

export default function CreateRecipe({ editRecipe }: CreateRecipeProps) {
	const [showRecipeGroupInput, setShowRecipeGroupInput] = useState(false);

	const titleRef = useRef<HTMLInputElement>(null);
	const groupRef = useRef<HTMLInputElement>(null);

	const [ingredients, setIngredients] = useState<InputIngredient[]>(
		RecipeIngredientsToInputIngredients(editRecipe?.ingredients ?? [])
	);
	const [steps, setSteps] = useState<string[]>(
		editRecipe?.steps.map((step) => step.content) ?? []
	);
	const [notes, setNotes] = useState<string[]>(
		editRecipe?.notes.map((note) => note.content) ?? []
	);
	const [tags, setTags] = useState<string[]>(
		editRecipe?.tags.map((tag) => tag.title) ?? []
	);

	const [form, setForm] = useState<FormData>({
		servings: "1",
		title: "",
		description: "",
		note: "",
		step: "",
		tag: "",
		quantity: "",
		unit: "",
		ingredient: "",
		groupIngredient: "",
		group: "",
		groupQuantity: "",
		groupUnit: "",
		cookTimeHours: "",
		cookTimeMins: "",
		prepTimeHours: "",
		prepTimeMins: "",
	});

	useEffect(() => {
		if (editRecipe) {
			setFormDataToRecipe(setForm, editRecipe);
		}
	}, [editRecipe]);

	const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>(
		{}
	);

	const router = useRouter();
	const sendToServer = useCallback(
		async (state: stateType, formData: globalThis.FormData | null) => {
			if (formData) {
				formData.append("ingredients", JSON.stringify(ingredients));
				formData.append("steps", JSON.stringify(steps));
				formData.append("notes", JSON.stringify(notes));
				formData.append("tags", JSON.stringify(tags));

				let status = 0;
				let message = "";

				if (editRecipe) {
					const result = await updateRecipe(formData, editRecipe.id);
					status = result.status;
					message = result.error ?? "";
				} else {
					const result = await createRecipe(formData);
					status = result.status;
					message = result.message ?? "";
				}
				if (status == 201 || status == 200) {
					return {
						success: true,
						message: `Recipe ${editRecipe ? "updated" : "created"}`,
						status,
						formData,
					};
				} else {
					return { success: false, message, status, formData };
				}
			}
			return {
				success: false,
				message: "Form data is invalid",
				status: 500,
				formData,
			};
		},
		[editRecipe, ingredients, notes, tags, steps]
	);

	const [state, formAction, isPending] = useActionState<
		stateType,
		globalThis.FormData | null
	>(sendToServer, initialState);

	useEffect(() => {
		if (state.success) {
			//Wait a couple ms before redirecting so user can read the success message
			setTimeout(() => {
				//If editing a recipe, redirect to the overview after editing, otherwise show all recipes
				if (editRecipe) {
					router.push(`/recipes/${editRecipe.id}/`);
				} else {
					router.push("\\");
				}
			}, 200);
		}
	}, [state, editRecipe, router]);

	useEffect(() => {
		titleRef.current?.focus();
	}, []);

	const getNextIngId = useIdGenerator();

	//Seperate ingredients list into ingredients with and without group
	const ungroupedIngredients = ingredients.filter((i) => !i.group);
	const ingredientGroups = ingredients
		.filter((i) => i.group)
		.reduce((acc, curr) => {
			if (!acc[curr.group!]) {
				acc[curr.group!] = [];
			}
			acc[curr.group!].push(curr);
			return acc;
		}, {} as Record<string, InputIngredient[]>);

	const addNote = useCallback(() => {
		const trimmed = form.note.trim();
		if (trimmed && !notes.includes(trimmed)) {
			setNotes([...notes, trimmed]);
			setForm((prev) => ({ ...prev, note: "" }));
		}
	}, [form.note, notes]);

	const addStep = useCallback(() => {
		const trimmed = form.step.trim();
		if (trimmed && !steps.includes(trimmed)) {
			setSteps([...steps, trimmed]);
			setForm((prev) => ({ ...prev, step: "" }));
		}
	}, [form.step, steps]);

	const addTag = useCallback(() => {
		const trimmed = form.tag.trim();
		if (trimmed && !tags.includes(trimmed)) {
			setTags([...tags, trimmed]);
			setForm((prev) => ({ ...prev, tag: "" }));
		}
	}, [form.tag, tags]);

	const resetForm = () => {
		setForm({
			servings: "1",
			title: "",
			description: "",
			note: "",
			step: "",
			tag: "",
			quantity: "",
			unit: "",
			ingredient: "",
			groupIngredient: "",
			group: "",
			groupQuantity: "",
			groupUnit: "",
			cookTimeHours: "",
			cookTimeMins: "",
			prepTimeHours: "",
			prepTimeMins: "",
		});

		setIngredients([]);
		setSteps([]);
		setTags([]);
		setNotes([]);
		setErrors({});
	};

	const debouncedTimers = useRef<
		Partial<Record<keyof FormData, NodeJS.Timeout | null>>
	>({
		servings: null,
		title: null,
	});

	const debouncedValidateField = useCallback(
		(field: keyof FormData, value: string) => {
			if (debouncedTimers.current[field]) {
				clearTimeout(debouncedTimers.current[field]);
			}

			debouncedTimers.current[field] = setTimeout(
				() => {
					try {
						schema
							.pick({ [field]: true } as { [K in keyof FormData]?: true })
							.parse({ [field]: value });
						setErrors((prev) => ({ ...prev, [field]: undefined }));
					} catch (e) {
						if (e instanceof z.ZodError) {
							setErrors((prev) => ({ ...prev, [field]: e.errors[0].message }));
						}
					}
					//Show immediately if error is fixed, but debounce otherwise
				},
				errors[field] ? 0 : 300
			);
		},
		[errors]
	);

	const handleChange = useCallback(
		(field: keyof FormData) =>
			(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
				const value = e.target.value;

				setForm((prev) => ({ ...prev, [field]: value }));
				debouncedValidateField(field, value);
			},
		[debouncedValidateField]
	);

	const handleServingsIncrement = useCallback(() => {
		const newServings = (
			Math.max(0, Number(form.servings) + 1) || 1
		).toString();
		setForm((prev) => ({ ...prev, servings: newServings }));
		debouncedValidateField("servings", newServings);
	}, [debouncedValidateField, form.servings]);

	const handleServingsDecrement = useCallback(() => {
		const newServings = (
			Math.max(0, Number(form.servings) - 1) || 1
		).toString();
		setForm((prev) => ({ ...prev, servings: newServings }));
		debouncedValidateField("servings", newServings);
	}, [debouncedValidateField, form.servings]);

	const validateBeforeSubmit = useCallback(
		(e: React.FormEvent<HTMLFormElement>) => {
			const result = schema.safeParse(form);

			if (!result.success) {
				e.preventDefault();
				const newErrors: typeof errors = {};
				for (const issue of result.error.issues) {
					const field = issue.path[0] as keyof FormData;
					newErrors[field] = issue.message;
				}
				setErrors(newErrors);
			} else {
				setErrors({});
			}
		},
		[form]
	);

	if (isPending) {
		return (
			<LoadingView>
				<p>{`${editRecipe ? "Updating" : "Creating"} Recipe`}</p>
			</LoadingView>
		);
	}

	if (state.success) {
		return <SuccessView editRecipe={editRecipe ? true : false} />;
	}

	return (
		<div className="flex flex-col items-center">
			<div className="w-200 mt-10 mb-10">
				<h1 className="text-3xl font-bold mb-10 self-start">
					{editRecipe ? editRecipe.title : "Create New Recipe"}
				</h1>
				<ErrorBanner
					message={state.message}
					visible={!state.success && state.status != 0}
				>
					{state.status === 401 && (
						<Link
							className="underline text-white cursor-pointer inline"
							href="/api/auth/signin"
						>
							Sign In
						</Link>
					)}
					{state.status === 500 && (
						<span
							className="underline text-white cursor-pointer inline"
							onClick={() => {
								startTransition(() => {
									formAction(state.formData);
								});
							}}
						>
							Retry?
						</span>
					)}
				</ErrorBanner>
				<Form
					onSubmit={validateBeforeSubmit}
					action={(formData) => {
						formAction(formData);
					}}
					className="grid w-full space-y-6 grid-cols-2 gap-4"
				>
					{/* Title Secttion */}
					<div className="grid w-full max-w-sm items-center gap-3">
						<Label htmlFor="title">Recipe Name *</Label>
						<Input
							name="title"
							type="text"
							id="title"
							onChange={handleChange("title")}
							value={form.title}
							onKeyDown={(e) => {
								if (e.key == "Enter") {
									e.preventDefault();
								}
							}}
							ref={titleRef}
							hasError={errors.title != undefined}
						/>
						{errors.title && <p className="text-red-500">{errors.title}</p>}
					</div>
					{/* Servings Section */}
					<div className="flex flex-col gap-3">
						<Label htmlFor="servings">Servings</Label>
						<div className="flex w-full max-w-sm items-center gap-2">
							<Button
								variant="secondary"
								type="button"
								onClick={handleServingsDecrement}
								size="icon"
								className="size-8"
							>
								<FaMinus />
							</Button>
							<Input
								type="text"
								id="servings"
								name="servings"
								value={form.servings}
								onChange={handleChange("servings")}
								onKeyDown={(e) => {
									if (e.key == "Enter") {
										e.preventDefault();
									}
								}}
								hasError={errors.servings != undefined}
								className="max-w-12"
							/>
							<Button
								variant="secondary"
								type="button"
								size="icon"
								className="size-8"
								onClick={handleServingsIncrement}
							>
								<FaPlus />
							</Button>
						</div>
						{errors.servings && (
							<p className="text-red-500">{errors.servings}</p>
						)}
					</div>
					{/* Description Section */}
					<div className="grid w-full max-w-sm items-center gap-3 col-span-2">
						<Label htmlFor="desc">Description</Label>
						<Input
							type="text"
							id="desc"
							name="description"
							onKeyDown={(e) => {
								if (e.key == "Enter") {
									e.preventDefault();
								}
							}}
							value={form.description}
							onChange={handleChange("description")}
						/>
					</div>
					{/* Ingredients Section */}
					<div>
						{/* Ungrouped Ingredients Section */}
						<div>
							<IngredientInput
								ingredients={ingredients}
								setIngredients={setIngredients}
								group={false}
								form={form}
								setForm={setForm}
								errors={errors}
								handleChange={handleChange}
								getNextIngId={getNextIngId}
								groupRef={groupRef}
							/>
							<div className="flex justify-between">
								<Button
									variant="secondary"
									type="button"
									onClick={() => {
										if (showRecipeGroupInput) {
											setForm((prev) => ({ ...prev, group: "" }));
										}
										setShowRecipeGroupInput(!showRecipeGroupInput);
									}}
									className="mb-3"
								>
									{showRecipeGroupInput && <FaAngleUp />}
									{!showRecipeGroupInput && <FaPlus />}
									Ingredient Group
								</Button>
								{showRecipeGroupInput && form.group.length > 0 && (
									<Button
										variant="secondary"
										type="button"
										onClick={() => {
											setForm((prev) => ({
												...prev,
												group: "",
												groupIngredient: "",
												groupUnit: "",
												groupQuantity: "",
											}));
											groupRef.current?.focus();
										}}
									>
										New Group
									</Button>
								)}
							</div>

							{/* Grouped Ingredients Section */}
							{showRecipeGroupInput && (
								<IngredientInput
									ingredients={ingredients}
									setIngredients={setIngredients}
									group={true}
									form={form}
									setForm={setForm}
									errors={errors}
									handleChange={handleChange}
									getNextIngId={getNextIngId}
									groupRef={groupRef}
								/>
							)}
						</div>
						{/* Ingredients List Section */}
						{ingredients.length > 0 && (
							<h3 className="font-semibold">Ingredients</h3>
						)}
						<div>
							{/* Ungrouped Ingredients List Section */}
							<div>
								{ungroupedIngredients.map((uI) => (
									<IngredientItem
										ingredient={uI}
										removeIngredient={() => {
											setIngredients((prev) =>
												prev.filter((i) => i.id != uI.id)
											);
										}}
										key={uI.id}
									/>
								))}
							</div>
							{/* Grouped Ingredients List Section */}
							{Object.entries(ingredientGroups).map(([groupName, items]) => (
								<div key={groupName}>
									<h2 className="font-semibold p-2">{groupName}</h2>
									<ul>
										{items.map((i) => (
											<IngredientItem
												key={i.id}
												ingredient={i}
												removeIngredient={() => {
													setIngredients((prev) =>
														prev.filter((ing) => ing.id != i.id)
													);
												}}
											/>
										))}
									</ul>
								</div>
							))}
						</div>
					</div>
					{/* Instructions Section */}
					<div>
						<div className="flex flex-col gap-3">
							<Label htmlFor="step">Instructions</Label>
							<div className="flex gap-3 items-end">
								<Textarea
									id="step"
									name="step"
									placeholder={`Describe step ${steps.length + 1}`}
									value={form.step}
									onChange={handleChange("step")}
									onKeyDown={(e) => {
										if (e.key == "Enter") {
											e.preventDefault();
											addStep();
										}
									}}
								/>
								<Button
									variant="secondary"
									type="button"
									size="icon"
									className="size-8"
									onClick={() => {
										addStep();
									}}
									disabled={!form.step}
								>
									<FaPlus />
								</Button>
							</div>
							{/* Instructions List Section */}
							<div>
								{steps.map((step, index) => (
									<div
										key={step}
										className="flex gap-3 p-1.5 justify-between items-center"
									>
										<p>
											<span className="font-bold mr-1">{`${index + 1}.`}</span>
											{step}
										</p>
										<Button
											type="button"
											variant="ghost"
											size="icon"
											onClick={() => {
												setSteps((prev) => prev.filter((s) => s != step));
											}}
											className="size-4  bg-none  hover:scale-125"
										>
											<FaRegTrashCan className="text-red-500 size-4 transition duration-1000" />
										</Button>
									</div>
								))}
							</div>
						</div>
					</div>
					{/* Time Section */}
					<div>
						{/* Cook Time Section */}
						<div className="flex flex-col gap-3">
							<Label htmlFor="cookTime">Cook Time</Label>
							<div className="flex gap-3 items-center">
								<Input
									id="cookTime"
									name="cookTimeHours"
									onKeyDown={(e) => {
										if (e.key == "Enter") {
											e.preventDefault();
										}
									}}
									onChange={handleChange("cookTimeHours")}
									value={form.cookTimeHours}
									placeholder="h"
									className="w-12"
									hasError={errors.cookTimeHours != undefined}
								/>
								<span>:</span>
								<Input
									name="cookTimeMins"
									onKeyDown={(e) => {
										if (e.key == "Enter") {
											e.preventDefault();
										}
									}}
									value={form.cookTimeMins}
									onChange={handleChange("cookTimeMins")}
									placeholder="m"
									className="w-12"
									hasError={errors.cookTimeMins != undefined}
								/>
							</div>
							{(errors.cookTimeHours || errors.cookTimeMins) && (
								<p className="text-red-500">
									{errors.cookTimeHours ?? errors.cookTimeMins}
								</p>
							)}
						</div>
					</div>
					{/* Prep Time Section */}
					<div>
						<div className="flex flex-col gap-3">
							<Label htmlFor="cookTime">Prep Time</Label>
							<div className="flex gap-3 items-center">
								<Input
									id="prepTime"
									name="prepTimeHours"
									onKeyDown={(e) => {
										if (e.key == "Enter") {
											e.preventDefault();
										}
									}}
									value={form.prepTimeHours}
									onChange={handleChange("prepTimeHours")}
									placeholder="h"
									className="w-12"
									hasError={errors.prepTimeHours != undefined}
								/>
								<span>:</span>
								<Input
									name="prepTimeMins"
									onKeyDown={(e) => {
										if (e.key == "Enter") {
											e.preventDefault();
										}
									}}
									placeholder="m"
									className="w-12"
									value={form.prepTimeMins}
									onChange={handleChange("prepTimeMins")}
									hasError={errors.prepTimeMins != undefined}
								/>
							</div>
							{(errors.prepTimeHours || errors.prepTimeMins) && (
								<p className="text-red-500">
									{errors.prepTimeHours ?? errors.prepTimeMins}
								</p>
							)}
						</div>
					</div>
					{/* Notes Section */}
					<div className="flex flex-col gap-3">
						<Label htmlFor="note">Notes</Label>
						<div className="flex gap-3 items-end">
							<Textarea
								id="note"
								placeholder="Add a note"
								value={form.note}
								onChange={handleChange("note")}
								onKeyDown={(e) => {
									if (e.key == "Enter") {
										e.preventDefault();
										addNote();
									}
								}}
							/>
							<Button
								variant="secondary"
								type="button"
								size="icon"
								className="size-8"
								onClick={() => {
									addNote();
								}}
								disabled={!form.note}
							>
								<FaPlus />
							</Button>
						</div>
						{/* Notes List Section */}
						<div>
							{notes.map((note) => (
								<div
									className="flex gap-3 justify-between w-full border-b-2 last:border-b-0 p-1.5 items-center"
									key={note}
								>
									<p>{note}</p>
									<Button
										type="button"
										variant="ghost"
										size="icon"
										onClick={() => {
											setNotes(notes.filter((n) => n != note));
										}}
										className="size-4  bg-none  hover:scale-125"
									>
										<FaRegTrashCan className="text-red-500 size-4 transition duration-1000" />
									</Button>
								</div>
							))}
						</div>
					</div>
					{/* Tags Section */}
					<div className="flex flex-col gap-3">
						<Label htmlFor="tag">Tags</Label>
						<div className="flex gap-3">
							<Input
								id="tag"
								placeholder="tag"
								value={form.tag}
								onChange={handleChange("tag")}
								onKeyDown={(e) => {
									if (e.key == "Enter") {
										e.preventDefault();
										addTag();
									}
								}}
							/>

							<Button
								type="button"
								variant="secondary"
								size="icon"
								className="size-8"
								onClick={() => {
									addTag();
								}}
								disabled={!form.tag}
							>
								<FaPlus />
							</Button>
						</div>
						{/* Tags List Section */}
						<div className="flex gap-3 flex-wrap">
							{tags.map((tag) => (
								<div
									key={tag}
									className="p-1 pl-2 pr-0 flex gap-3 items-center bg-gray-200 w-min rounded-sm "
								>
									<p>{tag}</p>
									<Button
										variant="ghost"
										size="icon"
										className="size-8 hover:bg-transparent hover:scale-150 transition-all duration-200"
										onClick={() => {
											setTags(tags.filter((t) => t != tag));
										}}
									>
										<FaXmark />
									</Button>
								</div>
							))}
						</div>
					</div>
					{/*TODO*/
					/* Image Section */
					/*https://dev.to/drprime01/how-to-validate-a-file-input-with-zod-5739*/}
					{/* <input
				type="file"
				name="file"
				onChange={async (e) => {
					setFileUploadBusy(true);
					if (e.target.files) {
						const formData = new FormData();
						Object.values(e.target.files).forEach((file) => {
							formData.append("file", file);
						});

						const response = await upload(formData);

						const result = await response?.json();
						if (result.success) {
							setFileUploadBusy(false);
						} else {
              setErrors((prev) => ({...prev, file: "Failed to upload image"}))
						}
					}
				}}
			/> */}
					{/* Action Buttons Section */}
					<div className="col-span-2 justify-self-center flex gap-3">
						<Button
							type="button"
							variant="destructive"
							onClick={() => {
								resetForm();
							}}
						>
							Discard
						</Button>
						<Button
							disabled={
								Object.values(errors).find((v) => v != undefined) !=
									undefined ||
								(state.success == false && state.status != 0)
									? true
									: false
							}
						>
							{editRecipe ? "Save" : "Create"}
						</Button>
					</div>
				</Form>
			</div>
		</div>
	);
}

interface IngredientInputProps {
	ingredients: InputIngredient[];
	setIngredients: React.Dispatch<SetStateAction<InputIngredient[]>>;
	group: boolean;
	form: FormData;
	setForm: React.Dispatch<SetStateAction<FormData>>;
	errors: Partial<Record<keyof FormData, string>>;
	handleChange: (
		field: keyof FormData
	) => (e: React.ChangeEvent<HTMLInputElement>) => void;
	getNextIngId: () => string;
	groupRef: Ref<HTMLInputElement>;
}

function IngredientInput({
	ingredients,
	setIngredients,
	group,
	form,
	setForm,
	errors,
	handleChange,
	getNextIngId,
	groupRef,
}: IngredientInputProps) {
	const ingredientInputRef = useRef<HTMLInputElement>(null);

	const addIngredient = (group: boolean) => {
		const ingredientTrimmed = (group ? form.groupIngredient : form.ingredient)
			.trim()
			.toLowerCase();
		const quantityTrimmed = (group ? form.groupQuantity : form.quantity).trim();
		const unitTrimmed = (group ? form.groupUnit : form.unit)
			.trim()
			.toLowerCase();
		if (ingredientTrimmed != "") {
			const inputIng: InputIngredient = {
				ingredient: ingredientTrimmed,
				quantity: quantityTrimmed,
				unit: unitTrimmed,
				group: group ? form.group : undefined,
				id: getNextIngId(),
			};

			setIngredients([...ingredients, inputIng]);
			if (group) {
				setForm((prev) => ({
					...prev,
					groupQuantity: "",
					groupUnit: "",
					groupIngredient: "",
				}));
			} else {
				setForm((prev) => ({
					...prev,
					quantity: "",
					unit: "",
					ingredient: "",
				}));
			}

			ingredientInputRef.current?.focus();
		}
	};

	return (
		<div className="flex flex-col gap-3 mb-3">
			{group && (
				<div className="grid w-full max-w-sm items-center gap-3">
					<Label htmlFor="group">Group Name</Label>
					<Input
						type="text"
						id="group"
						name="group"
						value={form.group}
						onChange={handleChange("group")}
						onKeyDown={(e) => {
							if (e.key == "Enter") {
								e.preventDefault();
							}
						}}
						ref={groupRef}
					/>
				</div>
			)}
			<div className="grid w-full max-w-sm items-center gap-3">
				<div className="grid w-full max-w-sm items-center gap-2">
					<Label htmlFor="quantity">Quantity</Label>
					<Input
						type="text"
						id="quantity"
						placeholder="1"
						value={group ? form.groupQuantity : form.quantity}
						onChange={handleChange(group ? "groupQuantity" : "quantity")}
						onKeyDown={(e) => {
							if (e.key == "Enter") {
								e.preventDefault();
							}
						}}
						ref={ingredientInputRef}
						hasError={
							group
								? errors.groupQuantity != undefined
								: errors.quantity != undefined
						}
						className={"row-start-2 w-12"}
					/>
					{errors.quantity && (
						<p className="row-start-3 col-span-3 text-sm text-red-500">
							{group ? errors.groupQuantity : errors.quantity}
						</p>
					)}
					<Label htmlFor="unit" className="col-start-2 row-start-1">
						Unit
					</Label>
					<Input
						type="text"
						id="unit"
						placeholder="cup"
						value={group ? form.groupUnit : form.unit}
						onChange={handleChange(group ? "groupUnit" : "unit")}
						onKeyDown={(e) => {
							if (e.key == "Enter") {
								e.preventDefault();
							}
						}}
						className="col-start-2 row-start-2 w-18"
					/>
					<Label htmlFor="ingredient" className="col-start-3 row-start-1">
						Ingredient
					</Label>
					<Input
						type="text"
						id="ingredient"
						value={group ? form.groupIngredient : form.ingredient}
						onChange={handleChange(group ? "groupIngredient" : "ingredient")}
						onKeyDown={(e) => {
							if (e.key == "Enter") {
								e.preventDefault();
								addIngredient(group);
							}
						}}
						placeholder="flour"
						className="col-start-3 row-start-2"
					/>
					<Button
						type="button"
						variant="secondary"
						size="icon"
						className="size-8 col-start-4 row-start-2"
						onClick={() => {
							addIngredient(group);
						}}
						disabled={
							group
								? form.groupIngredient == "" || form.group == ""
								: form.ingredient == ""
						}
					>
						<FaPlus />
					</Button>
				</div>
			</div>
		</div>
	);
}

interface IngredientItemProps {
	ingredient: InputIngredient;
	removeIngredient: () => void;
}

function IngredientItem({ ingredient, removeIngredient }: IngredientItemProps) {
	return (
		<div className="flex gap-3 justify-between w-full border-b-2 last:border-b-0  items-center">
			<p className="font-semibold p-1.5">
				{ingredient.quantity && (
					<span className="mr-1.5 text-gray-400">{ingredient.quantity}</span>
				)}
				{ingredient.unit && (
					<span className="mr-1.5 text-gray-400">{ingredient.unit}</span>
				)}
				{ingredient.ingredient}
			</p>
			<Button
				type="button"
				variant="ghost"
				size="icon"
				onClick={removeIngredient}
				className="size-4  bg-none  hover:scale-125"
			>
				<FaRegTrashCan className="text-red-500 size-4 transition duration-1000" />
			</Button>
		</div>
	);
}

interface SuccessViewProps {
	editRecipe: boolean;
}

function SuccessView({ editRecipe }: SuccessViewProps) {
	return (
		<div className="w-full h-dvh flex flex-col gap-3 items-center justify-center">
			<FaCircleCheck className="text-secondary size-10" />
			<p>{`Successfully ${editRecipe ? "updated" : "created"} recipe!`}</p>
		</div>
	);
}

interface ErrorBannerProps {
	message: string;
	visible: boolean;
	children?: ReactNode;
}

function ErrorBanner({ message, visible, children }: ErrorBannerProps) {
	return (
		<div
			className={cn(
				"w-full col-span-2 flex gap-3 bg-red-300 border-2 border-red-500 mb-10 p-2 rounded-xl items-center",
				{ hidden: !visible }
			)}
		>
			<FaTriangleExclamation className="size-6 text-white" />
			<p className=" text-white">
				{message}
				&nbsp;
				{children}
			</p>
		</div>
	);
}
