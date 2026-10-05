import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { BookController } from '../controllers/book.controller';
import { InteractionController } from '../controllers/interaction.controller';
import { authMiddleware, optionalAuthMiddleware } from '../middleware/auth';

const router = Router();

router.post('/auth/register', AuthController.register);
router.post('/auth/login', AuthController.login);
router.get('/auth/me', authMiddleware, AuthController.me);
router.put('/auth/username', authMiddleware, AuthController.updateUsername);
router.put('/auth/password', authMiddleware, AuthController.updatePassword);

router.get('/books/search', BookController.search);
router.get('/books/:olid', optionalAuthMiddleware, BookController.getDetails);

router.post('/books/:olid/like', authMiddleware, InteractionController.toggleLike);
router.get('/user/likes', authMiddleware, InteractionController.getLikes);

router.post('/books/:olid/comments', authMiddleware, InteractionController.createComment);
router.get('/books/:olid/comments', InteractionController.getBookComments);
router.put('/comments/:commentId', authMiddleware, InteractionController.updateComment);
router.delete('/comments/:commentId', authMiddleware, InteractionController.deleteComment);
router.get('/user/comments', authMiddleware, InteractionController.getUserComments);

router.post('/books/:olid/reading-list', authMiddleware, InteractionController.addToReadingList);
router.delete('/books/:olid/reading-list', authMiddleware, InteractionController.removeFromReadingList);
router.get('/user/reading-list', authMiddleware, InteractionController.getReadingList);

router.get('/user/books/search', authMiddleware, InteractionController.searchMyBooks);

export default router;
