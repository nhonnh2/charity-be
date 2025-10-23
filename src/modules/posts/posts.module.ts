import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PostsController } from './posts.controller';
import { PostsService } from './posts.service';
import { Post, PostSchema } from './entities/post.entity';
import { PostInteraction, PostInteractionSchema } from './entities/post-interaction.entity';
import { User, UserSchema } from '../users/entities/user.entity';
import { DatabaseService } from '../../shared/services/database.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Post.name, schema: PostSchema },
      { name: PostInteraction.name, schema: PostInteractionSchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  controllers: [PostsController],
  providers: [PostsService, DatabaseService],
  exports: [PostsService],
})
export class PostsModule {}
