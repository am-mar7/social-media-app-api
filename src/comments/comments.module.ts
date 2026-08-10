import { Module } from '@nestjs/common';
import { CommentsController } from './comments.controller';
import { CommentsService } from './providers/comments.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from 'src/users/users.module';
import { PostsModule } from 'src/posts/posts.module';
import { Comment } from './comment.entity';
import { UploadsModule } from 'src/uploads/uploads.module';

@Module({
  controllers: [CommentsController],
  providers: [CommentsService],
  imports: [
    TypeOrmModule.forFeature([Comment]),
    UsersModule,
    PostsModule,
    UploadsModule,
  ],
})
export class CommentsModule {}
