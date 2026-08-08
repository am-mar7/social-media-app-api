import { Post } from 'src/posts/post.entity';
import { User } from 'src/users/user.entity';
import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Comment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  content: string;

  @ManyToOne(() => Comment, (comment) => comment.replies, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  parentComment?: Comment;

  @OneToMany(() => Comment, (comment) => comment.parentComment, {})
  replies?: Comment[];

  @ManyToOne(() => User, (user) => user.comments, { nullable: false })
  commenter: User;

  @ManyToOne(() => Post, (post) => post.comments, { nullable: false })
  post: Post;

  @ManyToOne(() => User, (user) => user.id, { nullable: true })
  repliedTo?: User;
}
