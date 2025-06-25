"use client";
import { createRecipe } from "@/lib/actions";
import styles from "./CreateRecipe.module.css";
import Form from "next/form";
import { useState, useRef, SetStateAction } from "react";
import { z } from "zod";

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
			"Quantity must be a number"
		)
		.transform((val) =>
			val === undefined || val === "" ? undefined : Number(val)
		),
});

type FormData = {
	servings: string;
	title: string;
	note: string;
	tag: string;
	step: string;
	quantity: string;
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
		note: "",
		step: "",
		tag: "",
		quantity: "",
	});
	const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>(
		{}
	);

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
		const trimmed = form.note.trim().toLowerCase();
		if (trimmed && !notes.includes(trimmed)) {
			setNotes([...notes, trimmed]);
			setForm((prev) => ({ ...prev, note: "" }));
		} else {
			alert("Already added note");
		}
	};

	const addStep = () => {
		const trimmed = form.step.trim().toLowerCase();
		if (trimmed && !steps.includes(trimmed)) {
			setSteps([...steps, trimmed]);
			setForm((prev) => ({ ...prev, step: "" }));
		} else {
			alert("Already added step");
		}
	};

	const addTag = () => {
		const trimmed = form.tag.trim().toLowerCase();
		if (trimmed && !tags.includes(trimmed)) {
			setTags([...tags, trimmed]);
			setForm((prev) => ({ ...prev, tag: "" }));
		} else {
			alert("Already added tag");
		}
	};

	const debouncedTimers = useRef<
		Partial<Record<keyof FormData, NodeJS.Timeout | null>>
	>({
		servings: null,
		title: null,
		tag: null,
		note: null,
		step: null,
	});

	const debouncedValidateField = (field: keyof FormData, value: string) => {
		if (debouncedTimers.current[field]) {
			clearTimeout(debouncedTimers.current[field]);
		}

		debouncedTimers.current[field] = setTimeout(() => {
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
		}, 300);
	};

	const handleChange =
		(field: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement>) => {
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
		<Form
			className={styles.form}
			onSubmit={validateBeforeSubmit}
			action={(formData) => {
				sendToServer(formData);
			}}
		>
			<label>
				Recipe Name
				<input
					name="title"
					onKeyDown={(e) => {
						if (e.key == "Enter") {
							e.preventDefault();
						}
					}}
					value={form.title}
					onChange={handleChange("title")}
				/>
				{errors.title && <p>{errors.title}</p>}
			</label>
			<div>
				<label>
					Servings
					<input
						name="servings"
						value={form.servings}
						onChange={handleChange("servings")}
						onKeyDown={(e) => {
							if (e.key == "Enter") {
								e.preventDefault();
							}
						}}
					/>
					{errors.servings && <p>{errors.servings}</p>}
				</label>
				<button type="button" onClick={handleServingsIncrement}>
					+
				</button>
				<button type="button" onClick={handleServingsDecrement}>
					-
				</button>
			</div>
			<input
				name="description"
				placeholder="description"
				onKeyDown={(e) => {
					if (e.key == "Enter") {
						e.preventDefault();
					}
				}}
			/>
			<div>
				<IngredientInput
					ingredients={ingredients}
					setIngredients={setIngredients}
					group={false}
					form={form}
					errors={errors}
					handleChange={handleChange}
				/>
				<div>
					{ungroupedIngredients.map((uI) => (
						<p key={uI.id}>{`${uI.quantity} ${uI.unit} ${uI.ingredient}`}</p>
					))}
					{Object.entries(ingredientGroups).map(([groupName, items]) => (
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
					))}
				</div>
				<button
					type="button"
					onClick={() => {
						setShowRecipeGroupInput(true);
					}}
				>
					Ingredient Group
				</button>
				{showRecipeGroupInput && (
					<IngredientInput
						ingredients={ingredients}
						setIngredients={setIngredients}
						group={true}
						form={form}
						errors={errors}
						handleChange={handleChange}
					/>
				)}
			</div>
			<div>
				<h2>Instructions</h2>
				<input
					placeholder={`Step ${steps.length + 1}`}
					value={form.step}
					onChange={handleChange("step")}
					onKeyDown={(e) => {
						if (e.key == "Enter") {
							e.preventDefault();
							addStep();
						}
					}}
				/>
				<button
					type="button"
					onClick={() => {
						addStep();
					}}
				>
					+
				</button>
				<div>
					{steps.map((step) => (
						<div key={step}>
							<p>{step}</p>
						</div>
					))}
				</div>
			</div>
			<div>
				<label>
					Cook Time
					<input
						name="cookTimeHours"
						onKeyDown={(e) => {
							if (e.key == "Enter") {
								e.preventDefault();
							}
						}}
						placeholder="hours"
						type="number"
					/>{" "}
					:
					<input
						name="cookTimeMins"
						onKeyDown={(e) => {
							if (e.key == "Enter") {
								e.preventDefault();
							}
						}}
						placeholder="minutes"
						type="number"
					/>
				</label>
			</div>
			<div>
				<label>
					Prep Time
					<input
						name="prepTimeHours"
						onKeyDown={(e) => {
							if (e.key == "Enter") {
								e.preventDefault();
							}
						}}
						placeholder="hours"
						type="number"
					/>{" "}
					:
					<input
						name="prepTimeMins"
						onKeyDown={(e) => {
							if (e.key == "Enter") {
								e.preventDefault();
							}
						}}
						placeholder="minutes"
						type="number"
					/>
				</label>
			</div>
			<div>
				<label>Notes</label>
				<input
					placeholder="note"
					value={form.note}
					onChange={handleChange("note")}
					onKeyDown={(e) => {
						if (e.key == "Enter") {
							e.preventDefault();
							addNote();
						}
					}}
				/>
				<button
					type="button"
					onClick={() => {
						addNote();
					}}
				>
					+
				</button>
				<div>
					{notes.map((note) => (
						<p key={note}>{note}</p>
					))}
				</div>
			</div>
			<div>
				<label>Tags</label>
				<input
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
				<button
					type="button"
					onClick={() => {
						addTag();
					}}
				>
					+
				</button>
				<div>
					{tags.map((tag) => (
						<div key={tag}>
							<p>{tag}</p>
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
			<button>Create</button>
			{formError && <p>{formError}</p>}
		</Form>
	);
}

interface IngredientInputProps {
	ingredients: InputIngredient[];
	setIngredients: React.Dispatch<SetStateAction<InputIngredient[]>>;
	group: boolean;
	form: FormData;
	errors: Partial<Record<keyof FormData, string>>;
	// setErrors: React.Dispatch<SetStateAction<Partial<Record<keyof FormData, string>>>>,
	handleChange: (
		field: keyof FormData
	) => (e: React.ChangeEvent<HTMLInputElement>) => void;
}

function IngredientInput({
	ingredients,
	setIngredients,
	group,
	form,
	errors,
	handleChange,
}: IngredientInputProps) {
	const [ingredientQuantity, setIngredientQuantity] = useState("");
	const [ingredientUnit, setIngredientUnit] = useState("");
	const [ingredient, setIngredient] = useState("");
	const [ingredientGroup, setIngredientGroup] = useState("");
	const ingredientInputRef = useRef<HTMLInputElement>(null);

	const getNextIngId = useIdGenerator();

	const addIngredient = () => {
		const ingredientTrimmed = ingredient.trim().toLowerCase();
		const quantityTrimmed = ingredientQuantity.trim();
		const unitTrimmed = ingredientUnit.trim().toLowerCase();

		const inputIng: InputIngredient = {
			ingredient: ingredientTrimmed,
			quantity: quantityTrimmed,
			unit: unitTrimmed,
			group: ingredientGroup,
			id: getNextIngId(),
		};

		setIngredients([...ingredients, inputIng]);
		setIngredientQuantity("");
		setIngredientUnit("");
		setIngredient("");
		ingredientInputRef.current?.focus();
	};

	return (
		<div>
			{group && (
				<label>
					Group Name
					<input
						value={ingredientGroup}
						onChange={(e) => setIngredientGroup(e.target.value)}
						onKeyDown={(e) => {
							if (e.key == "Enter") {
								e.preventDefault();
							}
						}}
					/>
				</label>
			)}
			<label>
				Ingredients
				<input
					value={form.quantity}
					onChange={handleChange("quantity")}
					onKeyDown={(e) => {
						if (e.key == "Enter") {
							e.preventDefault();
						}
					}}
					placeholder="quantity"
					ref={ingredientInputRef}
				/>
				{errors.quantity && <p>{errors.quantity}</p>}
				<input
					value={ingredientUnit}
					onChange={(e) => {
						setIngredientUnit(e.target.value);
					}}
					onKeyDown={(e) => {
						if (e.key == "Enter") {
							e.preventDefault();
						}
					}}
					placeholder="unit"
				/>
				<input
					value={ingredient}
					onChange={(e) => {
						setIngredient(e.target.value);
					}}
					onKeyDown={(e) => {
						if (e.key == "Enter") {
							e.preventDefault();
							addIngredient();
						}
					}}
					placeholder="ingredient"
				/>
			</label>
			<button
				onClick={() => {
					addIngredient();
				}}
			>
				+
			</button>
		</div>
	);
}
