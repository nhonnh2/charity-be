import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PostsController } from './posts.controller';
import { PostsService } from './posts.service';
import { Post, PostSchema } from './entities/post.entity';
import { PostLike, PostLikeSchema } from './entities/post-like.entity';
import { PostComment, PostCommentSchema } from './entities/post-comment.entity';
import { PostShare, PostShareSchema } from './entities/post-share.entity';
import { PostView, PostViewSchema } from './entities/post-view.entity';
import { PostInteraction, PostInteractionSchema } from './entities/post-interaction.entity';
import { User, UserSchema } from '../users/entities/user.entity';
import { DatabaseService } from '../../shared/services/database.service';
import { DatabaseTransactionService } from '../../shared/services/database-transaction.service';

// Import new services
import { PostLikesService } from './services/post-likes.service';
import { PostCommentsService } from './services/post-comments.service';
import { PostSharesService } from './services/post-shares.service';
import { PostViewsService } from './services/post-views.service';

// Import new controllers
import { PostLikesController, UserLikesController } from './controllers/post-likes.controller';
import { PostCommentsController, CommentManagementController, UserCommentsController } from './controllers/post-comments.controller';
import { PostSharesController, UserSharesController, TrendingSharesController } from './controllers/post-shares.controller';
import { PostViewsController, UserViewsController, TrendingViewsController } from './controllers/post-views.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Post.name, schema: PostSchema },
      { name: PostLike.name, schema: PostLikeSchema },
      { name: PostComment.name, schema: PostCommentSchema },
      { name: PostShare.name, schema: PostShareSchema },
      { name: PostView.name, schema: PostViewSchema },
      // Keep old PostInteraction for migration period
      { name: PostInteraction.name, schema: PostInteractionSchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  controllers: [
    // Main posts controller
    PostsController,
    // New interaction controllers
    PostLikesController,
    UserLikesController,
    PostCommentsController,
    CommentManagementController,
    UserCommentsController,
    PostSharesController,
    UserSharesController,
    TrendingSharesController,
    PostViewsController,
    UserViewsController,
    TrendingViewsController,
  ],
  providers: [
    // Main posts service
    PostsService,
    // New interaction services
    PostLikesService,
    PostCommentsService,
    PostSharesService,
    PostViewsService,
    // Database services
    DatabaseService,
    DatabaseTransactionService,
  ],
  exports: [
    PostsService,
    PostLikesService,
    PostCommentsService,
    PostSharesService,
    PostViewsService,
  ],
})
export class PostsModule {}
