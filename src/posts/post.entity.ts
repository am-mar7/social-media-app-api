import {
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Comment } from 'src/comments/comment.entity';
import { PostStatus, PostType } from './enums';
import { MetaOption } from 'src/meta-options/meta-option.entity';
import { Tag } from 'src/tags/tag.entity';
import { User } from 'src/users/user.entity';
import { Uploads } from 'src/uploads/uploads.entity';

@Entity()
export class Post {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'varchar',
    length: 96,
    nullable: false,
  })
  title: string;

  @Column({
    type: 'enum',
    enum: PostType,
    nullable: false,
    default: PostType.other,
  })
  postType: PostType;

  @Column({
    type: 'varchar',
    length: 96,
    nullable: false,
    unique: true,
  })
  slug: string;

  @Column({
    type: 'enum',
    enum: PostStatus,
    nullable: false,
    default: PostStatus.draft,
  })
  status: PostStatus;

  @Column({
    type: 'text',
    nullable: true,
  })
  content?: string;

  @Column({
    type: 'json',
    nullable: true,
  })
  schema?: string;

  @Column({
    type: 'varchar',
    length: 1024,
    nullable: true,
  })
  featuredImageUrl?: string;

  @Column({
    type: 'timestamp', // datetime in my mysql
    nullable: true,
  })
  publishedAt?: Date;

  @OneToMany(() => MetaOption, (metaOption) => metaOption.post, {
    cascade: true,
  })
  metaOptions?: MetaOption[];

  @ManyToOne(() => User, (user) => user.posts)
  @JoinColumn()
  author: User;

  @ManyToMany(() => Tag, (tag) => tag.posts)
  @JoinTable()
  tags?: Tag[];

  @OneToMany(() => Comment, (comment) => comment.post)
  comments?: Comment[];

  @ManyToMany(() => Uploads, (upload) => upload.posts)
  @JoinTable()
  uploadedFiles?: Uploads[];
}
