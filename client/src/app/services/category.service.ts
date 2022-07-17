import { Injectable } from "@angular/core"
import { Category, CategoryType } from "../types/category"
import { Observable, of } from "rxjs"
import { categoryList } from "../mock-data/mock-category"
import { User } from "../types/user"

@Injectable({
	providedIn: "root",
})
export class CategoryService {
	constructor() {}

	getCategoryList(userId: number): Observable<Category[]> {
		return of(
			categoryList.filter((category) => {
				if (category.type == CategoryType.GRP) {
					return category.members?.find(
						(member) => member.userId === userId,
					)
				} else {
					console.log(category.id)
					if (category.creatorId == userId) {
						return category
					} else {
						return null
					}
				}
			}),
		)
	}

	getCategoryById(id: number): Observable<Category> {
		const category = of(categoryList.find((category) => category.id == id)!)
		return category
	}

	isGroupCategory(categoryId: number): boolean {
		const category = categoryList.find(
			(category) => category.id == categoryId,
		)
		return category?.type == CategoryType.GRP
	}

	addCategory(
		creatorId: number,
		categoryName: string,
		categoryType: CategoryType,
	): Observable<Category> {
		categoryList.push({
			id: categoryList.length + 1,
			creatorId: creatorId,
			name: categoryName,
			type: categoryType,
		})

		return of(categoryList[categoryList.length - 1])
	}

	addMember(categoryId: number, user: User): void {
		const category = categoryList.find((c) => c.id == categoryId)
		if (category?.members) {
			category.members?.push({
				userId: user.id,
				username: user.username,
			})
		}
	}

	editCategory(category: Category): Observable<Category> {
		const index = categoryList.findIndex((c) => c.id == category.id)
		categoryList[index] = category

		return of(categoryList[index])
	}

	deleteCategory(id: number): void {
		const index = categoryList.findIndex((c) => c.id == id)
		categoryList.splice(index, 1)
	}
}
