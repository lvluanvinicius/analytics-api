import { Router } from "express";
import UsersController from "../Http/Controllers/UsersController";
import jwtProtected from "../Http/Middlewares/JwtMiddleware";


const usersRouter = Router();

const controllers = {
    usersController: new UsersController(),
}

/**
 * Rota de Login - sem restrições por token.
 */
usersRouter.post("/login", controllers.usersController.login);

/**
 * Rotas de manipulação de usuários.
 * Protegidas pelo middleware de jwtProtected.
 */
usersRouter.get("/get/:type/:username?", jwtProtected, controllers.usersController.getUsers);

usersRouter.post("/create", jwtProtected, controllers.usersController.create);

usersRouter.post("/reset-password", jwtProtected, controllers.usersController.resetPassword);

usersRouter.post("/delete", jwtProtected, controllers.usersController.delete);

export default usersRouter;