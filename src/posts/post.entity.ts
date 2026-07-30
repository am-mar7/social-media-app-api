import {
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { PostStatus, PostType } from './enums';
import { MetaOption } from 'src/meta-options/meta-option.entity';
import { Tag } from 'src/tags/tag.entity';
import { User } from 'src/users/user.entity';

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


  @OneToOne(() => MetaOption, (metaOptions) => metaOptions.post, {
    cascade: true,
  })
  metaOptions?: MetaOption;

  @ManyToOne(() => User , (user) => user.posts)
  @JoinColumn()
  author: User;

  @ManyToMany(() => Tag , (tag) => tag.posts)
  @JoinTable()
  tags?: Tag[];
}
