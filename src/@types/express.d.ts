import { Users } from '@prisma/client'

declare global {
	namespace Express {
		export interface Request {
			user: Partial<Users>
		}
	}
}