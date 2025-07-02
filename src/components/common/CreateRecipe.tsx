"use client";
import { createRecipe } from "@/lib/actions";
import Form from "next/form";
import { useState, useRef, SetStateAction } from "react";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
	FaAngleUp,
	FaMinus,
	FaPlus,
	FaRegTrashCan,
	FaXmark,
} from "react-icons/fa6";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Textarea } from "../ui/textarea";

interface CreateUserRecipeProps {
	userId: string;
}

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
			"Quantity must be a number > 0"
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
			"Quantity must be a number"
		)
		.transform((val) =>
			val === undefined || val === "" ? undefined : Number(val)
		),
	groupUnit: z.string().optional(),
	cookTimeMins: z
		.string()
		.optional()
		.refine(
			(val) =>
				val === undefined ||
				val === "" ||
				(!isNaN(Number(val)) && Number(val) > 0),
			"Cook time must be a number"
		)
		.transform((val) =>
			val === undefined || val === "" ? undefined : Number(val)
		),
	cookTimeHours: z
		.string()
		.optional()
		.refine(
			(val) =>
				val === undefined ||
				val === "" ||
				(!isNaN(Number(val)) && Number(val) > 0),
			"Cook time must be a number"
		)
		.transform((val) =>
			val === undefined || val === "" ? undefined : Number(val)
		),
	prepTimeMins: z
		.string()
		.optional()
		.refine(
			(val) =>
				val === undefined ||
				val === "" ||
				(!isNaN(Number(val)) && Number(val) > 0),
			"Prep time must be a number"
		)
		.transform((val) =>
			val === undefined || val === "" ? undefined : Number(val)
		),
	prepTimeHours: z
		.string()
		.optional()
		.refine(
			(val) =>
				val === undefined ||
				val === "" ||
				(!isNaN(Number(val)) && Number(val) > 0),
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

export default function CreateRecipe({ userId }: CreateUserRecipeProps) {
	const createRecipeForUser = createRecipe.bind(null, userId);

	const [showRecipeGroupInput, setShowRecipeGroupInput] = useState(false);
	const [formError, setFormError] = useState("");

	const [ingredients, setIngredients] = useState<InputIngredient[]>([]);
	const [steps, setSteps] = useState<string[]>([]);
	const [notes, setNotes] = useState<string[]>([]);
	const [tags, setTags] = useState<string[]>([]);

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
	const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>(
		{}
	);
	const getNextIngId = useIdGenerator();

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

	const addNote = () => {
		const trimmed = form.note.trim();
		if (trimmed && !notes.includes(trimmed)) {
			setNotes([...notes, trimmed]);
			setForm((prev) => ({ ...prev, note: "" }));
		}
	};

	const addStep = () => {
		const trimmed = form.step.trim();
		if (trimmed && !steps.includes(trimmed)) {
			setSteps([...steps, trimmed]);
			setForm((prev) => ({ ...prev, step: "" }));
		}
	};

	const addTag = () => {
		const trimmed = form.tag.trim();
		if (trimmed && !tags.includes(trimmed)) {
			setTags([...tags, trimmed]);
			setForm((prev) => ({ ...prev, tag: "" }));
		}
	};

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

	const debouncedValidateField = (field: keyof FormData, value: string) => {
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
	};

	const handleChange =
		(field: keyof FormData) =>
		(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
			const value = e.target.value;

			setForm((prev) => ({ ...prev, [field]: value }));
			debouncedValidateField(field, value);
		};

	const handleServingsIncrement = () => {
		const newServings = (
			Math.max(0, Number(form.servings) + 1) || 1
		).toString();
		setForm((prev) => ({ ...prev, servings: newServings }));
		debouncedValidateField("servings", newServings);
	};

	const handleServingsDecrement = () => {
		const newServings = (
			Math.max(0, Number(form.servings) - 1) || 1
		).toString();
		setForm((prev) => ({ ...prev, servings: newServings }));
		debouncedValidateField("servings", newServings);
	};

	const validateBeforeSubmit = (e: React.FormEvent<HTMLFormElement>) => {
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
	};

	const sendToServer = async (formData: globalThis.FormData) => {
		formData.append("ingredients", JSON.stringify(ingredients));
		formData.append("steps", steps.toString());
		formData.append("notes", notes.toString());
		formData.append("tags", tags.toString());
		const result = await createRecipeForUser(formData);
		if (result.success) {
			setFormError("");
			alert("Successfully created recipe!");
		} else {
			setFormError(`Could not create recipe. Message: ${result.message}`);
		}
	};

	return (
		<Card className="w-full">
			<CardHeader>
				<CardTitle className="text-2xl text-black_olive">
					Create New Recipe
				</CardTitle>
			</CardHeader>
			<CardContent>
				<Form
					onSubmit={validateBeforeSubmit}
					action={(formData) => {
						sendToServer(formData);
					}}
					className="grid w-full space-y-6 grid-cols-2 gap-4 "
				>
					<div className="grid w-full max-w-sm items-center gap-3">
						<Label htmlFor="title">Recipe Name *</Label>
						<Input
							type="text"
							id="title"
							onChange={handleChange("title")}
							value={form.title}
							onKeyDown={(e) => {
								if (e.key == "Enter") {
									e.preventDefault();
								}
							}}
							hasError={errors.title != undefined}
						/>
						{errors.title && <p className="text-red-500">{errors.title}</p>}
					</div>
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
					<div className="grid w-full max-w-sm items-center gap-3 col-span-2">
						<Label htmlFor="desc">Description</Label>
						<Input
							type="text"
							id="desc"
							onKeyDown={(e) => {
								if (e.key == "Enter") {
									e.preventDefault();
								}
							}}
							value={form.description}
							onChange={handleChange("description")}
						/>
					</div>
					<div>
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
							/>
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
								/>
							)}
						</div>
						{ingredients.length > 0 && (
							<h3 className="font-semibold">Ingredients</h3>
						)}
						<div>
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
							{/* {Object.entries(ingredientGroups).map(([groupName, items]) => (
								<div key={groupName}>
									<p>{groupName}</p>
									<ul>
										{items.map((i) => (
											<li
												key={i.id}
											>{`${i.quantity} ${i.unit} ${i.ingredient}`}</li>
										))}
									</ul>
								</div>
							))} */}
						</div>
					</div>
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
					<div>
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
								Object.values(errors).find((v) => v != undefined) != undefined
									? true
									: false
							}
						>
							Create
						</Button>
					</div>

					{formError && <p>{formError}</p>}
				</Form>
			</CardContent>
		</Card>
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
