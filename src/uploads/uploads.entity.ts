import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToMany,
} from 'typeorm';
import { FileTypes } from './enums/file-types';
import { Post } from 'src/posts/post.entity';

@Entity()
export class Uploads {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'varchar',
    length: 1024,
    nullable: false,
  })
  url: string;

  @Column({
    type: 'varchar',
    length: 1024,
    nullable: false,
  })
  name: string;

  @Column({
    type: 'enum',
    enum: FileTypes,
    default: FileTypes.IMAGE,
  })
  type: FileTypes;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: false,
  })
  mime: string;

  @Column({
    type: 'int',
    nullable: false,
  })
  size: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToMany(() => Post, (post) => post.uploadedFiles)
  posts: Post[];
}
