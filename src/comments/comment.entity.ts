import { Post } from 'src/posts/post.entity';
import { Uploads } from 'src/uploads/uploads.entity';
import { User } from 'src/users/user.entity';
import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  JoinColumn,
} from 'typeorm';

@Entity()
export class Comment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    nullable: true,
  })
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

  @OneToOne(() => Uploads, { nullable: true })
  @JoinColumn()
  uploadedFileUrl?: Uploads | null;
}
