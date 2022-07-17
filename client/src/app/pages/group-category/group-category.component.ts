import { Component, OnInit } from "@angular/core"
import { ActivatedRoute, Router } from "@angular/router"
import { Category } from "src/app/types/category"
import { Tasks } from "src/app/types/task"
import { Subscription } from "rxjs"
import { CategoryService } from "src/app/services/category.service"
import { TaskService } from "src/app/services/task.service"
import { ConfirmationService, MessageService } from "primeng/api"
import { FormBuilder, FormGroup, Validators } from "@angular/forms"
import { UserService } from "src/app/services/user.service"
import { User, UserType } from "src/app/types/user"

@Component({
	selector: "app-group-category",
	templateUrl: "./group-category.component.html",
	styleUrls: ["./group-category.component.css"],
})
export class GroupCategoryComponent implements OnInit {
	categoryId: number
	category: Category
	user: User
	taskList: Tasks[]
	newMemberUsername: string
	isSettingsDialogVisible: boolean = false
	isAddMemberDialogVisible: boolean = false
	isAddTaskDialogVisible: boolean = false
	categorySettingsForm: FormGroup
	addTaskForm: FormGroup
	priorityOptions: string[] = ["High", "Medium", "Low"]
	private routeSubscription: Subscription

	constructor(
		private route: ActivatedRoute,
		private userService: UserService,
		private categoryService: CategoryService,
		private taskService: TaskService,
		private confirmationService: ConfirmationService,
		private message: MessageService,
		private fb: FormBuilder,
		private router: Router,
	) {}

	ngOnInit(): void {
		this.addTaskForm = this.fb.group({
			taskName: ["", Validators.required],
			taskDueDate: ["", Validators.required],
			taskPriority: ["", Validators.required],
		})

		this.routeSubscription = this.route.params.subscribe((params) => {
			console.log(params)
			this.categoryId = params["id"]

			this.categoryService
				.getCategoryById(this.categoryId)
				.subscribe((category) => (this.category = category))

			this.userService.getCurrentUser().subscribe((user) => {
				this.user = user
				if (
					!this.category?.members?.some(
						(member) => member.userId === user.id,
					)
				) {
					this.router.navigate(["/404"])
				}
			})

			this.taskService
				.getTaskByCategoryId(this.categoryId)
				.subscribe((tasks) => {
					this.taskList = tasks
					console.log(tasks)
				})

			this.categorySettingsForm = this.fb.group({
				categoryName: [this.category?.name, Validators.required],
			})
		})
	}

	showSettingsDialog() {
		if (this.user.id === this.category?.creatorId) {
			this.isSettingsDialogVisible = true
		} else {
			this.message.add({
				severity: "error",
				summary: "No UNLIMITED POWAAA for you",
				detail: "Only the creator can edit this category",
			})
		}
	}

	showAddMemberDialog() {
		this.isAddMemberDialogVisible = true
	}

	showAddTaskDialog() {
		this.isAddTaskDialogVisible = true
	}

	onEdit() {
		this.categoryService
			.editCategory({
				id: this.categoryId,
				creatorId: this.user.id,
				name: this.categorySettingsForm.value.categoryName,
				type: this.category?.type!,
			})
			.subscribe((category) => {
				this.categoryId = category.id
				this.category = category
				this.isSettingsDialogVisible = false
				this.message.add({
					severity: "success",
					summary: "Updated!",
					detail: "Category has been edited successfully",
				})
			})
	}

	addMember() {
		const allUsers = this.userService.getAllUsers()

		const newMember = allUsers.find(
			(user) => user.username === this.newMemberUsername,
		)

		if (newMember) {
			if (
				this.category.members?.some(
					(member) => member.userId === newMember.id,
				)
			) {
				this.message.add({
					severity: "error",
					summary: "Already a member",
					detail: "This user is already a member of this category",
				})
			} else if (newMember.type === UserType.FREE) {
				this.message.add({
					severity: "error",
					summary: "Man's broke",
					detail: "Only Pro and Pro+ users can be added to group categories",
				})
			} else {
				this.categoryService.addMember(this.categoryId, newMember)
				this.isAddMemberDialogVisible = false
				this.isSettingsDialogVisible = false
				this.message.add({
					severity: "success",
					summary: `${newMember.username} has joined the game`,
					detail: "User has been added to this category",
				})
			}
		} else {
			this.message.add({
				severity: "error",
				summary: "Who?",
				detail: "No user found with that username",
			})
		}
	}

	removeMember(memberId: number) {
		console.log(memberId)
	}

	deleteCategory() {
		this.confirmationService.confirm({
			header: "Delete category",
			message:
				"Are you sure you want to delete this category? This is NOT reversible",
			accept: () => {
				this.categoryService.deleteCategory(this.categoryId)
				this.isSettingsDialogVisible = false
				this.router.navigate(["/home"])
				this.message.add({
					severity: "success",
					summary: "Poof!",
					detail: "Category deleted successfully",
				})
			},
		})
	}

	addTask() {
		this.taskService
			.addTask(
				this.categoryId,
				this.user.id,
				this.addTaskForm.value.taskName,
				this.addTaskForm.value.taskDueDate,
				this.addTaskForm.value.taskPriority,
			)
			.subscribe((task) => {
				console.log(task.dueDate)
				this.taskList.push(task)
				this.isAddTaskDialogVisible = false
				this.addTaskForm.reset()
				this.message.add({
					severity: "success",
					summary: "Task added!",
					detail: "More stuff to do now ;-;",
				})
			})
	}

	ngOnDestroy() {
		this.routeSubscription.unsubscribe()
	}
}
